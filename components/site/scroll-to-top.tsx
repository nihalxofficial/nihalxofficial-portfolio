"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/**
 * Floating "Back to Top" button in the bottom-right corner.
 * Listens to scroll on both the `#stage` main container and `window`.
 */
export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const stage = document.getElementById("stage");
      const scrollTop = stage ? stage.scrollTop : window.scrollY;
      setVisible(scrollTop > 260);
    };

    const stage = document.getElementById("stage");
    if (stage) {
      stage.addEventListener("scroll", handleScroll, { passive: true });
    }
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (stage) stage.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    const stage = document.getElementById("stage");
    if (stage) {
      stage.scrollTo({ top: 0, behavior: "smooth" });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      title="Back to top"
      aria-label="Back to top"
      className="fixed z-[65] right-4 sm:right-6 bottom-[calc(68px+env(safe-area-inset-bottom)+3.5rem)] sm:bottom-22 grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-xl hud !border-white/15 bg-[#03050f]/90 text-slate-300 shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:border-acc hover:text-acc hover:glow-sm active:scale-95 group cursor-pointer"
    >
      <ArrowUp size={18} className="transition-transform group-hover:-translate-y-0.5 text-acc" />
      <span className="sr-only">Back to top</span>
    </button>
  );
}
