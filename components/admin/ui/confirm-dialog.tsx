"use client";

import { Icon } from "@/components/ui/icon";

/**
 * Destructive-action confirmation dialog.
 *
 * The generic editor already gates deletes behind this pattern; factoring it out
 * lets every bespoke management page reuse the same confirm flow instead of
 * re-implementing the overlay markup.
 */
export function ConfirmDialog({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Delete",
  busy,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center px-5">
      <button
        type="button"
        aria-label="Cancel"
        onClick={onCancel}
        className="absolute inset-0 bg-page/80 backdrop-blur-sm"
      />
      <div className="panel relative w-full max-w-sm p-5">
        <p className="flex items-center gap-2 text-[13px] font-semibold text-ink">
          <Icon name="Trash" className="h-4 w-4 text-danger" />
          {title}
        </p>
        <p className="mt-2 text-[12px] leading-relaxed text-muted">{message}</p>
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-danger/40 bg-danger/15 px-3.5 text-[12px] font-semibold text-danger disabled:opacity-60"
          >
            {busy ? <Icon name="Loader" className="h-3.5 w-3.5 animate-spin" /> : null}
            {confirmLabel}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="inline-flex h-9 items-center rounded-lg border border-line bg-transparent px-3.5 text-[12px] font-medium text-muted"
          >
            Keep it
          </button>
        </div>
      </div>
    </div>
  );
}
