"use client";

import { useEffect, useState } from "react";

const BOOT_LINES = [
  "[ OK ] Initializing DevOS kernel v2.5.0",
  "[ OK ] Mounting /dev/skills … 24 modules loaded",
  "[ OK ] Loading projects … found",
  "[ OK ] Compiling creativity.ts",
  "[ OK ] Starting interactive terminal",
  "[ OK ] Accent engine online",
  ">>>  Welcome, visitor.",
];

/**
 * Full-screen terminal boot sequence. Shown only once per browser session
 * (sessionStorage flag). Click or keypress to skip.
 */
export function BootScreen({ done }: { done: () => void }) {
  const [n, setN] = useState(0);
  const [out, setOut] = useState(false);

  // Advance lines
  useEffect(() => {
    if (n < BOOT_LINES.length) {
      const t = setTimeout(() => setN(n + 1), 260);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setOut(true), 450);
    return () => clearTimeout(t);
  }, [n]);

  // Fade out → call done
  useEffect(() => {
    if (!out) return;
    const t = setTimeout(done, 500);
    return () => clearTimeout(t);
  }, [out, done]);

  // Any keydown skips boot
  useEffect(() => {
    const skip = () => setOut(true);
    window.addEventListener("keydown", skip);
    return () => window.removeEventListener("keydown", skip);
  }, []);

  return (
    <div
      onClick={() => setOut(true)}
      className={`fixed inset-0 z-[200] bg-ink grid place-items-center px-6 cursor-pointer transition-opacity duration-500 ${out ? "opacity-0" : "opacity-100"}`}
    >
      <div className="w-full max-w-lg font-mono text-xs sm:text-sm">
        {/* Brand mark */}
        <div className="text-center mb-8">
          <div className="inline-grid place-items-center w-20 h-20 rounded-2xl ring-acc glow font-black italic text-3xl text-grad">
            NL
          </div>
          <div className="mt-3 font-display text-xl font-bold tracking-[0.3em] text-grad">
            DEV·OS
          </div>
        </div>

        {/* Boot log */}
        <div className="space-y-1 min-h-[170px]">
          {BOOT_LINES.slice(0, n).map((line, i) => (
            <div
              key={i}
              className={line.startsWith(">") ? "text-acc font-bold" : "text-slate-300"}
            >
              {line.startsWith("[") ? (
                <>
                  <span className="text-emerald-400">[ OK ]</span>
                  {line.slice(6)}
                </>
              ) : (
                line
              )}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-grad transition-all duration-300"
            style={{ width: `${(n / BOOT_LINES.length) * 100}%` }}
          />
        </div>
        <div className="mt-3 text-center text-[10px] text-slate-600">
          press any key to skip
        </div>
      </div>
    </div>
  );
}

