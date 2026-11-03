"use client";

import { useEffect, useState } from "react";
import { DynamicSiteBackground } from "@/components/site/dynamic-site-background";
import { NbLogo } from "@/components/ui/nb-logo";

const BOOT_LINES = [
  "[ OK ] Initializing Full Stack Developer environment",
  "[ OK ] Next.js 16 · TypeScript React runtime",
  "[ OK ] Core microservices & architecture online",
  "[ OK ] Loading verified projects & live telemetry",
  ">>> Ready. Welcome, visitor.",
];

/**
 * Single, full-screen cyber terminal boot sequence.
 * Features live DNA particle mesh, rotating orbital HUD rings,
 * and high-contrast telemetry readout.
 * Click or keypress to skip instantly.
 */
export function BootScreen({ done }: { done: () => void }) {
  const [n, setN] = useState(0);
  const [out, setOut] = useState(false);

  // Advance lines smoothly
  useEffect(() => {
    if (n < BOOT_LINES.length) {
      const t = setTimeout(() => setN(n + 1), 220);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setOut(true), 350);
    return () => clearTimeout(t);
  }, [n]);

  // Fade out → call done
  useEffect(() => {
    if (!out) return;
    const t = setTimeout(done, 400);
    return () => clearTimeout(t);
  }, [out, done]);

  // Any keydown skips boot
  useEffect(() => {
    const skip = () => setOut(true);
    window.addEventListener("keydown", skip);
    return () => window.removeEventListener("keydown", skip);
  }, []);

  const progressPercent = Math.min(100, Math.round((n / BOOT_LINES.length) * 100));

  return (
    <div
      onClick={() => setOut(true)}
      className={`fixed inset-0 z-[200] grid place-items-center overflow-hidden bg-[#03050f] px-4 cursor-pointer select-none transition-opacity duration-500 ${
        out ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-label="Boot screen - click anywhere to skip"
    >
      {/* Live Selected DNA Background */}
      <DynamicSiteBackground />

      {/* Radial vignette overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_20%,#03050f_85%)]"
      />

      {/* Cyber Grid Texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2] grid-bg opacity-25"
      />

      <div className="relative z-10 w-full max-w-lg font-mono">
        {/* Orbital Brand Centerpiece */}
        <div className="text-center mb-7">
          <div className="relative inline-flex items-center justify-center p-6">
            {/* Outer Slow-Spinning Dashed Tech Ring */}
            <div className="absolute inset-0 animate-spin-slow rounded-full border border-dashed border-cyan-400/35" />

            {/* Inner Counter-Spinning Tech Ring */}
            <div className="absolute inset-2 animate-spin-rev rounded-full border border-cyan-300/25" />

            {/* Ambient Cyan Halo Glow */}
            <div className="absolute inset-4 rounded-full bg-cyan-500/15 blur-xl pointer-events-none" />

            {/* Signature Stylish NB Monogram */}
            <NbLogo
              size={82}
              className="relative z-10 shadow-[0_0_35px_rgba(0,245,255,0.55)]"
            />
          </div>

          <div className="mt-3 space-y-1">
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-wide text-white">
              Md. Nihal Uddin Bijoy
            </h1>
            <p className="font-mono text-xs sm:text-sm font-semibold tracking-[0.28em] text-acc glow-sm">
              // FULL STACK DEVELOPER
            </p>
          </div>
        </div>

        {/* Cyber Terminal Window */}
        <div className="hud !border-white/15 bg-[#03050f]/85 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
          {/* Mac/Linux Chrome Window Bar */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
              <span className="font-mono ml-2 text-[10.5px] text-slate-400">
                boot://telemetry.sh
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-wider text-acc">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>telemetry online</span>
            </div>
          </div>

          {/* Terminal Output Lines */}
          <div className="min-h-[140px] space-y-2 text-xs sm:text-[13px]">
            {BOOT_LINES.slice(0, n).map((line, i) => (
              <div
                key={i}
                className={
                  line.startsWith(">")
                    ? "text-acc font-semibold animate-pulse flex items-center gap-1.5"
                    : "text-slate-300 flex items-center gap-2"
                }
              >
                {line.startsWith("[") ? (
                  <>
                    <span className="text-emerald-400 font-semibold">[ OK ]</span>
                    <span className="text-slate-200">{line.slice(6)}</span>
                  </>
                ) : (
                  line
                )}
              </div>
            ))}
            {n < BOOT_LINES.length && (
              <div className="text-acc animate-pulse text-xs">▍</div>
            )}
          </div>

          {/* Progress Bar Container */}
          <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-slate-400">
              <span className="text-slate-400">Environment Mounting</span>
              <span className="text-acc font-bold">{progressPercent}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-500 transition-all duration-300 shadow-[0_0_12px_rgba(0,245,255,0.85)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-3.5 text-center font-mono text-[10px] uppercase tracking-widest text-slate-400">
          click anywhere or press any key to enter
        </div>
      </div>
    </div>
  );
}
