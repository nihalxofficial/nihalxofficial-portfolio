"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { TermToken } from "@/lib/terminal";

/**
 * Types the hero terminal lines out one character at a time, then leaves the
 * caret blinking on the last row — the "live console" feel from the reference.
 *
 * When a `tokenize` function is supplied each line is revealed as coloured
 * syntax spans instead of flat text, so the console matches the code panels.
 */
export function Typewriter({
  lines,
  className,
  speed = 26,
  tokenize,
}: {
  lines: string[];
  className?: string;
  /** Milliseconds per character. */
  speed?: number;
  /** Optional syntax highlighter applied to every line. */
  tokenize?: (line: string) => TermToken[];
}) {
  const [progress, setProgress] = useState(0);

  // Pre-tokenise once per line set so the reveal only moves a cursor over it.
  const tokenLines = useMemo(
    () => lines.map((line) => (tokenize ? tokenize(line) : [{ text: line }])),
    [lines, tokenize],
  );

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

  const total =
    offsets.length > 0 ? offsets[offsets.length - 1] + lines[lines.length - 1].length : 0;

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
      {tokenLines.map((tokens, index) => {
        const start = offsets[index] ?? 0;
        const lineLength = lines[index]?.length ?? 0;
        const visible = Math.max(0, Math.min(lineLength, progress - start));
        const done = start + lineLength <= progress;

        // Walk the tokens, spending the visible characters left-to-right.
        let remaining = visible;
        const shown: TermToken[] = [];
        for (const token of tokens) {
          if (remaining <= 0) break;
          if (token.text.length <= remaining) {
            shown.push(token);
            remaining -= token.text.length;
          } else {
            shown.push({ ...token, text: token.text.slice(0, remaining) });
            remaining = 0;
          }
        }

        return (
          <p
            key={`${lines[index]}-${index}`}
            className={cn("mono truncate text-[11px] leading-relaxed", className)}
          >
            {shown.map((token, position) => (
              <span key={position} className={token.cls || undefined}>
                {token.text}
              </span>
            ))}
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
