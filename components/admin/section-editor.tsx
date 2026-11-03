"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EntityManager } from "@/components/admin/entity-manager";
import { useAdminData } from "@/components/admin/admin-context";
import { ConfirmDialog, SectionHeader, Toggle } from "@/components/admin/ui";
import { Icon } from "@/components/ui/icon";
import { createContent, listContent, updateContent, type EntityRecord } from "@/lib/admin";
import type { SectionPageConfig } from "@/lib/section-pages";

/**
 * Shared shell for every homepage component page.
 *
 * The generic `<EntityManager>` already owns the schema-driven form, validation
 * and AI fill, so this core only adds the experience the CMS spec asks for on
 * top of it: an on/off switch for the homepage block (backed by the matching
 * `sections` document), a live preview link, a destructive "revert unsaved", and
 * an unsaved-changes guard (in-page banner plus a native beforeunload prompt).
 */
export function SectionEditor({ config }: { config: SectionPageConfig }) {
  const { types, loading, error } = useAdminData();
  const type = useMemo(() => types.find((item) => item.key === config.entity), [types, config.entity]);

  // Homepage visibility is driven by the `sections` document for this block.
  const [sectionDoc, setSectionDoc] = useState<EntityRecord | null>(null);
  const [visible, setVisible] = useState(true);
  const [busyToggle, setBusyToggle] = useState(false);
  const [status, setStatus] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const statusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Unsaved-changes tracking, fed by the embedded entity form.
  const [dirty, setDirty] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [revertOpen, setRevertOpen] = useState(false);

  const hasToggle = Boolean(config.sectionKey);

  const flash = useCallback((tone: "success" | "error", text: string) => {
    setStatus({ tone, text });
    if (statusTimer.current) clearTimeout(statusTimer.current);
    statusTimer.current = setTimeout(() => setStatus(null), 4000);
  }, []);

  // Locate this block's `sections` row so the switch reads the published state.
  useEffect(() => {
    if (!hasToggle) return;
    let cancelled = false;
    listContent("sections", { limit: 100 })
      .then((result) => {
        if (cancelled) return;
        const found = result.items.find((item) => item.key === config.sectionKey) ?? null;
        setSectionDoc(found);
        setVisible(found ? found.isVisible !== false : true);
      })
      .catch(() => {
        if (!cancelled) setVisible(true);
      });
    return () => {
      cancelled = true;
    };
  }, [config.sectionKey, hasToggle]);

  // Warn before leaving with unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  async function toggleVisible(next: boolean) {
    setBusyToggle(true);
    try {
      if (sectionDoc) {
        const saved = await updateContent("sections", sectionDoc._id, { isVisible: next });
        setSectionDoc(saved);
      } else {
        const created = await createContent("sections", {
          key: config.sectionKey,
          label: config.title,
          isVisible: next,
          order: 99,
        });
        setSectionDoc(created);
      }
      setVisible(next);
      flash("success", next ? "Block is now visible on the site." : "Block hidden from the site.");
    } catch {
      flash("error", "Could not update this block's visibility.");
    } finally {
      setBusyToggle(false);
    }
  }

  if (loading && !type) {
    return (
      <div className="flex items-center gap-2 text-[12.5px] text-faint">
        <Icon name="Loader" className="h-4 w-4 animate-spin" />
        Loading the content schema…
      </div>
    );
  }

  if (error) {
    return (
      <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-[12.5px] text-danger">
        {error}
      </p>
    );
  }

  if (!type) {
    return (
      <p className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-[12.5px] text-warning">
        The “{config.entity}” content type is not available from the API yet.
      </p>
    );
  }

  const previewHref = `/#${config.anchor}`;

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Homepage block"
        title={config.title}
        description={config.description}
        icon={config.icon}
        actions={
          <>
            {config.anchor ? (
              <a
                href={previewHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-[12px] font-medium text-muted transition-colors hover:border-line-strong hover:text-accent"
              >
                <Icon name="ExternalLink" className="h-3.5 w-3.5" />
                Preview
              </a>
            ) : null}
            <button
              type="button"
              onClick={() => setRevertOpen(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-[12px] font-medium text-muted transition-colors hover:border-line-strong hover:text-ink"
            >
              <Icon name="RefreshCw" className="h-3.5 w-3.5" />
              Revert
            </button>
          </>
        }
      />

      {hasToggle ? (
        <div className="panel flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-ink">Show on homepage</p>
            <p className="mt-0.5 text-[11.5px] text-muted">
              Turns the entire <span className="mono text-accent">#{config.sectionKey}</span> block on
              or off across the navbar, dock, palette and page.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <span className={`mono text-[10px] uppercase tracking-[0.14em] ${visible ? "text-success" : "text-faint"}`}>
              {visible ? "Visible" : "Hidden"}
            </span>
            <Toggle
              label={`Show ${config.title} on homepage`}
              checked={visible}
              disabled={busyToggle}
              onChange={(next) => void toggleVisible(next)}
            />
          </div>
        </div>
      ) : null}

      {status ? (
        <p
          role="status"
          className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-[12px] ${
            status.tone === "error"
              ? "border-danger/30 bg-danger/10 text-danger"
              : "border-accent/30 bg-accent/10 text-accent"
          }`}
        >
          <Icon name={status.tone === "error" ? "X" : "Check"} className="h-3.5 w-3.5 shrink-0" />
          {status.text}
        </p>
      ) : null}

      {dirty ? (
        <p className="flex items-center gap-2 rounded-xl border border-warning/35 bg-warning/10 px-3.5 py-2.5 text-[12px] text-warning">
          <Icon name="AlertTriangle" className="h-3.5 w-3.5 shrink-0" />
          You have unsaved changes on this page. Use the form’s Save button, or Revert to discard them.
        </p>
      ) : null}

      {/* Re-keying remounts the editor so a revert discards the working copy. */}
      <EntityManager key={`${type.key}-${formKey}`} type={type} onDirtyChange={setDirty} />

      <ConfirmDialog
        open={revertOpen}
        title="Discard unsaved changes?"
        message="This reloads the editor from the last saved version. Anything you have typed but not saved will be lost."
        confirmLabel="Discard & reload"
        onConfirm={() => {
          setFormKey((value) => value + 1);
          setDirty(false);
          setRevertOpen(false);
          flash("success", "Editor reloaded from the saved version.");
        }}
        onCancel={() => setRevertOpen(false)}
      />
    </div>
  );
}
