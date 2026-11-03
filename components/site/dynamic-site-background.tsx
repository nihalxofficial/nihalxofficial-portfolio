"use client";

import { useEffect, useState } from "react";
import { BackgroundMode, SiteBackground } from "@/components/site/site-background";

/**
 * Client component that hydrates the user's saved background mode (default: "dna")
 * and accent color from localStorage, then renders the animated SiteBackground engine.
 * Used across loading, 404, and boot overlays to ensure the DNA mode flows consistently.
 */
export function DynamicSiteBackground() {
  const [mode, setMode] = useState<BackgroundMode>("dna");
  const [accent, setAccent] = useState("#00e5ff");

  useEffect(() => {
    try {
      const savedMode = (localStorage.getItem("portfolio_bg_mode") ||
        localStorage.getItem("bg_mode")) as BackgroundMode | null;
      if (savedMode && (savedMode === "dna" || savedMode === "rain" || savedMode === "none")) {
        setMode(savedMode);
      }
      const savedAccent =
        localStorage.getItem("portfolio_accent") || localStorage.getItem("accent");
      const ACCENT_COLORS: Record<string, string> = {
        cyan: "#00e5ff",
        emerald: "#22ff9c",
        magenta: "#ff4ecd",
        amber: "#ffb020",
      };
      if (savedAccent && ACCENT_COLORS[savedAccent]) {
        setAccent(ACCENT_COLORS[savedAccent]);
      }
    } catch {}
  }, []);

  return <SiteBackground accent={accent} mode={mode} />;
}

