"use client";

import { useEffect, useRef } from "react";

function hexToRgba(hex: string, alpha: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

interface SiteBackgroundProps {
  accent: string;
  rain: boolean;
}

/**
 * Fixed behind everything: matrix code rain canvas + grid overlay + glow orbs.
 * Matches the reference Background.tsx exactly.
 */
export function SiteBackground({ accent, rain }: SiteBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const accRef = useRef(accent);
  accRef.current = accent;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 16;
    const chars = "01{}[]<>/=;:+*#$&|~".split("");
    let w = 0,
      h = 0,
      drops: number[] = [],
      raf = 0,
      last = 0;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      drops = Array.from(
        { length: Math.ceil(w / size) },
        () => Math.random() * -60
      );
    };

    resize();
    window.addEventListener("resize", resize);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    ctx.fillStyle = "#03050f";
    ctx.fillRect(0, 0, w, h);

    const draw = (t: number) => {
      raf = requestAnimationFrame(draw);
      if (t - last < 70) return;
      last = t;

      ctx.fillStyle = "rgba(3,5,15,0.16)";
      ctx.fillRect(0, 0, w, h);
      ctx.font = `${size - 3}px "JetBrains Mono", monospace`;

      for (let i = 0; i < drops.length; i++) {
        const y = drops[i] * size;
        if (y > 0) {
          ctx.fillStyle = hexToRgba(accRef.current, 0.9);
          ctx.fillText(
            chars[Math.floor(Math.random() * chars.length)],
            i * size,
            y
          );
        }
        if (y > h && Math.random() > 0.975) drops[i] = Math.random() * -20;
        drops[i] += 0.6;
      }
    };

    if (!reduce && rain) raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [rain]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-ink">
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 transition-opacity duration-700 ${rain ? "opacity-[0.16]" : "opacity-0"}`}
      />
      {/* grid */}
      <div className="absolute inset-0 grid-bg" />
      {/* glow orbs */}
      <div className="absolute -top-40 -left-40 w-[620px] h-[620px] rounded-full blur-[120px] opacity-25 bg-acc" />
      <div className="absolute -bottom-52 -right-40 w-[700px] h-[700px] rounded-full blur-[140px] opacity-20 bg-acc2" />
    </div>
  );
}

