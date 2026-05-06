"use client";
import { useBackToTop } from "@/hooks/useScroll";

export default function BackToTop() {
  const { visible, scrollToTop } = useBackToTop();

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      style={{
        background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
        boxShadow: "0 4px 16px var(--accent-glow)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "all" : "none",
        transform: visible ? "translateY(0)" : "translateY(10px)",
        transition: "opacity 0.3s, transform 0.3s",
      }}
      className="fixed bottom-7 right-7 z-50 w-11 h-11 rounded-xl flex items-center justify-center text-white text-base cursor-pointer border-none"
    >
      <i className="fas fa-arrow-up" />
    </button>
  );
}
