"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Animated progress bar that starts at 0% width and smoothly fills to `value`%
 * when it scrolls into view (or on mount).
 */
export function AnimatedProgressBar({
  value,
  className,
  barClassName,
  color,
  delay = 0,
  duration = 1.2,
}: {
  value: number; // 0 to 100
  className?: string;
  barClassName?: string;
  color?: string;
  delay?: number;
  duration?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -5% 0px" });
  const reduceMotion = useReducedMotion();
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!inView) return;

    const targetWidth = Math.min(100, Math.max(0, value));

    if (reduceMotion) {
      setWidth(targetWidth);
      return;
    }

    const t = setTimeout(() => {
      setWidth(targetWidth);
    }, Math.max(0, delay * 1000));

    return () => clearTimeout(t);
  }, [inView, value, delay, reduceMotion]);

  const customColor = color || "var(--acc)";

  return (
    <div
      ref={ref}
      className={cn(
        "w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden relative",
        className
      )}
    >
      <div
        className={cn("h-full rounded-full transition-all ease-out", barClassName)}
        style={{
          width: `${width}%`,
          transitionDuration: `${duration}s`,
          background: color
            ? `linear-gradient(90deg, ${customColor}99, ${customColor})`
            : undefined,
          boxShadow: color ? `0 0 10px ${customColor}88` : undefined,
        }}
      />
    </div>
  );
}

/**
 * Animated number counter that counts up from 0 to `value` when scrolled into view.
 */
export function AnimatedNumber({
  value,
  duration = 1.2,
  prefix = "",
  suffix = "",
  className,
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -5% 0px" });
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;

    if (reduceMotion) {
      setDisplay(value);
      return;
    }

    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1], // expo ease-out
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });

    return () => controls.stop();
  }, [inView, value, duration, reduceMotion]);

  return (
    <span ref={ref} className={cn("tabular-nums font-mono", className)}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
