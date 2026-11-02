"use client";

import { useId } from "react";

interface NbLogoProps {
  size?: number | string;
  className?: string;
  glow?: boolean;
}

/**
 * Custom cyber-aesthetic "NB" monogram logo.
 * Interlocks 'N' and 'B' into a precision geometric cyber badge
 * with neon cyan and violet gradients matching the OS terminal HUD.
 */
export function NbLogo({ size = 40, className = "", glow = true }: NbLogoProps) {
  const id = useId().replace(/:/g, "_");
  const bgGradId = `nb-bg-${id}`;
  const strokeGradId = `nb-stroke-${id}`;
  const fillGradId = `nb-fill-${id}`;
  const glowFilterId = `nb-glow-${id}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-300 hover:scale-105 ${className}`}
      aria-label="NB Logo"
      role="img"
    >
      <defs>
        {/* Dark cyber badge background */}
        <linearGradient id={bgGradId} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#070c30" />
          <stop offset="50%" stopColor="#040718" />
          <stop offset="100%" stopColor="#02030a" />
        </linearGradient>

        {/* Neon outer border gradient */}
        <linearGradient id={strokeGradId} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00f0ff" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#d946ef" />
        </linearGradient>

        {/* Monogram letters gradient */}
        <linearGradient id={fillGradId} x1="15" y1="20" x2="85" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00f5ff" />
          <stop offset="45%" stopColor="#38bdf8" />
          <stop offset="75%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>

        {/* Neon bloom glow filter */}
        <filter id={glowFilterId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Cyber badge container */}
      <rect
        x="4"
        y="4"
        width="92"
        height="92"
        rx="22"
        fill={`url(#${bgGradId})`}
        stroke={`url(#${strokeGradId})`}
        strokeWidth="2.5"
      />

      {/* Inner subtle tech reticles */}
      <path
        d="M12 24 L12 12 L24 12"
        stroke="#00f0ff"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M88 76 L88 88 L76 88"
        stroke="#d946ef"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Interlocked NB Monogram */}
      <g filter={glow ? `url(#${glowFilterId})` : undefined}>
        {/* 'N' Left Stem */}
        <path
          d="M24 74 L24 26 L32.5 26 L32.5 74 Z"
          fill={`url(#${fillGradId})`}
        />

        {/* 'N' Dynamic Diagonal */}
        <path
          d="M29 26 L48.5 64 L48.5 74 L40 74 L24 38 L24 26 Z"
          fill={`url(#${fillGradId})`}
        />

        {/* 'N' Right Stem which acts as shared spine of 'B' */}
        <path
          d="M48 26 L56.5 26 L56.5 74 L48 74 Z"
          fill={`url(#${fillGradId})`}
        />

        {/* 'B' Top Loop */}
        <path
          d="M54 26 L66 26 C73.5 26 77.5 30 77.5 37 C77.5 43.5 73.5 48 65.5 48 L54 48 L54 40 L64 40 C67.5 40 69.5 39 69.5 37 C69.5 35 67.5 34 64 34 L54 34 Z"
          fill={`url(#${fillGradId})`}
        />

        {/* 'B' Bottom Loop */}
        <path
          d="M54 46 L68 46 C76 46 80.5 50.5 80.5 58 C80.5 66.5 75.5 74 66.5 74 L54 74 L54 66 L65 66 C69 66 72 63.5 72 59.5 C72 55.5 69 54 65 54 L54 54 Z"
          fill={`url(#${fillGradId})`}
        />

        {/* Precision Cyber Cut Notch between N and B */}
        <polygon points="43,45 47,45 45,51" fill="#040718" />

        {/* Glowing Circuit Node Dot */}
        <circle cx="56.5" cy="50" r="2.2" fill="#00f0ff" />
      </g>
    </svg>
  );
}

