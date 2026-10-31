"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Types the hero terminal lines out one character at a time, then leaves the
 * caret blinking on the last row — the "live console" feel from the reference.
 */
export function Typewriter({
  lines,
  className,
  speed = 26,
}: {
  lines: string[];
  className?: string;
  /** Milliseconds per character. */
  speed?: number;
}) {
  const [progress, setProgress] = useState(0);
  // Where each line starts inside the flattened character stream.
  const offsets = useMemo(() => {
    const result: number[] = [];
    let seen = 0;
    for (const line of lines) {
      result.push(seen);
      seen += line.length;
    }
    return result;
  }, [lines]);
  const total = offsets.length > 0 ? offsets[offsets.length - 1] + lines[lines.length - 1].length : 0;

  useEffect(() => {
    if (total === 0) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const step = reduceMotion ? total : 1;

    const timer = window.setInterval(() => {
      setProgress((value) => {
        if (value >= total) {
          window.clearInterval(timer);
          return total;
        }
        return value + step;
      });
    }, speed);

    return () => window.clearInterval(timer);
  }, [total, speed]);

  return (
    <>
      {lines.map((line, index) => {
        const start = offsets[index] ?? 0;
        const visible = Math.max(0, Math.min(line.length, progress - start));
        const done = start + line.length <= progress;

        return (
          <p key={`${line}-${index}`} className={cn("mono truncate text-[11px] leading-relaxed", className)}>
            {line.slice(0, visible)}
            {!done && visible > 0 ? <Caret /> : null}
          </p>
        );
      })}
    </>
  );
}

function Caret() {
  return <span className="ml-px inline-block h-3 w-1.5 translate-y-px bg-accent/80 animate-blink" />;
}
