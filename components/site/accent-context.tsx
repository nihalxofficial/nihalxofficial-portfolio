"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
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

export function AccentProvider({ children }: { children: ReactNode }) {
  const [accentId, setAccentIdState] = useState("cyan");
  const isHydrated = useRef(false);

  // 1. Initial hydration: read stored preference from localStorage
  useEffect(() => {
    try {
      const saved =
        localStorage.getItem("portfolio_accent") || localStorage.getItem("accent");
      if (saved && ACCENTS.some((a) => a.id === saved)) {
        setAccentIdState(saved);
        const match = ACCENTS.find((a) => a.id === saved);
        if (match) {
          document.documentElement.style.setProperty("--acc", match.a);
          document.documentElement.style.setProperty("--acc2", match.b);
        }
      }
    } catch {}
    isHydrated.current = true;
  }, []);

  const accent = ACCENTS.find((a) => a.id === accentId) ?? ACCENTS[0];

  // 2. Persist to localStorage and documentElement only when changed after hydration
  useEffect(() => {
    if (!isHydrated.current) return;
    const r = document.documentElement.style;
    r.setProperty("--acc", accent.a);
    r.setProperty("--acc2", accent.b);
    try {
      localStorage.setItem("portfolio_accent", accent.id);
      localStorage.setItem("accent", accent.id);
    } catch {}
  }, [accent]);

  const setAccentId = useCallback((id: string) => {
    if (ACCENTS.some((a) => a.id === id)) {
      setAccentIdState(id);
      const match = ACCENTS.find((a) => a.id === id);
      if (match) {
        document.documentElement.style.setProperty("--acc", match.a);
        document.documentElement.style.setProperty("--acc2", match.b);
        try {
          localStorage.setItem("portfolio_accent", id);
          localStorage.setItem("accent", id);
        } catch {}
      }
    }
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
