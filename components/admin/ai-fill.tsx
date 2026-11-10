"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { AdminApiError, fillFormWithAi, humanize } from "@/lib/admin";

/**
 * "Fill with AI" for a dashboard form.
 *
 * Sends the entity key, the admin's rough notes and whatever is already typed to
 * Gemini (through the API), then hands the generated fields back to the form for
 * review. Nothing is written until the admin presses Save.
 */

interface AiFillProps {
  entity: string;
  label: string;
  current: Record<string, unknown>;
  disabled?: boolean;
  onFill: (fields: Record<string, unknown>, missingRequired: string[]) => void;
}

export function AiFill({ entity, label, current, disabled, onFill }: AiFillProps) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ model: string; count: number; missing: string[] } | null>(
    null,
  );

  async function run() {
    if (!notes.trim()) {
      setError("Add a few notes first — the assistant needs something to work with.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const value = await fillFormWithAi({ entity, notes, current });
      const filled = Object.keys(value.fields ?? {});
      onFill(value.fields ?? {}, value.missingRequired ?? []);
      setResult({ model: value.model, count: filled.length, missing: value.missingRequired ?? [] });
    } catch (cause) {
      setError(
        cause instanceof AdminApiError
          ? cause.message
          : "The assistant could not fill this form. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-xl border border-accent/25 bg-accent/5">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left"
      >
        <span className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-lg grad-accent text-accent-ink">
            <Icon name="Wand" className="h-3.5 w-3.5" />
          </span>
          <span>
            <span className="block text-[12.5px] font-semibold text-ink">Fill with AI</span>
            <span className="mono block text-[9.5px] uppercase tracking-[0.14em] text-faint">
              gemini · drafts only, you review before saving
            </span>
          </span>
        </span>
        <Icon
          name="ChevronDown"
          className={`h-4 w-4 shrink-0 text-faint transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div className="space-y-3 border-t border-accent/20 px-3.5 py-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400 font-semibold">
              Notes for the assistant
            </label>
            <textarea
              rows={4}
              value={notes}
              disabled={busy || disabled}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={`Describe this ${label.toLowerCase()} in a few rough lines — what it is, who it is for, tech used, results…`}
              className="dashboard-input w-full rounded-lg border border-line bg-surface-2/60 px-3 py-2 text-[12.5px] text-ink placeholder:text-slate-500 outline-none transition-colors focus:border-accent/60 focus:ring-1 focus:ring-accent/20 disabled:opacity-60 resize-y"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={busy || disabled}
              onClick={() => void run()}
              className="btn-primary flex h-9 items-center gap-2 rounded-lg px-3.5 text-[12px] font-bold text-accent-ink disabled:opacity-60"
            >
              {busy ? (
                <>
                  <Icon name="Loader" className="h-3.5 w-3.5 animate-spin" />
                  Writing…
                </>
              ) : (
                <>
                  <Icon name="Sparkles" className="h-3.5 w-3.5" />
                  Generate fields
                </>
              )}
            </button>

            <p className="mono text-[10px] text-faint">
              existing values are kept unless the notes contradict them
            </p>
          </div>

          {error ? (
            <p className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-[11.5px] leading-relaxed text-danger">
              <Icon name="X" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {error}
            </p>
          ) : null}

          {result ? (
            <div className="rounded-lg border border-line bg-surface-2/60 px-3 py-2.5">
              <p className="flex items-center gap-2 text-[11.5px] font-medium text-accent">
                <Icon name="Check" className="h-3.5 w-3.5" />
                {result.count} field{result.count === 1 ? "" : "s"} drafted
                <span className="mono text-[9.5px] uppercase tracking-[0.12em] text-faint">
                  {result.model}
                </span>
              </p>
              {result.missing.length ? (
                <p className="mt-1.5 text-[11px] leading-relaxed text-warning">
                  Still required: {result.missing.map(humanize).join(", ")}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
