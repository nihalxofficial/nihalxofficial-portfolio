"use client";

import { useEffect, useRef } from "react";

export type BackgroundMode = "dna" | "rain" | "none";

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const num = parseInt(clean.length === 3 ? clean.split("").map(c => c + c).join("") : clean, 16);
  if (isNaN(num)) return `rgba(34,211,238,${alpha})`;
  return `rgba(${(num >> 16) & 255},${(num >> 8) & 255},${num & 255},${alpha})`;
}

interface SiteBackgroundProps {
  accent: string;
  secondaryAccent?: string;
  mode: BackgroundMode;
}

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  baseAlpha: number;
};

/**
 * Fixed site background with switchable dynamic engines:
 * - "dna": Haiku connected particle constellation + 3D flowing double-helix bio-cyber wave.
 * - "rain": Dark Matrix falling code rain.
 * - "none": Minimalist dark space with cyber grid and ambient glow orbs.
 */
export function SiteBackground({ accent, secondaryAccent, mode }: SiteBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const accRef = useRef(accent);
  accRef.current = accent;
  const acc2Ref = useRef(secondaryAccent || "#7c4dff");
  acc2Ref.current = secondaryAccent || "#7c4dff";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (mode === "none") {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let raf = 0;
    let lastTime = 0;

    // ── DNA & Particle Field State ──
    let particles: Particle[] = [];
    let helixPhase = 0;
    const LINK_DIST = 140;

    // ── Rain State ──
    const size = 16;
    const chars = "01{}[]<>/=;:+*#$&|~".split("");
    let drops: number[] = [];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (mode === "dna") {
        const count = width < 768 ? 40 : 85;
        particles = Array.from({ length: count }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.6 + 0.6,
          baseAlpha: Math.random() * 0.4 + 0.4,
        }));
      } else if (mode === "rain") {
        drops = Array.from(
          { length: Math.ceil(width / size) },
          () => Math.random() * -60
        );
      }
    };

    resize();
    window.addEventListener("resize", resize);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Clear initial backdrop
    ctx.fillStyle = "#03050f";
    ctx.fillRect(0, 0, width, height);

    // ── Main Render Loop ──
    const draw = (timestamp: number) => {
      raf = requestAnimationFrame(draw);

      if (mode === "rain") {
        if (timestamp - lastTime < 70) return;
        lastTime = timestamp;

        ctx.fillStyle = "rgba(3,5,15,0.16)";
        ctx.fillRect(0, 0, width, height);
        ctx.font = `${size - 3}px "JetBrains Mono", monospace`;

        for (let i = 0; i < drops.length; i++) {
          const y = drops[i] * size;
          if (y > 0) {
            ctx.fillStyle = hexToRgba(accRef.current, 0.85);
            ctx.fillText(
              chars[Math.floor(Math.random() * chars.length)],
              i * size,
              y
            );
          }
          if (y > height && Math.random() > 0.975) drops[i] = Math.random() * -20;
          drops[i] += 0.6;
        }
        return;
      }

      if (mode === "dna") {
        ctx.clearRect(0, 0, width, height);

        const currentAcc = accRef.current || "#22d3ee";

        // 1. Render Flowing 3D Double-Helix Stream across the cyber backdrop
        helixPhase += 0.008;
        const helixY0 = height * 0.38;
        const amplitude = Math.min(height * 0.14, 110);
        const wavelength = Math.max(width * 0.28, 260);
        const k = (Math.PI * 2) / wavelength;
        const step = 28;

        ctx.lineWidth = 1.2;

        // Draw 3D Base-Pair Rungs
        for (let x = 0; x <= width + 40; x += step) {
          const angle = k * x - helixPhase;
          const sinVal = Math.sin(angle);
          const cosVal = Math.cos(angle); // 3D depth (-1 = back, +1 = front)

          // Undulating vertical drift
          const centerY = helixY0 + Math.sin(helixPhase * 0.4 + x * 0.001) * 35;
          const y1 = centerY + sinVal * amplitude;
          const y2 = centerY - sinVal * amplitude;

          // Depth based alpha: foreground rungs are brighter, background dimmer
          const depthAlpha = ((cosVal + 1) / 2) * 0.28 + 0.04;

          ctx.beginPath();
          ctx.strokeStyle = hexToRgba(currentAcc, depthAlpha);
          ctx.moveTo(x, y1);
          ctx.lineTo(x, y2);
          ctx.stroke();

          // Base pair nodes
          ctx.fillStyle = hexToRgba(currentAcc, depthAlpha * 1.5);
          ctx.beginPath();
          ctx.arc(x, y1, 2.2 + cosVal * 0.8, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = hexToRgba(acc2Ref.current || "#7c4dff", depthAlpha * 1.3);
          ctx.beginPath();
          ctx.arc(x, y2, 2.2 - cosVal * 0.8, 0, Math.PI * 2);
          ctx.fill();
        }

        // 2. Render Haiku Connected Particle Constellation Field
        for (const p of particles) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;
        }

        // Connect nearby particles with luminous cyber lines
        for (let i = 0; i < particles.length; i++) {
          const a = particles[i];
          for (let j = i + 1; j < particles.length; j++) {
            const b = particles[j];
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d < LINK_DIST) {
              const alpha = (1 - d / LINK_DIST) * 0.18;
              ctx.strokeStyle = hexToRgba(currentAcc, alpha);
              ctx.lineWidth = 0.9;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }

        // Draw particle nodes
        for (const p of particles) {
          ctx.fillStyle = hexToRgba(currentAcc, p.baseAlpha);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    if (!reduceMotion) {
      raf = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [mode]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-[#03050f]">
      {/* Dynamic Animated Canvas Engine */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 transition-opacity duration-1000 ${
          mode === "none" ? "opacity-0" : mode === "rain" ? "opacity-[0.22]" : "opacity-[0.85]"
        }`}
      />

      {/* Cyber Grid Mask Overlay */}
      <div className="absolute inset-0 grid-bg opacity-70" />

      {/* Ambient 3D Neon Radial Glow Orbs — driven by active primary & secondary accent */}
      <div
        className="absolute -top-40 -left-40 w-[620px] h-[620px] rounded-full blur-[130px] opacity-25 pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: accent || "var(--acc, #00e5ff)" }}
      />
      <div
        className="absolute -bottom-52 -right-40 w-[700px] h-[700px] rounded-full blur-[150px] opacity-20 pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: secondaryAccent || "var(--acc2, #7c4dff)" }}
      />
    </div>
  );
}
