"use client";

import { useCallback, useEffect, useState } from "react";
import { ACCENTS } from "@/components/site/accent-context";
import { Icon } from "@/components/ui/icon";
import type { SiteTheme } from "@/lib/types";
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
 * Theme & Colors module.
 *
 * Picks the site's default accent (one of the same presets the public site and
 * the dashboard customizer use) and optionally overrides the palette by hand.
 * Everything is written to `settings.theme`, so a fresh visitor sees the chosen
 * colours while each visitor's own saved choice still wins — the shipped design
 * is untouched until someone is picked here.
 */

interface Palette {
  primary: string;
  secondary: string;
  background: string;
  text: string;
}

interface ThemeState {
  accentId: string;
  backgroundEffect: string;
  palette: Palette;
}

function normalizeTheme(raw: unknown): ThemeState {
  const t = (raw ?? {}) as SiteTheme;
  return {
    accentId: typeof t.accentId === "string" ? t.accentId : "",
    backgroundEffect: typeof t.backgroundEffect === "string" ? t.backgroundEffect : "",
    palette: {
      primary: t.palette?.primary ?? "",
      secondary: t.palette?.secondary ?? "",
      background: t.palette?.background ?? "",
      text: t.palette?.text ?? "",
    },
  };
}

function isHex(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
}

const PALETTE_FIELDS: Array<{ key: keyof Palette; label: string; hint: string }> = [
  { key: "primary", label: "Primary", hint: "Main accent — --acc" },
  { key: "secondary", label: "Secondary", hint: "Gradient partner — --acc2" },
  { key: "background", label: "Background", hint: "Stored for advanced themes" },
  { key: "text", label: "Text", hint: "Stored for advanced themes" },
];

export function ThemeEditor() {
  const [theme, setTheme] = useState<ThemeState | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useFlash();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const settings = await loadSettings();
      setTheme(normalizeTheme(settings.theme));
    } catch (cause) {
      setFlash({ tone: "error", text: toMessage(cause, "Could not load the theme.") });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    if (!theme) return;
    setSaving(true);
    try {
      // Keep the whole theme object so the background module's value survives.
      await saveSettingsField("theme", {
        accentId: theme.accentId,
        backgroundEffect: theme.backgroundEffect,
        palette: theme.palette,
      });
      setFlash({ tone: "success", text: "Theme saved — the public site updates on revalidation." });
    } catch (cause) {
      setFlash({ tone: "error", text: toMessage(cause, "Could not save the theme.") });
    } finally {
      setSaving(false);
    }
  }

  function pickAccent(id: string) {
    setTheme((current) =>
      current ? { ...current, accentId: current.accentId === id ? "" : id } : current,
    );
  }

  function setPaletteColor(key: keyof Palette, value: string) {
    setTheme((current) =>
      current ? { ...current, palette: { ...current.palette, [key]: value } } : current,
    );
  }

  const usingPreset = theme ? !theme.palette.primary && !theme.palette.secondary : true;

  return (
    <div className="space-y-5">
      <ModuleHeader
        eyebrow="Customization"
        title="Theme & Colors"
        description="The default accent and palette the public site opens with."
        onSave={<SaveButton label="Save theme" busy={saving} disabled={!theme} onClick={() => void save()} />}
      />

      <FlashBanner flash={flash} />

      {loading || !theme ? (
        <div className="grid min-h-[30vh] place-items-center">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-line-strong border-t-accent" />
        </div>
      ) : (
        <>
          {/* Accent presets */}
          <section className="panel p-4 sm:p-5">
            <h2 className="text-[13.5px] font-semibold text-ink">Accent preset</h2>
            <p className="mono mt-0.5 text-[10px] uppercase tracking-[0.14em] text-faint">
              the same {ACCENTS.length} palettes as the site — none selected keeps the default
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {ACCENTS.map((accent) => {
                const selected = theme.accentId === accent.id;
                return (
                  <button
                    key={accent.id}
                    type="button"
                    onClick={() => pickAccent(accent.id)}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                      selected
                        ? "border-accent/60 bg-accent/10"
                        : "border-line bg-surface-2/40 hover:border-line-strong"
                    }`}
                  >
                    <span
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
                      style={{ background: `linear-gradient(135deg, ${accent.a}, ${accent.b})` }}
                    >
                      {selected ? <Icon name="Check" className="h-4 w-4 text-white" /> : null}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[12.5px] font-medium text-ink">
                        {accent.name}
                      </span>
                      <span className="mono block truncate text-[10px] text-faint">{accent.id}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Custom palette */}
          <section className="panel p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-[13.5px] font-semibold text-ink">Custom palette</h2>
                <p className="mt-0.5 text-[11.5px] text-muted">
                  Override the accent by hand. Empty fields fall back to the preset above, so leaving
                  everything blank keeps the current look exactly.
                </p>
              </div>
              <span
                className={`mono rounded-md border px-2 py-1 text-[9.5px] uppercase tracking-[0.14em] ${
                  usingPreset
                    ? "border-line text-faint"
                    : "border-accent/40 bg-accent/10 text-accent"
                }`}
              >
                {usingPreset ? "using preset" : "custom colors"}
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {PALETTE_FIELDS.map((field) => {
                const raw = theme.palette[field.key];
                const swatch = isHex(raw) ? raw : field.key === "primary" ? ACCENTS[0].a : ACCENTS[0].b;
                return (
                  <div key={field.key} className="rounded-xl border border-line bg-surface-2/40 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="mono text-[10px] uppercase tracking-[0.16em] text-faint">
                        {field.label}
                      </span>
                      {raw ? (
                        <button
                          type="button"
                          onClick={() => setPaletteColor(field.key, "")}
                          className="mono inline-flex items-center gap-1 text-[9.5px] uppercase tracking-[0.14em] text-faint transition-colors hover:text-danger"
                        >
                          <Icon name="X" className="h-3 w-3" />
                          clear
                        </button>
                      ) : null}
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="color"
                        value={swatch}
                        onChange={(event) => setPaletteColor(field.key, event.target.value)}
                        className="h-9 w-10 shrink-0 cursor-pointer rounded-lg border border-line bg-page p-1"
                        aria-label={`${field.label} color picker`}
                      />
                      <input
                        value={raw}
                        onChange={(event) => setPaletteColor(field.key, event.target.value.trim())}
                        placeholder={field.key === "primary" || field.key === "secondary" ? "leave empty to use preset" : "#03050f"}
                        className="mono h-9 min-w-0 flex-1 rounded-lg border border-line bg-page px-2.5 text-[11.5px] text-ink outline-none transition-colors placeholder:text-faint focus:border-accent"
                      />
                    </div>
                    <p className="mt-1.5 text-[10.5px] text-faint">{field.hint}</p>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
