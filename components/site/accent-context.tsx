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

  // Hydrate from localStorage only on client
  useEffect(() => {
    const saved = localStorage.getItem("accent");
    if (saved && ACCENTS.some((a) => a.id === saved)) {
      setAccentIdState(saved);
    }
  }, []);

  const accent = ACCENTS.find((a) => a.id === accentId) ?? ACCENTS[0];

  // Apply CSS vars whenever accent changes
  useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty("--acc",  accent.a);
    r.setProperty("--acc2", accent.b);
    localStorage.setItem("accent", accent.id);
  }, [accent]);

  const setAccentId = useCallback((id: string) => {
    if (ACCENTS.some((a) => a.id === id)) setAccentIdState(id);
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

