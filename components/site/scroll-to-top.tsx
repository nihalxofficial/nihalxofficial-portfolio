"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useAiChat } from "@/components/site/ai-chat-context";
import { useLenis } from "@/components/providers/smooth-scroll";

/**
 * Floating "Back to Top" button in the bottom-right corner.
 * Sits directly above the AI Chatbot button without any overlap.
 * Hides automatically when the chat dialog is open for zero UI clutter.
 */
export function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const { isOpen } = useAiChat();
  const { scrollTo } = useLenis();

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
    scrollTo(0, { duration: 1.25 });
  };

  if (!visible || isOpen) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      title="Back to top"
      aria-label="Back to top"
      style={{ position: "fixed" }}
      className="fixed z-[68] right-4 md:right-6 bottom-[136px] md:bottom-24 grid h-12 w-12 place-items-center rounded-2xl hud !border-acc/40 bg-[#070c30] text-slate-200 shadow-[0_0_24px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-acc hover:text-acc hover:glow active:scale-95 group cursor-pointer animate-in fade-in zoom-in-95"
    >
      <ArrowUp size={20} className="transition-transform group-hover:-translate-y-0.5 text-acc" />
      <span className="sr-only">Back to top</span>
    </button>
  );
}
