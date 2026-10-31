"use client";

import { Button, Label, TextField, Input } from "@heroui/react";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { AiFill } from "@/components/admin/ai-fill";
import { FieldGrid, type FieldErrors } from "@/components/admin/field-control";
import { Icon } from "@/components/ui/icon";
import {
  AdminApiError,
  createContent,
  deleteContent,
  listContent,
  readContent,
  updateContent,
  type ContentType,
  type EntityRecord,
} from "@/lib/admin";
import { formatDate } from "@/lib/utils";

/**
 * Generic CRUD surface for one registry entity.
 *
 * Collections (projects, posts, skills…) get a searchable table with a slide
 * over editor; singletons (hero, about, settings) get a single inline form. Both
 * reuse the same schema driven field editor and the AI fill panel.
 */

const META_KEYS = new Set(["_id", "__v", "createdAt", "updatedAt"]);

interface FlashMessage {
  tone: "success" | "error";
  text: string;
}

function toErrors(cause: unknown): FieldErrors {
  if (cause instanceof AdminApiError && cause.fields.length > 0) {
    return Object.fromEntries(cause.fields.map((field) => [field.field, field.message]));
  }
  return {};
}

function toMessage(cause: unknown, fallback: string): string {
  if (cause instanceof AdminApiError) return cause.message;
  if (cause instanceof Error && cause.message) return cause.message;
  return fallback;
}

/** The API only writes registry fields anyway; this keeps `_id` out of drafts. */
function stripMeta(values: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(values).filter(([key]) => !META_KEYS.has(key)));
}

export function blankDraft(type: ContentType): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const field of type.fields) {
    if (field.name === "isVisible" || field.name === "isPublished") values[field.name] = true;
  }
  return values;
}

function useFlash() {
  const [flash, setFlash] = useState<FlashMessage | null>(null);

  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(null), 4500);
    return () => clearTimeout(timer);
  }, [flash]);

  return [flash, setFlash] as const;
}

function Flash({ flash }: { flash: FlashMessage | null }) {
  if (!flash) return null;

  const tone =
    flash.tone === "error"
      ? "border-danger/30 bg-danger/10 text-danger"
      : "border-accent/30 bg-accent/10 text-accent";

  return (
    <p role="status" className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-[12px] ${tone}`}>
      <Icon name={flash.tone === "error" ? "X" : "Check"} className="h-3.5 w-3.5 shrink-0" />
      {flash.text}
    </p>
  );
}

function Loading({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-line bg-surface-2/40 px-4 py-6 text-[12px] text-faint">
      <Icon name="Loader" className="h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}

// ─── Editor form ─────────────────────────────────────────────────────────────

interface EntityFormProps {
  type: ContentType;
  initial: Record<string, unknown>;
  busy: boolean;
  errors: FieldErrors;
  submitLabel: string;
  showAi: boolean;
  onSubmit: (values: Record<string, unknown>) => void;
  onCancel: () => void;
}

function EntityForm({
  type,
  initial,
  busy,
  errors,
  submitLabel,
  showAi,
  onSubmit,
  onCancel,
}: EntityFormProps) {
  const [values, setValues] = useState<Record<string, unknown>>(initial);
  const [missing, setMissing] = useState<string[]>([]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(stripMeta(values));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {showAi ? (
        <AiFill
          entity={type.key}
          label={type.label}
          current={stripMeta(values)}
          disabled={busy}
          onFill={(fields, missingRequired) => {
            setValues((previous) => ({ ...previous, ...fields }));
            setMissing(missingRequired);
          }}
        />
      ) : null}

      {missing.length ? (
        <p className="rounded-lg border border-warning/35 bg-warning/10 px-3 py-2 text-[11.5px] leading-relaxed text-warning">
          Required fields still empty: {missing.join(", ")}
        </p>
      ) : null}

      <FieldGrid
        fields={type.fields}
        values={values}
        errors={errors}
        disabled={busy}
        onChange={(name, value) => setValues((previous) => ({ ...previous, [name]: value }))}
      />

      <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3.5">
        <Button
          type="submit"
          isDisabled={busy}
          className="h-10 rounded-lg grad-accent px-4 text-[12.5px] font-semibold text-accent-ink"
        >
          {busy ? (
            <>
              <Icon name="Loader" className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Icon name="Save" className="h-4 w-4" />
              {submitLabel}
            </>
          )}
        </Button>

        <Button
          type="button"
          isDisabled={busy}
          onPress={onCancel}
          className="h-10 rounded-lg border border-line bg-transparent px-4 text-[12.5px] font-medium text-muted"
        >
          Cancel
        </Button>

        <p className="mono ml-auto text-[10px] text-faint">
          {type.fields.filter((field) => field.required).length} required field
          {type.fields.filter((field) => field.required).length === 1 ? "" : "s"}
        </p>
      </div>
    </form>
  );
}

// ─── Singleton editor ────────────────────────────────────────────────────────

function SingletonEditor({ type }: { type: ContentType }) {
  const [record, setRecord] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [flash, setFlash] = useFlash();
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    readContent(type.key, "current")
      .then((value) => {
        if (!cancelled) setRecord(value);
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        // A singleton that has never been saved is a normal first run, not an error.
        if (cause instanceof AdminApiError && cause.status === 404) setRecord({});
        else setFlash({ tone: "error", text: toMessage(cause, "Could not load this section.") });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [type.key, nonce, setFlash]);

  async function save(values: Record<string, unknown>) {
    setBusy(true);
    setErrors({});

    try {
      const saved = await updateContent(type.key, "current", values);
      setRecord(saved);
      setFlash({ tone: "success", text: `${type.label} saved.` });
    } catch (cause) {
      setErrors(toErrors(cause));
      setFlash({ tone: "error", text: toMessage(cause, "Could not save this section.") });
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Loading label={`Loading ${type.label.toLowerCase()}…`} />;

  return (
    <div className="space-y-4">
      <Flash flash={flash} />

      <section className="panel p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-[13.5px] font-semibold text-ink">{type.label}</h2>
            <p className="mono mt-0.5 text-[10px] uppercase tracking-[0.14em] text-faint">
              single document · saved directly to the public site
            </p>
          </div>
          <button
            type="button"
            onClick={() => setNonce((value) => value + 1)}
            className="mono inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-[9.5px] uppercase tracking-[0.14em] text-faint transition-colors hover:border-line-strong hover:text-accent"
          >
            <Icon name="Loader" className="h-3 w-3" />
            reload
          </button>
        </div>

        <EntityForm
          key={nonce}
          type={type}
          initial={record ?? {}}
          busy={busy}
          errors={errors}
          submitLabel="Save changes"
          showAi
          onSubmit={(values) => void save(values)}
          onCancel={() => setNonce((value) => value + 1)}
        />
      </section>
    </div>
  );
}

// ─── Collection editor ───────────────────────────────────────────────────────

type Draft =
  | { mode: "create"; values: Record<string, unknown> }
  | { mode: "edit"; id: string; values: Record<string, unknown> };

function CollectionEditor({ type }: { type: ContentType }) {
  const [items, setItems] = useState<EntityRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [flash, setFlash] = useFlash();

  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pendingDelete, setPendingDelete] = useState<EntityRecord | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(query.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    listContent(type.key, { page, limit: 12, q: search })
      .then((result) => {
        if (cancelled) return;
        setItems(result.items);
        setTotal(result.meta.total);
        setPages(result.meta.totalPages);
        setError("");
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setError(toMessage(cause, `Could not load ${type.label.toLowerCase()}.`));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [type.key, type.label, page, search, nonce]);

  const previewFields = useMemo(
    () =>
      type.fields
        .filter((field) => field.name !== type.titleField)
        .filter((field) => ["string", "slug", "url"].includes(field.kind))
        .slice(0, 2),
    [type.fields, type.titleField],
  );

  const flags = useMemo(
    () =>
      type.fields
        .filter((field) => field.kind === "boolean")
        .map((field) => field.name)
        .filter((name) => ["isPublished", "isVisible", "isFeatured"].includes(name)),
    [type.fields],
  );

  function openCreate() {
    setErrors({});
    setDraft({ mode: "create", values: blankDraft(type) });
  }

  function openEdit(record: EntityRecord) {
    setErrors({});
    setDraft({ mode: "edit", id: record._id, values: stripMeta(record) });
  }

  async function save(values: Record<string, unknown>) {
    if (!draft) return;
    setBusy(true);
    setErrors({});

    try {
      if (draft.mode === "create") {
        await createContent(type.key, values);
        setFlash({ tone: "success", text: `${type.label} record created.` });
      } else {
        await updateContent(type.key, draft.id, values);
        setFlash({ tone: "success", text: `${type.label} record updated.` });
      }
      setDraft(null);
      setNonce((value) => value + 1);
    } catch (cause) {
      setErrors(toErrors(cause));
      setFlash({ tone: "error", text: toMessage(cause, "Could not save this record.") });
    } finally {
      setBusy(false);
    }
  }

  async function remove(record: EntityRecord) {
    setBusy(true);

    try {
      await deleteContent(type.key, record._id);
      setPendingDelete(null);
      setFlash({ tone: "success", text: `${type.label} record deleted.` });
      setNonce((value) => value + 1);
    } catch (cause) {
      setFlash({ tone: "error", text: toMessage(cause, "Could not delete this record.") });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <Flash flash={flash} />
      {error ? (
        <p className="rounded-xl border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-[12px] text-danger">
          {error}
        </p>
      ) : null}

      <section className="panel overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
          <TextField
            value={query}
            onChange={setQuery}
            className="flex min-w-[190px] flex-1 items-center gap-2"
          >
            <Label className="sr-only">Search {type.label}</Label>
            <Input placeholder={`Search ${type.label.toLowerCase()}…`} />
          </TextField>

          <span className="mono hidden text-[10px] uppercase tracking-[0.14em] text-faint sm:block">
            {total} record{total === 1 ? "" : "s"}
          </span>

          <button
            type="button"
            onClick={() => setNonce((value) => value + 1)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-line text-faint transition-colors hover:border-line-strong hover:text-accent"
            aria-label="Refresh"
          >
            <Icon name="Loader" className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>

          <Button
            type="button"
            onPress={openCreate}
            className="h-9 rounded-lg grad-accent px-3 text-[12px] font-semibold text-accent-ink"
          >
            <Icon name="Plus" className="h-3.5 w-3.5" />
            New
          </Button>
        </div>

        {loading && items.length === 0 ? (
          <div className="p-4">
            <Loading label={`Loading ${type.label.toLowerCase()}…`} />
          </div>
        ) : items.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <Icon name="Inbox" className="mx-auto h-6 w-6 text-faint" />
            <p className="mt-2 text-[12.5px] text-muted">
              {search ? `Nothing matches “${search}”.` : `No ${type.label.toLowerCase()} yet.`}
            </p>
            <button
              type="button"
              onClick={openCreate}
              className="mono mt-3 inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-[9.5px] uppercase tracking-[0.14em] text-faint transition-colors hover:border-line-strong hover:text-accent"
            >
              <Icon name="Plus" className="h-3 w-3" />
              create the first one
            </button>
          </div>
        ) : (
          <ul className={`divide-y divide-line ${loading ? "opacity-60" : ""}`}>
            {items.map((record) => {
              const title = String(record[type.titleField] ?? "Untitled");

              return (
                <li key={record._id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-ink">{title}</p>
                    <p className="mono mt-0.5 flex flex-wrap items-center gap-x-2 truncate text-[10px] text-faint">
                      {previewFields.map((field) => {
                        const value = record[field.name];
                        if (value === undefined || value === null || value === "") return null;
                        return (
                          <span key={field.name} className="truncate">
                            {String(value)}
                          </span>
                        );
                      })}
                      <span>{formatDate(record.updatedAt as string | undefined) || "—"}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {flags.map((name) =>
                      record[name] === true ? (
                        <span
                          key={name}
                          className="mono rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] text-accent"
                        >
                          {name.replace(/^is/, "")}
                        </span>
                      ) : null,
                    )}

                    <button
                      type="button"
                      onClick={() => openEdit(record)}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-line text-faint transition-colors hover:border-line-strong hover:text-accent"
                      aria-label={`Edit ${title}`}
                    >
                      <Icon name="Pencil" className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(record)}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-line text-faint transition-colors hover:border-danger/40 hover:text-danger"
                      aria-label={`Delete ${title}`}
                    >
                      <Icon name="Trash" className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {pages > 1 ? (
          <div className="flex items-center justify-between gap-2 border-t border-line px-4 py-2.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="mono inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-[9.5px] uppercase tracking-[0.14em] text-faint transition-colors hover:text-accent disabled:opacity-40"
            >
              <Icon name="ArrowLeft" className="h-3 w-3" />
              prev
            </button>
            <span className="mono text-[10px] text-faint">
              page {page} / {pages}
            </span>
            <button
              type="button"
              disabled={page >= pages}
              onClick={() => setPage((value) => Math.min(pages, value + 1))}
              className="mono inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-[9.5px] uppercase tracking-[0.14em] text-faint transition-colors hover:text-accent disabled:opacity-40"
            >
              next
              <Icon name="ArrowRight" className="h-3 w-3" />
            </button>
          </div>
        ) : null}
      </section>

      {draft ? (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label="Close editor"
            onClick={() => setDraft(null)}
            className="absolute inset-0 bg-page/80 backdrop-blur-sm"
          />
          <div className="relative flex h-full w-full max-w-2xl flex-col border-l border-line bg-page shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
              <div>
                <p className="mono text-[9.5px] uppercase tracking-[0.16em] text-accent">
                  {draft.mode === "create" ? "New record" : "Editing"}
                </p>
                <h2 className="text-[14px] font-semibold text-ink">
                  {type.label}
                  {draft.mode === "edit"
                    ? ` · ${String(draft.values[type.titleField] ?? "Untitled")}`
                    : ""}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="grid h-8 w-8 place-items-center rounded-lg border border-line text-faint transition-colors hover:text-accent"
                aria-label="Close"
              >
                <Icon name="X" className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <EntityForm
                key={draft.mode === "edit" ? draft.id : "create"}
                type={type}
                initial={draft.values}
                busy={busy}
                errors={errors}
                submitLabel={draft.mode === "create" ? "Create record" : "Save changes"}
                showAi
                onSubmit={(values) => void save(values)}
                onCancel={() => setDraft(null)}
              />
            </div>
          </div>
        </div>
      ) : null}

      {pendingDelete ? (
        <div className="fixed inset-0 z-50 grid place-items-center px-5">
          <button
            type="button"
            aria-label="Cancel"
            onClick={() => setPendingDelete(null)}
            className="absolute inset-0 bg-page/80 backdrop-blur-sm"
          />
          <div className="panel relative w-full max-w-sm p-5">
            <p className="flex items-center gap-2 text-[13px] font-semibold text-ink">
              <Icon name="Trash" className="h-4 w-4 text-danger" />
              Delete this record?
            </p>
            <p className="mt-2 text-[12px] leading-relaxed text-muted">
              “{String(pendingDelete[type.titleField] ?? "Untitled")}” will be removed from the
              database. This cannot be undone.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <Button
                type="button"
                isDisabled={busy}
                onPress={() => void remove(pendingDelete)}
                className="h-9 rounded-lg border border-danger/40 bg-danger/15 px-3.5 text-[12px] font-semibold text-danger"
              >
                {busy ? <Icon name="Loader" className="h-3.5 w-3.5 animate-spin" /> : null}
                Delete
              </Button>
              <Button
                type="button"
                isDisabled={busy}
                onPress={() => setPendingDelete(null)}
                className="h-9 rounded-lg border border-line bg-transparent px-3.5 text-[12px] font-medium text-muted"
              >
                Keep it
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function EntityManager({ type }: { type: ContentType }) {
  return type.singleton ? <SingletonEditor type={type} /> : <CollectionEditor type={type} />;
}
