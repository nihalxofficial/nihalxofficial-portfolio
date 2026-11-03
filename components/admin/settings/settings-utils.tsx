"use client";

import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { AdminApiError, readContent, updateContent, uploadMedia, type EntityRecord } from "@/lib/admin";
import { Icon } from "@/components/ui/icon";

/**
 * Shared plumbing for the focused Customization modules (theme, background,
 * typography, branding). Every one of them edits a single slice of the
 * `settings` singleton, so they load the whole document, mutate their own part
 * and write it back through the same generic PATCH the rest of the dashboard
 * uses — no bespoke endpoints, no duplicated save logic.
 */

export type Flash = { tone: "success" | "error"; text: string } | null;

export function toMessage(cause: unknown, fallback: string): string {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}

/**
 * Reads the settings singleton. A site that has never been saved returns a 404
 * from the API; that is a normal first run, so it resolves to an empty document
 * rather than throwing.
 */
export async function loadSettings(): Promise<EntityRecord> {
  return readContent("settings", "current").catch((cause: unknown) => {
    if (cause instanceof AdminApiError && cause.status === 404) return {} as EntityRecord;
    throw cause;
  });
}

/** PATCHes one top-level slice of the settings document (e.g. `{ theme }`). */
export function saveSettingsField(
  field: "theme" | "branding" | "typography",
  value: Record<string, unknown>,
): Promise<EntityRecord> {
  return updateContent("settings", "current", { [field]: value });
}

/** Reads an image File into a data URI exactly as the media endpoint expects. */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}

/** Uploads an image File to the media store and returns its hosted URL. */
export async function uploadImageFile(file: File, folder: string, prefix: string): Promise<string> {
  const dataUrl = await readFileAsDataUrl(file);
  const asset = await uploadMedia({
    image: dataUrl,
    name: `${prefix}-${file.name}`.slice(0, 120),
    mimeType: file.type,
    folder,
  });
  return asset.url;
}

/** Transient success/error banner used at the top of every settings module. */
export function FlashBanner({ flash }: { flash: Flash }) {
  if (!flash) return null;
  return (
    <p
      className={`rounded-xl border px-4 py-2.5 text-[12.5px] ${
        flash.tone === "success"
          ? "border-success/30 bg-success/10 text-success"
          : "border-danger/30 bg-danger/10 text-danger"
      }`}
    >
      {flash.text}
    </p>
  );
}

/** Consistent gradient save button with a spinner while `busy`. */
export function SaveButton({
  label,
  busyLabel = "Saving…",
  busy,
  disabled,
  onClick,
}: {
  label: string;
  busyLabel?: string;
  busy: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy || disabled}
      className="inline-flex items-center gap-2 rounded-lg grad-accent px-3.5 py-2 text-[12px] font-semibold text-accent-ink disabled:opacity-60"
    >
      <Icon
        name={busy ? "Loader" : "Save"}
        className={`h-3.5 w-3.5 ${busy ? "animate-spin" : ""}`}
      />
      {busy ? busyLabel : label}
    </button>
  );
}

/** Page scaffold: eyebrow, title, description, an "open site" link and a save slot. */
export function ModuleHeader({
  eyebrow,
  title,
  description,
  onSave,
}: {
  eyebrow: string;
  title: string;
  description: string;
  onSave?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <p className="mono text-[10px] uppercase tracking-[0.22em] text-accent">{eyebrow}</p>
        <h1 className="mt-1.5 text-2xl font-semibold text-ink">{title}</h1>
        <p className="mt-1 text-[12.5px] text-muted">{description}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {onSave}
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="mono inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-faint transition-colors hover:border-line-strong hover:text-accent"
        >
          <Icon name="Globe" className="h-3.5 w-3.5" />
          open site
        </a>
      </div>
    </header>
  );
}

/** A labelled file-picker that previews the current image and uploads on select. */
export function ImageField({
  label,
  hint,
  value,
  uploading,
  compact = false,
  onChange,
  onUpload,
}: {
  label: string;
  hint?: string;
  value: string;
  uploading: boolean;
  compact?: boolean;
  onChange: (value: string) => void;
  onUpload: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) onUpload(file);
    event.target.value = "";
  }

  return (
    <div className="rounded-xl border border-line bg-surface-2/40 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="mono text-[10px] uppercase tracking-[0.16em] text-faint">{label}</span>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <span
          className={`grid shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-page ${
            compact ? "h-9 w-9" : "h-9 w-24"
          }`}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="max-h-full max-w-full object-contain" />
          ) : (
            <Icon name="Image" className="h-3.5 w-3.5 text-faint" />
          )}
        </span>

        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://…"
          className="h-9 min-w-0 flex-1 rounded-lg border border-line bg-page px-2.5 text-[11.5px] text-ink outline-none transition-colors placeholder:text-faint focus:border-accent"
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 text-[11px] font-medium text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-60"
        >
          <Icon
            name={uploading ? "Loader" : "Upload"}
            className={`h-3.5 w-3.5 ${uploading ? "animate-spin" : ""}`}
          />
          {uploading ? "…" : "Upload"}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/webp,image/jpeg,image/gif,image/avif,image/svg+xml,image/x-icon"
          onChange={handleFile}
          className="hidden"
        />
      </div>

      {hint ? <p className="mt-1.5 text-[10.5px] text-faint">{hint}</p> : null}
    </div>
  );
}

/** Small hook: a flashing status message that clears itself after a few seconds. */
export function useFlash(): [Flash, (flash: Flash) => void] {
  const [flash, setFlash] = useState<Flash>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const show = (next: Flash) => {
    setFlash(next);
    if (timer.current) clearTimeout(timer.current);
    if (next) timer.current = setTimeout(() => setFlash(null), 6000);
  };

  return [flash, show];
}
