"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface Accent {
  id: string;
  name: string;
  a: string; // primary color
  b: string; // secondary color
}

export const ACCENTS: Accent[] = [
  { id: "cyan",    name: "Cyber Cyan",    a: "#00e5ff", b: "#7c4dff" },
  { id: "emerald", name: "Matrix Green",  a: "#22ff9c", b: "#00b3ff" },
  { id: "magenta", name: "Neon Magenta",  a: "#ff4ecd", b: "#7c4dff" },
  { id: "amber",   name: "Solar Amber",   a: "#ffb020", b: "#ff4e50" },
];

const STORAGE_KEYS = ["portfolio_accent", "accent"] as const;

interface AccentContextValue {
  accent: Accent;
  accentId: string;
  setAccentId: (id: string) => void;
}

const AccentContext = createContext<AccentContextValue>({
  accent: ACCENTS[0],
  accentId: "cyan",
  setAccentId: () => {},
});

/** Optional owner-selected default persisted on `settings.theme`. */
export interface AccentDefaults {
  accentId?: string;
  palette?: { primary?: string; secondary?: string };
}

function readStoredAccentId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    for (const key of STORAGE_KEYS) {
      const saved = localStorage.getItem(key);
      if (saved && ACCENTS.some((a) => a.id === saved)) return saved;
    }
  } catch {}
  return null;
}

function presetFor(id?: string): Accent {
  return ACCENTS.find((a) => a.id === id) ?? ACCENTS[0];
}

function applyColors(a: string, b: string) {
  document.documentElement.style.setProperty("--acc", a);
  document.documentElement.style.setProperty("--acc2", b);
}

export function AccentProvider({
  children,
  defaults,
}: {
  children: ReactNode;
  defaults?: AccentDefaults;
}) {
  // Precedence: visitor localStorage -> owner DB default -> built-in preset.
  // The DB accent only drives the default a *new* visitor sees; anyone who has
  // picked one themselves keeps their choice, so nothing about per-visitor
  // control changes.
  // The initial value must be identical on the server and the first client
  // render, or the accent name/colour text mismatches during hydration. So we
  // never read localStorage here — the effect below applies a visitor's stored
  // choice after mount. Precedence still resolves to: visitor -> DB default ->
  // built-in preset, just corrected one tick later on the client.
  const [accentId, setAccentIdState] = useState(
    () => (ACCENTS.some((a) => a.id === defaults?.accentId) ? defaults!.accentId! : "cyan"),
  );

  // Paint the resolved colors as soon as we are on the client.
  useEffect(() => {
    const stored = readStoredAccentId();
    if (stored) {
      const preset = presetFor(stored);
      applyColors(preset.a, preset.b);
      if (stored !== accentId) setAccentIdState(stored);
      return;
    }

    const preset = presetFor(defaults?.accentId);
    const primary = defaults?.palette?.primary?.trim();
    const secondary = defaults?.palette?.secondary?.trim();
    applyColors(primary || preset.a, secondary || preset.b);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaults?.accentId, defaults?.palette?.primary, defaults?.palette?.secondary]);

  const accent = presetFor(accentId);

  const setAccentId = useCallback((id: string) => {
    const match = ACCENTS.find((a) => a.id === id);
    if (!match) return;

    setAccentIdState(id);
    applyColors(match.a, match.b);

    try {
      localStorage.setItem("portfolio_accent", id);
      localStorage.setItem("accent", id);
    } catch {}
  }, []);

  return (
    <AccentContext.Provider value={{ accent, accentId, setAccentId }}>
      {children}
    </AccentContext.Provider>
  );
}

export function useAccent() {
  return useContext(AccentContext);
}
