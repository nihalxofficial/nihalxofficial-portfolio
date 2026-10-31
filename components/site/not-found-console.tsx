"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * The 404 page's request log.
 *
 * Kept in its own client component because the attempted route is only known in
 * the browser. Lines are revealed one by one; with reduced motion the whole log
 * appears at once. The state update lives inside the timer callback, so the
 * first client render still matches the server HTML.
 */

interface LogLine {
  id: string;
  glyph: string;
  className: string;
  text: ReactNode;
}

const STEP_MS = 260;

function logFor(pathname: string): LogLine[] {
  return [
    {
      id: "request",
      glyph: "↑",
      className: "text-muted",
      text: (
        <>
          GET <span className="text-ink">{pathname}</span>
        </>
      ),
    },
    {
      id: "resolve",
      glyph: "→",
      className: "text-muted",
      text: "matching route manifest · no page found",
    },
    {
      id: "status",
      glyph: "✕",
      className: "text-danger",
      text: "404 · the link may be old, renamed or unpublished",
    },
    {
      id: "next",
      glyph: "•",
      className: "text-accent",
      text: "pick a destination to get back on track",
    },
  ];
}

export function NotFoundConsole() {
  const pathname = usePathname() ?? "/";
  const lines = logFor(pathname);
  const [visible, setVisible] = useState(1);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      setVisible((count) => {
        if (count >= lines.length) return count;
        return reduceMotion ? lines.length : count + 1;
      });
    }, STEP_MS);

    return () => window.clearInterval(timer);
  }, [lines.length]);

  return (
    <div className="mono space-y-1.5 text-[11.5px] leading-relaxed">
      {lines.slice(0, visible).map((line) => (
        <p key={line.id} className="flex gap-2">
          <span aria-hidden className="w-3 shrink-0 text-faint">
            {line.glyph}
          </span>
          <span className={line.className}>{line.text}</span>
        </p>
      ))}

      <p className="flex gap-2 pt-1 text-faint">
        <span className="w-3 shrink-0">$</span>
        <span aria-hidden className="inline-block h-3.5 w-1.5 self-center bg-accent animate-blink" />
      </p>
    </div>
  );
}
