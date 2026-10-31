"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { SocialProvider } from "@/components/admin/auth-provider";
import { Icon } from "@/components/ui/icon";

/**
 * Shared chrome for the two private auth screens.
 *
 * Kept in one place so the login and register pages stay thin and identical
 * visually — only the fields and the wording differ.
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
    <div className="relative grid min-h-screen place-items-center px-5 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 grid-backdrop radial-fade opacity-60"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-16 h-[420px] w-[680px] -translate-x-1/2 glow-soft opacity-70"
      />

      <div className="relative w-full max-w-sm">
        <div className="panel p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl grad-accent text-accent-ink">
              <Icon name="LayoutDashboard" className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-ink">{title}</p>
              <p className="mono text-[10px] uppercase tracking-[0.16em] text-faint">
                {eyebrow}
              </p>
            </div>
          </div>

          <p className="mt-4 text-[12px] leading-relaxed text-muted">{subtitle}</p>

          {children}
        </div>

        <div className="mono mt-4 flex items-center justify-center gap-3 text-[10.5px] text-faint">
          {footer}
        </div>

        <p className="mono mt-2 text-center text-[10.5px] text-faint">
          <Link href="/" className="hover:text-accent">
            ← back to the public site
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
    "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line bg-surface-2/60 px-3 text-[12.5px] font-medium text-ink transition-colors hover:border-line-strong hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-55";

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
      <span className="h-px flex-1 bg-line" />
      <span className="mono text-[9.5px] uppercase tracking-[0.18em] text-faint">{label}</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

export function AuthError({ message }: { message: string }) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className="mt-3 flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-[11.5px] leading-relaxed text-danger"
    >
      <Icon name="X" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      {message}
    </p>
  );
}

/** Shown while Firebase web config is still empty in `.env.local`. */
export function ConfigNotice({ message }: { message: string }) {
  return (
    <div className="mt-5 rounded-xl border border-warning/35 bg-warning/10 p-4">
      <p className="flex items-center gap-2 text-[12.5px] font-medium text-warning">
        <Icon name="Settings" className="h-4 w-4" />
        Firebase web config missing
      </p>
      <p className="mt-2 text-[12px] leading-relaxed text-muted">{message}</p>
      <p className="mono mt-3 rounded-lg border border-line bg-surface-2 px-3 py-2 text-[10.5px] leading-relaxed text-faint">
        portfolio/.env.local
        <br />
        NEXT_PUBLIC_FIREBASE_API_KEY=…
        <br />
        NEXT_PUBLIC_FIREBASE_APP_ID=…
      </p>
    </div>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="mono text-[10px] uppercase tracking-[0.18em] text-faint">{children}</span>
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
