"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { BackgroundMode } from "@/components/site/site-background";
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
 * Background Settings module.
 *
 * Chooses the animated engine behind the public site — the DNA particle mesh,
 * the matrix rain, or the minimal grid — and stores it on `settings.theme`.
 * The value becomes the site default; a visitor who has switched it themselves
 * keeps their own choice, and nothing changes until a mode is picked here.
 */

interface ThemeState {
  accentId: string;
  backgroundEffect: string;
  palette: { primary: string; secondary: string; background: string; text: string };
}

function normalizeTheme(raw: unknown): ThemeState {
  const t = (raw ?? {}) as SiteTheme;
  return {
    accentId: typeof t.accentId === "string" ? t.accentId : "",
    backgroundEffect: typeof t.backgroundEffect === "string" ? t.backgroundEffect : "dna",
    palette: {
      primary: t.palette?.primary ?? "",
      secondary: t.palette?.secondary ?? "",
      background: t.palette?.background ?? "",
      text: t.palette?.text ?? "",
    },
  };
}

const MODES: Array<{
  id: BackgroundMode;
  label: string;
  icon: string;
  blurb: string;
  preview: string;
}> = [
  {
    id: "dna",
    label: "DNA Mesh",
    icon: "Activity",
    blurb: "Connected particle constellation with a flowing double-helix wave.",
    preview: "linear-gradient(135deg, rgba(0,229,255,0.35), rgba(124,77,255,0.25))",
  },
  {
    id: "rain",
    label: "Matrix Rain",
    icon: "Terminal",
    blurb: "Dark falling-glyph code rain tinted by the accent.",
    preview: "repeating-linear-gradient(180deg, rgba(34,255,156,0.28) 0 2px, transparent 2px 10px)",
  },
  {
    id: "none",
    label: "Minimal Grid",
    icon: "LayoutDashboard",
    blurb: "Calm dark space with the cyber grid and ambient glow — no canvas.",
    preview: "repeating-linear-gradient(0deg, rgba(148,163,184,0.14) 0 1px, transparent 1px 22px), repeating-linear-gradient(90deg, rgba(148,163,184,0.14) 0 1px, transparent 1px 22px)",
  },
];

export function BackgroundEditor() {
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
      setFlash({ tone: "error", text: toMessage(cause, "Could not load the background settings.") });
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
      // Send the whole theme so accent + palette selections survive.
      await saveSettingsField("theme", {
        accentId: theme.accentId,
        backgroundEffect: theme.backgroundEffect,
        palette: theme.palette,
      });
      setFlash({ tone: "success", text: "Background saved — the public site updates on revalidation." });
    } catch (cause) {
      setFlash({ tone: "error", text: toMessage(cause, "Could not save the background.") });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <ModuleHeader
        eyebrow="Customization"
        title="Background Settings"
        description="The animated engine rendered behind the whole site."
        onSave={<SaveButton label="Save background" busy={saving} disabled={!theme} onClick={() => void save()} />}
      />

      <FlashBanner flash={flash} />

      {loading || !theme ? (
        <div className="grid min-h-[30vh] place-items-center">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-line-strong border-t-accent" />
        </div>
      ) : (
        <section className="panel p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {MODES.map((mode) => {
              const selected = theme.backgroundEffect === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setTheme((current) => (current ? { ...current, backgroundEffect: mode.id } : current))}
                  className={`overflow-hidden rounded-xl border text-left transition-colors ${
                    selected ? "border-accent/60 bg-accent/10" : "border-line bg-surface-2/40 hover:border-line-strong"
                  }`}
                >
                  <span className="block h-24 w-full border-b border-line" style={{ background: mode.preview }} />
                  <span className="block p-3">
                    <span className="flex items-center gap-2">
                      <Icon
                        name={mode.icon}
                        className={`h-4 w-4 ${selected ? "text-accent" : "text-faint"}`}
                      />
                      <span className="text-[12.5px] font-semibold text-ink">{mode.label}</span>
                      {selected ? (
                        <Icon name="Check" className="ml-auto h-4 w-4 text-accent" />
                      ) : null}
                    </span>
                    <span className="mt-1 block text-[11px] leading-snug text-muted">{mode.blurb}</span>
                    <span className="mono mt-1 block text-[9.5px] uppercase tracking-[0.14em] text-faint">
                      {mode.id}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <p className="mono mt-4 rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[10.5px] leading-relaxed text-faint">
            This is the site default. Visitors who switch the background themselves keep their own
            choice; everyone else sees what you pick here.
          </p>
        </section>
      )}
    </div>
  );
}
