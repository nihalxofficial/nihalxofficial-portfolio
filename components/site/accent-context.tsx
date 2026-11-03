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
  // Synchronous client-side lazy initializer: restores user's choice on first frame
  const [accentId, setAccentIdState] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved =
          localStorage.getItem("portfolio_accent") || localStorage.getItem("accent");
        if (saved && ACCENTS.some((a) => a.id === saved)) {
          return saved;
        }
      } catch {}
    }
    return "cyan";
  });

  // Ensure CSS variables match on client mount
  useEffect(() => {
    try {
      const saved =
        localStorage.getItem("portfolio_accent") || localStorage.getItem("accent");
      const activeId = saved && ACCENTS.some((a) => a.id === saved) ? saved : accentId;
      const match = ACCENTS.find((a) => a.id === activeId);
      if (match) {
        document.documentElement.style.setProperty("--acc", match.a);
        document.documentElement.style.setProperty("--acc2", match.b);
        if (activeId !== accentId) {
          setAccentIdState(activeId);
        }
      }
    } catch {}
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const accent = ACCENTS.find((a) => a.id === accentId) ?? ACCENTS[0];

  const setAccentId = useCallback((id: string) => {
    const match = ACCENTS.find((a) => a.id === id);
    if (!match) return;

    setAccentIdState(id);
    document.documentElement.style.setProperty("--acc", match.a);
    document.documentElement.style.setProperty("--acc2", match.b);

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
