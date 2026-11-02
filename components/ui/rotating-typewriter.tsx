"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * The banner typewriter: types each line, holds, deletes it, then moves to the
 * next — looping forever. An optional `prefix` (e.g. "I build ") stays put so
 * only the changing phrase is animated.
 *
 * Lines come from the Hero document, so the phrase set is editable in the
 * dashboard. With `prefers-reduced-motion` we skip the typing and just show the
 * first line, so the headline never dances for people who asked it not to.
 */
export function RotatingTypewriter({
  prefix = "",
  lines,
  className,
  prefixClassName,
  typeSpeed = 65,
  deleteSpeed = 32,
  holdTime = 1600,
}: {
  prefix?: string;
  lines: string[];
  className?: string;
  /** Style for the fixed prefix (defaults to inheriting the muted colour). */
  prefixClassName?: string;
  /** Milliseconds per character while typing. */
  typeSpeed?: number;
  /** Milliseconds per character while deleting. */
  deleteSpeed?: number;
  /** How long a finished line stays on screen. */
  holdTime?: number;
}) {
  const active = lines.filter((line) => line.trim().length > 0);
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"typing" | "holding" | "deleting">("typing");

  // Keep the index valid when the line set changes (e.g. after a revalidate).
  useEffect(() => {
    if (index >= active.length) setIndex(0);
  }, [active.length, index]);

  useEffect(() => {
    if (active.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setText(active[0] ?? "");
      return;
    }

    const current = active[index] ?? "";

    if (phase === "typing") {
      if (text.length < current.length) {
        const timer = window.setTimeout(
          () => setText(current.slice(0, text.length + 1)),
          typeSpeed,
        );
        return () => window.clearTimeout(timer);
      }
      setPhase("holding");
      return;
    }

    if (phase === "holding") {
      const timer = window.setTimeout(() => setPhase("deleting"), holdTime);
      return () => window.clearTimeout(timer);
    }

    // deleting
    if (text.length > 0) {
      const timer = window.setTimeout(() => setText(current.slice(0, text.length - 1)), deleteSpeed);
      return () => window.clearTimeout(timer);
    }
    setIndex((value) => (value + 1) % active.length);
    setPhase("typing");
  }, [active, index, phase, text, typeSpeed, deleteSpeed, holdTime]);

  if (active.length === 0) return null;

  return (
    <span className={cn("inline-flex flex-wrap items-baseline", className)} aria-hidden>
      {prefix ? <span className={prefixClassName}>{prefix}</span> : null}
      <span className="relative inline-flex">
        <span>{text}</span>
        <span className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[2px] bg-accent/80 animate-blink" />
      </span>
    </span>
  );
}
