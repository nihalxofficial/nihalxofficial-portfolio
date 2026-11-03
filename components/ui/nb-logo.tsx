"use client";

import Image from "next/image";

interface NbLogoProps {
  size?: number | string;
  className?: string;
  glow?: boolean;
}

/**
 * Modern Cyber "NB" Monogram Logo.
 *
 * Matches Md. Nihal Uddin Bijoy's signature neon cyber developer branding:
 * - Interlocked metallic "NB" monogram
 * - Precision </> code brackets inside the negative space
 * - Luminous cyan orbital ring with 4-pointed radiant flare
 * - High-tech HUD badge framing with cyan/violet ambient glow
 */
export function NbLogo({ size = 42, className = "", glow = true }: NbLogoProps) {
  const pixelSize = typeof size === "number" ? size : parseInt(String(size), 10) || 42;

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-flex shrink-0 items-center justify-center rounded-2xl overflow-hidden border border-cyan-400/40 bg-[#03050f] shadow-[0_0_16px_rgba(0,245,255,0.3)] transition-all duration-300 hover:border-cyan-400/70 hover:shadow-[0_0_24px_rgba(0,245,255,0.55)] hover:scale-105 ${
        glow ? "glow-sm" : ""
      } ${className}`}
      aria-label="Md. Nihal Uddin Bijoy — NB Full Stack Developer"
      role="img"
    >
      {/* Corner Tech Reticle Highlights */}
      <span className="pointer-events-none absolute top-1 left-1 h-1.5 w-1.5 border-t border-l border-cyan-300/80 z-10" />
      <span className="pointer-events-none absolute bottom-1 right-1 h-1.5 w-1.5 border-b border-r border-fuchsia-400/80 z-10" />

      {/* Reference Cyber NB Artwork Badge */}
      <Image
        src="/nb-logo-badge.png"
        alt="NB Logo"
        width={pixelSize * 2}
        height={pixelSize * 2}
        className="h-full w-full object-cover select-none pointer-events-none"
        priority
      />
    </div>
  );
}
