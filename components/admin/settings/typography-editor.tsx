"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_TYPOGRAPHY,
  findFont,
  fontOptions,
  resolveTypography,
  type FontRole,
} from "@/lib/fonts";
import {
  FlashBanner,
  ModuleHeader,
  SaveButton,
  loadSettings,
  saveSettingsField,
  toMessage,
  useFlash,
} from "@/components/admin/settings/settings-utils";

/**
 * Typography module.
 *
 * Chooses the three Google Fonts the public site loads — body, headings and the
 * monospace terminal — and stores the keys on `settings.typography`. The root
 * layout requests only the selected families, so changing a typeface never
 * needs a rebuild.
 */

const FONT_ROLES: Array<{ role: FontRole; label: string; hint: string }> = [
  { role: "sans", label: "Body", hint: "Paragraphs, cards and form text" },
  { role: "display", label: "Headings", hint: "Section titles and the hero name" },
  { role: "mono", label: "Monospace", hint: "Terminal, code window and labels" },
];

export function TypographyEditor() {
  const [typography, setTypography] = useState<Record<FontRole, string>>({ ...DEFAULT_TYPOGRAPHY });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useFlash();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const settings = await loadSettings();
      const type = (settings.typography ?? {}) as Partial<Record<FontRole, string>>;
      setTypography({
        sans: type.sans || DEFAULT_TYPOGRAPHY.sans,
        display: type.display || DEFAULT_TYPOGRAPHY.display,
        mono: type.mono || DEFAULT_TYPOGRAPHY.mono,
      });
    } catch (cause) {
      setFlash({ tone: "error", text: toMessage(cause, "Could not load the typography.") });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    setSaving(true);
    setFlash(null);
    try {
      await saveSettingsField("typography", typography);
      setFlash({ tone: "success", text: "Fonts saved — the public site loads exactly these three." });
    } catch (cause) {
      setFlash({ tone: "error", text: toMessage(cause, "Could not save the typography.") });
    } finally {
      setSaving(false);
    }
  }

  const isDefault =
    typography.sans === DEFAULT_TYPOGRAPHY.sans &&
    typography.display === DEFAULT_TYPOGRAPHY.display &&
    typography.mono === DEFAULT_TYPOGRAPHY.mono;

  return (
    <div className="space-y-5">
      <ModuleHeader
        eyebrow="Customization"
        title="Typography"
        description="One Google Fonts request — only the chosen families load."
        onSave={<SaveButton label="Save fonts" busy={saving} disabled={loading} onClick={() => void save()} />}
      />

      <FlashBanner flash={flash} />

      {loading ? (
        <div className="grid min-h-[30vh] place-items-center">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-line-strong border-t-accent" />
        </div>
      ) : (
        <section className="panel p-4 sm:p-5">
          {/* The admin layout only ships the saved families, so the preview needs
              its own stylesheet for whatever is picked but not yet stored. */}
          <link rel="stylesheet" href={resolveTypography(typography).href} />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FONT_ROLES.map((role) => {
              const selected = findFont(role.role, typography[role.role]);
              return (
                <label
                  key={role.role}
                  className="flex flex-col gap-2 rounded-xl border border-line bg-surface-2/40 p-3"
                >
                  <span className="mono text-[10px] uppercase tracking-[0.16em] text-faint">
                    {role.label}
                  </span>

                  <select
                    value={selected.key}
                    onChange={(event) =>
                      setTypography((current) => ({ ...current, [role.role]: event.target.value }))
                    }
                    className="h-9 rounded-lg border border-line bg-page px-2 text-[12px] text-ink outline-none transition-colors focus:border-accent"
                  >
                    {fontOptions(role.role).map((font) => (
                      <option key={font.key} value={font.key}>
                        {font.label}
                      </option>
                    ))}
                  </select>

                  <span className="truncate text-[19px] text-ink" style={{ fontFamily: selected.stack }}>
                    Aa Bb 123
                  </span>
                  <span className="text-[10.5px] text-faint">
                    {role.hint} · {selected.note}
                  </span>
                </label>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="mono text-[10.5px] leading-relaxed text-faint">
              {isDefault
                ? "Currently the shipped defaults — nothing changes on the site until you save a different set."
                : "Custom selection — the public site switches to these faces on the next revalidation."}
            </p>
            <button
              type="button"
              onClick={() => setTypography({ ...DEFAULT_TYPOGRAPHY })}
              disabled={isDefault}
              className="mono inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-faint transition-colors hover:border-line-strong hover:text-accent disabled:opacity-40"
            >
              reset to defaults
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
