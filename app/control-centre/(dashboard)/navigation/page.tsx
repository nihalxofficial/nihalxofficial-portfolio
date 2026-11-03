"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ConfirmDialog, EmptyState, SectionHeader, Toggle } from "@/components/admin/ui";
import { Icon } from "@/components/ui/icon";
import {
  AdminApiError,
  createContent,
  deleteContent,
  listContent,
  updateContent,
  type EntityRecord,
} from "@/lib/admin";

/**
 * Navigation Manager.
 *
 * One screen to publish the site menu: drag to reorder, flip visibility, rename
 * inline, add or remove links, and mark external destinations to open in a new
 * tab. Everything writes straight to the `navigation` collection through the
 * existing admin API; the public navbar, dock, mobile nav, footer and command
 * palette read the same documents, so changes land after the 30s revalidation.
 */

interface NavRow {
  _id: string;
  label: string;
  href: string;
  icon: string;
  isPrimary: boolean;
  opensInNewTab: boolean;
  isVisible: boolean;
  order: number;
}

function toRow(record: EntityRecord): NavRow {
  return {
    _id: record._id,
    label: String(record.label ?? ""),
    href: String(record.href ?? ""),
    icon: String(record.icon ?? ""),
    isPrimary: record.isPrimary === true,
    opensInNewTab: record.opensInNewTab === true,
    isVisible: record.isVisible !== false,
    order: Number(record.order ?? 0),
  };
}

function isExternal(href: string): boolean {
  const value = href.trim().toLowerCase();
  return value.startsWith("http://") || value.startsWith("https://") || value.startsWith("//");
}

function toMessage(cause: unknown, fallback: string): string {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}

export default function NavigationManagerPage() {
  const [rows, setRows] = useState<NavRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<NavRow | null>(null);
  const [busy, setBusy] = useState(false);

  const [draft, setDraft] = useState({ label: "", href: "", icon: "", isPrimary: false, opensInNewTab: false });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function load() {
    setLoading(true);
    try {
      const result = await listContent("navigation", { limit: 100 });
      setRows(result.items.map(toRow).sort((a, b) => a.order - b.order));
      setError("");
    } catch (cause) {
      setError(toMessage(cause, "Could not load the navigation."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const announce = (tone: "success" | "error", text: string) => {
    setFlash({ tone, text });
    setTimeout(() => setFlash(null), 4000);
  };

  function patchRow(id: string, next: Partial<NavRow>) {
    setRows((items) => items.map((item) => (item._id === id ? { ...item, ...next } : item)));
  }

  async function persist(id: string, fields: Partial<NavRow>) {
    const previous = rows.find((row) => row._id === id);
    patchRow(id, fields);
    try {
      await updateContent("navigation", id, fields as Record<string, unknown>);
    } catch (cause) {
      // Roll back the optimistic change so the row never lies.
      if (previous) patchRow(id, previous);
      announce("error", toMessage(cause, "Could not save that change."));
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = rows.findIndex((row) => row._id === active.id);
    const newIndex = rows.findIndex((row) => row._id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const previousOrder = new Map(rows.map((row) => [row._id, row.order]));
    const reordered = arrayMove(rows, oldIndex, newIndex).map((row, index) => ({
      ...row,
      order: index + 1,
    }));
    setRows(reordered);

    // Persist only the rows whose order actually changed.
    setBusy(true);
    try {
      await Promise.all(
        reordered
          .filter((row) => previousOrder.get(row._id) !== row.order)
          .map((row) => updateContent("navigation", row._id, { order: row.order })),
      );
      announce("success", "Order saved.");
    } catch (cause) {
      announce("error", toMessage(cause, "Could not save the new order."));
      void load();
    } finally {
      setBusy(false);
    }
  }

  async function addLink() {
    const label = draft.label.trim();
    const href = draft.href.trim();
    if (!label || !href) {
      announce("error", "A label and a destination are both required.");
      return;
    }
    setBusy(true);
    try {
      const created = await createContent("navigation", {
        label,
        href,
        icon: draft.icon.trim() || "Globe",
        isPrimary: draft.isPrimary,
        opensInNewTab: isExternal(href) ? draft.opensInNewTab : false,
        isVisible: true,
        order: rows.length + 1,
      });
      setRows((items) => [...items, toRow(created)]);
      setDraft({ label: "", href: "", icon: "", isPrimary: false, opensInNewTab: false });
      announce("success", "Link added.");
    } catch (cause) {
      announce("error", toMessage(cause, "Could not add that link."));
    } finally {
      setBusy(false);
    }
  }

  async function removeRow(row: NavRow) {
    setBusy(true);
    try {
      await deleteContent("navigation", row._id);
      setRows((items) => items.filter((item) => item._id !== row._id));
      setPendingDelete(null);
      announce("success", `Removed “${row.label}”.`);
    } catch (cause) {
      announce("error", toMessage(cause, "Could not delete that link."));
    } finally {
      setBusy(false);
    }
  }

  const visibleCount = useMemo(() => rows.filter((row) => row.isVisible).length, [rows]);

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Content Management"
        title="Navigation Manager"
        description="Reorder, rename, publish and remove the links shown across the site menu."
        icon="Compass"
        actions={
          <span className="mono rounded-full border border-line px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-faint">
            {visibleCount} / {rows.length} published
          </span>
        }
      />

      {error ? (
        <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-[12.5px] text-danger">
          {error}
        </p>
      ) : null}

      {flash ? (
        <p
          className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-[12px] ${
            flash.tone === "success"
              ? "border-accent/30 bg-accent/10 text-accent"
              : "border-danger/30 bg-danger/10 text-danger"
          }`}
        >
          <Icon name={flash.tone === "success" ? "Check" : "X"} className="h-3.5 w-3.5" />
          {flash.text}
        </p>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-2 rounded-xl border border-line bg-surface-2/40 px-4 py-6 text-[12px] text-faint">
          <Icon name="Loader" className="h-4 w-4 animate-spin" />
          Loading navigation…
        </div>
      ) : rows.length === 0 ? (
        <EmptyState icon="Compass" title="No navigation links yet" description="Add your first link below." />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={rows.map((row) => row._id)} strategy={verticalListSortingStrategy}>
            <ul className="panel divide-y divide-line overflow-hidden">
              {rows.map((row) => (
                <SortableRow
                  key={row._id}
                  row={row}
                  busy={busy}
                  onLabel={(value) => void persist(row._id, { label: value })}
                  onHref={(value) => void persist(row._id, { href: value })}
                  onVisible={(value) => void persist(row._id, { isVisible: value })}
                  onPrimary={(value) => void persist(row._id, { isPrimary: value })}
                  onNewTab={(value) => void persist(row._id, { opensInNewTab: value })}
                  onDelete={() => setPendingDelete(row)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      {/* Add link */}
      <section className="panel p-4">
        <h2 className="text-[13.5px] font-semibold text-ink">Add a link</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-1.5">
            <span className="mono text-[10px] uppercase tracking-[0.16em] text-faint">Label</span>
            <input
              value={draft.label}
              onChange={(event) => setDraft((d) => ({ ...d, label: event.target.value }))}
              placeholder="Pricing"
              className="h-9 rounded-lg border border-line bg-surface-2/50 px-3 text-[12px] text-ink outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="mono text-[10px] uppercase tracking-[0.16em] text-faint">Destination</span>
            <input
              value={draft.href}
              onChange={(event) => setDraft((d) => ({ ...d, href: event.target.value }))}
              placeholder="#pricing or https://…"
              className="h-9 rounded-lg border border-line bg-surface-2/50 px-3 text-[12px] text-ink outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="mono text-[10px] uppercase tracking-[0.16em] text-faint">Icon name</span>
            <input
              value={draft.icon}
              onChange={(event) => setDraft((d) => ({ ...d, icon: event.target.value }))}
              placeholder="Sparkles"
              className="h-9 rounded-lg border border-line bg-surface-2/50 px-3 text-[12px] text-ink outline-none focus:border-accent"
            />
          </label>
          <div className="flex items-end">
            <button
              type="button"
              disabled={busy}
              onClick={() => void addLink()}
              className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg grad-accent px-3 text-[12px] font-semibold text-accent-ink disabled:opacity-60"
            >
              <Icon name="Plus" className="h-3.5 w-3.5" />
              Add link
            </button>
          </div>
        </div>
        <p className="mono mt-3 rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[10.5px] leading-relaxed text-faint">
          Internal anchors start with # (e.g. #contact). Full URLs are treated as external and can open
          in a new tab. Disabled links vanish from the navbar, dock, footer and command palette.
        </p>
      </section>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this link?"
        message={`“${pendingDelete?.label ?? ""}” will be removed from the navigation. This cannot be undone.`}
        busy={busy}
        onConfirm={() => pendingDelete && void removeRow(pendingDelete)}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

function SortableRow({
  row,
  busy,
  onLabel,
  onHref,
  onVisible,
  onPrimary,
  onNewTab,
  onDelete,
}: {
  row: NavRow;
  busy: boolean;
  onLabel: (value: string) => void;
  onHref: (value: string) => void;
  onVisible: (value: boolean) => void;
  onPrimary: (value: boolean) => void;
  onNewTab: (value: boolean) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row._id });
  const external = isExternal(row.href);

  const [label, setLabel] = useState(row.label);
  const [href, setHref] = useState(row.href);
  useEffect(() => setLabel(row.label), [row.label]);
  useEffect(() => setHref(row.href), [row.href]);

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex flex-wrap items-center gap-3 px-3 py-2.5 ${isDragging ? "relative z-10 bg-surface-2/70" : ""} ${
        !row.isVisible ? "opacity-60" : ""
      }`}
    >
      <button
        type="button"
        aria-label="Drag to reorder"
        className="grid h-8 w-6 shrink-0 cursor-grab place-items-center rounded text-faint hover:text-accent active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
      >
        <Icon name="GripVertical" className="h-4 w-4" />
      </button>

      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line bg-page text-accent">
        <Icon name={row.icon || "Globe"} className="h-4 w-4" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-row sm:items-center">
        <input
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          onBlur={() => label.trim() && label !== row.label && onLabel(label.trim())}
          aria-label="Link label"
          className="h-8 w-full rounded-lg border border-transparent bg-transparent px-1 text-[13px] font-medium text-ink outline-none transition-colors hover:border-line focus:border-accent sm:max-w-40"
        />
        <input
          value={href}
          onChange={(event) => setHref(event.target.value)}
          onBlur={() => href.trim() && href !== row.href && onHref(href.trim())}
          aria-label="Link destination"
          className="mono h-8 w-full flex-1 rounded-lg border border-transparent bg-transparent px-1 text-[11px] text-faint outline-none transition-colors hover:border-line focus:border-accent"
        />
        {external ? (
          <span className="mono shrink-0 rounded-full border border-line px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] text-faint">
            external
          </span>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {external ? (
          <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-faint">
            New tab
            <Toggle
              size="sm"
              label="Open in new tab"
              checked={row.opensInNewTab}
              disabled={busy}
              onChange={onNewTab}
            />
          </label>
        ) : (
          <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-faint">
            Dock
            <Toggle
              size="sm"
              label="Pin to mobile dock"
              checked={row.isPrimary}
              disabled={busy}
              onChange={onPrimary}
            />
          </label>
        )}

        <Toggle label={`Show ${row.label}`} checked={row.isVisible} disabled={busy} onChange={onVisible} />

        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete ${row.label}`}
          className="grid h-8 w-8 place-items-center rounded-lg border border-line text-faint transition-colors hover:border-danger/40 hover:text-danger"
        >
          <Icon name="Trash" className="h-3.5 w-3.5" />
        </button>
      </div>
    </li>
  );
}
