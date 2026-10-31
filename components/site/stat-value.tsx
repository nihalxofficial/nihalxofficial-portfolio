"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Parsed {
  prefix: string;
  target: number;
  suffix: string;
  decimals: number;
}

/** Splits `100+` into a numeric core that can tick up plus its decoration. */
function parseValue(value: string): Parsed | null {
  const match = /^(\D*?)(\d+(?:\.\d+)?)(.*)$/.exec(value.trim());
  if (!match) return null;
  return {
    prefix: match[1] ?? "",
    target: Number(match[2]),
    suffix: match[3] ?? "",
    decimals: (match[2]?.split(".")[1] ?? "").length,
  };
}

/**
 * A metric that counts up from zero the first time it scrolls into view.
 * Values without digits (`∞`) are rendered exactly as written.
 */
export function StatValue({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const parsed = useMemo(() => parseValue(value), [value]);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(() => (parsed ? "0" : value));

  useEffect(() => {
    if (!parsed || !inView) return;

    // A zero-duration tween still reports through `onUpdate`, so the final
    // value lands without a synchronous state write.
    const controls = animate(0, parsed.target, {
      duration: reduceMotion ? 0 : 1.3,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplay(latest.toFixed(parsed.decimals)),
    });

    return () => controls.stop();
  }, [parsed, inView, reduceMotion]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)} aria-label={value}>
      <span aria-hidden>
        {parsed ? `${parsed.prefix}${display}${parsed.suffix}` : value}
      </span>
    </span>
  );
}
