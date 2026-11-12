"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { SocialProvider } from "@/components/admin/auth-provider";
import { DynamicSiteBackground } from "@/components/site/dynamic-site-background";
import { Icon } from "@/components/ui/icon";
import { NbLogo } from "@/components/ui/nb-logo";

/**
 * Shared chrome for the private auth screens (Login & Register).
 * Styled with live dynamic DNA mesh / selected background mode,
 * cyber HUD glass panel, and custom "NB" developer brand badge.
 */
export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-start sm:justify-center overflow-x-hidden overflow-y-auto bg-[#03050f] px-4 py-8 sm:py-12">
      {/* Live Animated DNA / Selected Background Mode */}
      <DynamicSiteBackground />

      {/* Radial vignette overlay */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_20%,#03050f_85%)]"
      />

      {/* Cyber Grid Texture */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[2] grid-bg opacity-25"
      />

      <div className="relative z-10 my-auto w-full max-w-sm">
        {/* Main Glass Panel */}
        <div className="hud !border-white/15 bg-[#03050f]/85 p-6 sm:p-7 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] backdrop-blur-2xl">
          {/* Header with NB Logo */}
          <div className="flex items-center gap-3.5 pb-4 border-b border-white/10">
            <NbLogo size={46} className="shadow-[0_0_20px_rgba(0,245,255,0.4)]" />
            <div className="min-w-0">
              <p className="font-display text-[16px] font-bold text-white tracking-wide">{title}</p>
              <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-acc flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                {eyebrow}
              </p>
            </div>
          </div>

          <p className="mt-3.5 text-[11.5px] leading-relaxed text-slate-300 font-mono">{subtitle}</p>

          <div className="mt-4">{children}</div>
        </div>

        {/* Footer links */}
        <div className="font-mono mt-4 flex items-center justify-center gap-3 text-[11px] text-slate-400">
          {footer}
        </div>

        <p className="font-mono mt-2.5 text-center text-[10.5px] text-slate-500">
          <Link href="/" className="hover:text-acc transition-colors">
            ← back to portfolio
          </Link>
        </p>
      </div>
    </div>
  );
}

export function SocialButtons({
  disabled,
  onProvider,
}: {
  disabled: boolean;
  onProvider: (provider: SocialProvider) => void;
}) {
  const base =
    "inline-flex h-10 items-center justify-center gap-2 rounded-xl hud !border-white/10 bg-white/[0.02] px-3 font-mono text-[12px] font-medium text-slate-200 transition-all hover:border-acc/40 hover:text-white hover:glow-sm disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onProvider("google")}
        className={base}
      >
        <GoogleMark />
        Google
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onProvider("github")}
        className={base}
      >
        <Icon name="Github" className="h-4 w-4" />
        GitHub
      </button>
    </div>
  );
}

export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="my-4 flex items-center gap-3">
      <span className="h-px flex-1 bg-white/10" />
      <span className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-slate-400">{label}</span>
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}

export function AuthError({ message }: { message: string }) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className="mt-3 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 font-mono text-[11px] leading-relaxed text-red-400"
    >
      <Icon name="X" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      {message}
    </p>
  );
}

/** Shown while auth config is still empty in `.env.local`. */
export function ConfigNotice({ message }: { message: string }) {
  return (
    <div className="mt-5 rounded-xl border border-amber-500/35 bg-amber-500/10 p-4 font-mono">
      <p className="flex items-center gap-2 text-[12px] font-semibold text-amber-400">
        <Icon name="Settings" className="h-4 w-4" />
        Auth configuration missing
      </p>
      <p className="mt-2 text-[11.5px] leading-relaxed text-slate-300">{message}</p>
      <p className="mt-3 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-[10px] leading-relaxed text-slate-400">
        portfolio/.env.local
        <br />
        BETTER_AUTH_SECRET=…
        <br />
        MONGODB_URI=…
      </p>
    </div>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">{children}</span>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.9-.1-1.5-.2-2.2H12v4.1h6.6c-.1 1.1-.8 2.7-2.4 3.8l-.1.1 3.5 2.7c2-1.9 3.9-4.7 3.9-8.5Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.3 1.2-4.1 1.2a7.2 7.2 0 0 1-6.8-5l-.1.1-3.6 2.8A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.2 14.4a7.4 7.4 0 0 1 0-4.8l-.1-.1-3.6-2.8a12 12 0 0 0 0 10.6l3.7-2.9Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.7c2.3 0 3.9 1 4.8 1.8l3.3-3.2A11.6 11.6 0 0 0 12 0 12 12 0 0 0 1.5 6.7l3.7 2.9A7.2 7.2 0 0 1 12 4.7Z"
      />
    </svg>
  );
}
