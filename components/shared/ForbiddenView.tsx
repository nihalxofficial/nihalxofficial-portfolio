"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert, Lock, ArrowLeft, Home, LogIn, AlertTriangle, Sparkles } from "lucide-react";
import { ADMIN_BASE } from "@/lib/admin-routes";

export default function ForbiddenView() {
  const router = useRouter();

  return (
    <main className="min-h-[100dvh] w-full flex flex-col items-center justify-center px-4 py-6 relative overflow-hidden bg-background text-foreground">
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,229,255,0.15),transparent)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-red-500/10 to-transparent pointer-events-none" />

      <div className="max-w-xl w-full text-center space-y-4 relative z-10 my-auto">
        {/* 403 Hero Graphic */}
        <div className="relative flex items-center justify-center group">
          <h1 className="text-8xl sm:text-9xl font-black tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-500 select-none drop-shadow-sm transition-transform duration-500 ease-out group-hover:scale-105">
            403
          </h1>

          <div className="absolute bottom-1 flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface/90 backdrop-blur-md border border-line shadow-lg">
            <Lock className="w-3.5 h-3.5 text-red-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink">
              Access Forbidden
            </span>
          </div>
        </div>

        {/* Text Header */}
        <div className="space-y-1.5 max-w-md mx-auto">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[11px] font-semibold tracking-wide border border-red-500/20">
            <Sparkles className="w-3 h-3" />
            <span>Restricted Gateway</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
            Access Denied
          </h2>

          <p className="text-xs sm:text-sm text-faint leading-relaxed font-normal">
            You do not have the required administrator role to access this area.
          </p>
        </div>

        {/* Red Alert Callout */}
        <div
          role="alert"
          aria-live="assertive"
          className="max-w-md mx-auto p-3.5 rounded-xl bg-red-950/30 border border-red-500/40 shadow-lg text-left"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-md shrink-0">
              <ShieldAlert className="w-4 h-4 animate-pulse" />
            </div>

            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-black tracking-wider uppercase text-red-400">
                  Security Clearance Required
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                  HTTP 403
                </span>
              </div>

              <h3 className="text-xs sm:text-sm font-bold text-ink flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>Admin Role Missing</span>
              </h3>

              <p className="text-[11px] sm:text-xs text-faint leading-relaxed">
                Your authenticated session is active, but only accounts with the <code>admin</code> role can access the control centre.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-ink font-semibold text-xs sm:text-sm shadow-md transition-all hover:glow-sm cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Back to Site</span>
          </Link>

          <Link
            href={`${ADMIN_BASE}/login`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-surface-2 text-ink font-semibold text-xs sm:text-sm border border-line shadow-xs hover:border-accent hover:text-accent transition-all cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Switch Account</span>
          </Link>

          <button
            type="button"
            onClick={() => router.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-faint hover:text-ink font-semibold text-xs sm:text-sm border border-transparent hover:border-line transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </main>
  );
}

