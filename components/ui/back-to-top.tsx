"use client";

import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

/** Appears once the hero is out of view. */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`dock-raised fixed left-5 z-50 grid h-11 w-11 place-items-center rounded-full border border-line-strong bg-surface/80 text-accent backdrop-blur transition-all duration-300 hover:border-accent hover:shadow-[0_0_24px_var(--accent-glow)] ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <ArrowLeft className="h-4 w-4 rotate-90" />
    </button>
  );
}
