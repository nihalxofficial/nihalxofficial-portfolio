"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ACCENTS } from "@/components/site/accent-context";
import type { BackgroundMode } from "@/components/site/site-background";
import { Icon } from "@/components/ui/icon";
import { adminHref } from "@/lib/admin-routes";
import type { SiteTheme } from "@/lib/types";
import { loadSettings, saveSettingsField, toMessage } from "@/components/admin/settings/settings-utils";

/**
 * Quick theme customizer for the dashboard navbar.
 *
 * A compact palette + background picker that writes the site default straight
 * to `settings.theme` — the SAME presets and engines the public site uses, so
 * there is no second theme system. Choosing an accent also recolours the
 * dashboard immediately as a live preview; the public site follows on its next
 * revalidation, and each visitor's own saved choice still wins over the default.
 */

const BACKGROUNDS: Array<{ id: BackgroundMode; label: string; icon: string }> = [
  { id: "dna", label: "DNA Mesh", icon: "Activity" },
  { id: "rain", label: "Matrix Rain", icon: "Terminal" },
  { id: "none", label: "Minimal Grid", icon: "LayoutDashboard" },
];

interface ThemeState {
  accentId: string;
  backgroundEffect: string;
  palette: { primary: string; secondary: string; background: string; text: string };
}

function normalizeTheme(raw: unknown): ThemeState {
  const t = (raw ?? {}) as SiteTheme;
  return {
    accentId: typeof t.accentId === "string" ? t.accentId : "",
    backgroundEffect: typeof t.backgroundEffect === "string" && t.backgroundEffect ? t.backgroundEffect : "dna",
    palette: {
      primary: t.palette?.primary ?? "",
      secondary: t.palette?.secondary ?? "",
      background: t.palette?.background ?? "",
      text: t.palette?.text ?? "",
    },
  };
}

export function ThemeCustomizerMenu() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    void loadSettings()
      .then((settings) => active && setTheme(normalizeTheme(settings.theme)))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Dismiss on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const persist = useCallback(async (next: ThemeState) => {
    setTheme(next);
    setBusy(true);
    setError(null);
    try {
      await saveSettingsField("theme", {
        accentId: next.accentId,
        backgroundEffect: next.backgroundEffect,
        palette: next.palette,
      });
    } catch (cause) {
      setError(toMessage(cause, "Could not save the theme."));
    } finally {
      setBusy(false);
    }
  }, []);

  function chooseAccent(id: string) {
    if (!theme) return;
    const next: ThemeState = { ...theme, accentId: theme.accentId === id ? "" : id };
    void persist(next);
    const targetId = next.accentId || "cyan";
    const preset = ACCENTS.find((a) => a.id === targetId);
    if (preset) {
      document.documentElement.style.setProperty("--acc", next.palette.primary || preset.a);
      document.documentElement.style.setProperty("--acc2", next.palette.secondary || preset.b);
      try {
        localStorage.setItem("portfolio_accent", targetId);
        localStorage.setItem("accent", targetId);
        window.dispatchEvent(new CustomEvent("portfolio_accent_change", { detail: targetId }));
      } catch {}
    }
  }

  function chooseBackground(mode: BackgroundMode) {
    if (!theme) return;
    void persist({ ...theme, backgroundEffect: mode });
    try {
      localStorage.setItem("portfolio_bg_mode", mode);
      localStorage.setItem("bg_mode", mode);
      window.dispatchEvent(new CustomEvent("portfolio_bg_change", { detail: mode }));
    } catch {}
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Theme customizer"
        title="Theme & background"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-line-strong hover:text-accent"
      >
        <span
          className="h-4 w-4 rounded-full"
          style={{
            background: `linear-gradient(135deg, var(--acc, #00e5ff), var(--acc2, #7c4dff))`,
          }}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] w-64 overflow-hidden rounded-xl border border-line bg-surface p-3 shadow-[0_20px_50px_-24px_var(--accent-glow)]"
        >
          <p className="mono mb-2 text-[9.5px] uppercase tracking-[0.16em] text-faint">Accent</p>
          <div className="flex items-center gap-2">
            {ACCENTS.map((accent) => {
              const selected = (theme?.accentId || "cyan") === accent.id;
              return (
                <button
                  key={accent.id}
                  type="button"
                  role="menuitem"
                  onClick={() => chooseAccent(accent.id)}
                  aria-label={accent.name}
                  title={accent.name}
                  disabled={busy}
                  className={`grid h-9 w-9 place-items-center rounded-lg border transition-transform hover:scale-105 disabled:opacity-60 ${
                    selected ? "border-accent/60" : "border-line"
                  }`}
                  style={{ background: `linear-gradient(135deg, ${accent.a}, ${accent.b})` }}
                >
                  {selected ? <Icon name="Check" className="h-4 w-4 text-white" /> : null}
                </button>
              );
            })}
          </div>

          <p className="mono mb-2 mt-4 text-[9.5px] uppercase tracking-[0.16em] text-faint">Background</p>
          <div className="grid grid-cols-3 gap-2">
            {BACKGROUNDS.map((bg) => {
              const selected = (theme?.backgroundEffect || "dna") === bg.id;
              return (
                <button
                  key={bg.id}
                  type="button"
                  role="menuitem"
                  onClick={() => chooseBackground(bg.id)}
                  disabled={busy}
                  className={`flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-[10px] transition-colors disabled:opacity-60 ${
                    selected
                      ? "border-accent/60 bg-accent/10 text-accent"
                      : "border-line text-muted hover:border-line-strong"
                  }`}
                >
                  <Icon name={bg.icon} className="h-4 w-4" />
                  {bg.label}
                </button>
              );
            })}
          </div>

          <p className="mono mt-3 flex items-center gap-1.5 text-[9.5px] uppercase tracking-[0.14em] text-faint">
            <Icon name={busy ? "Loader" : "Check"} className={`h-3 w-3 ${busy ? "animate-spin" : ""}`} />
            {busy ? "saving…" : error ? "not saved" : "saved to the site default"}
          </p>
          {error ? <p className="mt-1 text-[10.5px] text-danger">{error}</p> : null}

          <a
            href={adminHref("settings/theme")}
            className="mono mt-2 block text-center text-[9.5px] uppercase tracking-[0.14em] text-faint transition-colors hover:text-accent"
          >
            advanced palette →
          </a>
        </div>
      ) : null}
    </div>
  );
}
