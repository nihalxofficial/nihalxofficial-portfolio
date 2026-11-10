"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/admin/auth-provider";
import { ThemeCustomizerMenu } from "@/components/admin/theme-customizer";
import { Icon } from "@/components/ui/icon";
import { adminHref } from "@/lib/admin-routes";
import { fetchOverview } from "@/lib/admin";
import { initials } from "@/lib/utils";
import { ACCENTS } from "@/components/site/accent-context";
import type { BackgroundMode } from "@/components/site/site-background";

/**
 * Dashboard top bar.
 *
 * Sits above every dashboard page (offset by the sidebar on desktop). It carries
 * the page title, live accent selector, dynamic background effect selector,
 * unread-message bell, theme customizer, view site link, and account menu.
 */
export function AdminTopbar({
  title,
  eyebrow,
  menuOpen,
  onToggleMenu,
  accentId = "cyan",
  onAccentChange,
  bgMode = "dna",
  onBgModeChange,
}: {
  title: string;
  eyebrow?: string;
  menuOpen: boolean;
  onToggleMenu: () => void;
  accentId?: string;
  onAccentChange?: (id: string) => void;
  bgMode?: BackgroundMode;
  onBgModeChange?: (mode: BackgroundMode) => void;
}) {
  const { session, signOut } = useAuth();
  const [unread, setUnread] = useState(0);
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  // Keep the bell roughly current: on mount, every minute and on window focus.
  useEffect(() => {
    let active = true;
    const load = () =>
      fetchOverview()
        .then((overview) => active && setUnread(overview.counts.unreadMessages))
        .catch(() => {});

    load();
    const interval = window.setInterval(load, 60_000);
    window.addEventListener("focus", load);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", load);
    };
  }, []);

  // Dismiss the account menu on outside click or Escape.
  useEffect(() => {
    if (!userOpen) return;
    const onPointer = (event: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(event.target as Node)) setUserOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setUserOpen(false);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [userOpen]);

  const label = session?.name || session?.email || "Admin";
  const detail = session?.email || session?.uid || "";

  return (
    <header className="sticky top-0 z-30 border-b border-line/50 bg-gradient-to-r from-surface/90 via-surface/85 to-surface/90 shadow-lg shadow-black/5 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        {/* Mobile menu toggle with enhanced styling */}
        <button
          type="button"
          onClick={onToggleMenu}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="group grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-line/50 bg-surface/50 text-ink transition-all hover:border-accent/30 hover:bg-accent/5 hover:text-accent lg:hidden"
        >
          <Icon name={menuOpen ? "X" : "Menu"} className="h-5 w-5 transition-transform group-hover:scale-110" />
        </button>

        {/* Page title with breadcrumb */}
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <div className="mb-0.5 flex items-center gap-2">
              <span className="mono hidden truncate text-[10px] font-bold uppercase tracking-[0.2em] text-accent/80 sm:block">
                {eyebrow}
              </span>
            </div>
          )}
          <h1 className="truncate text-[15px] font-bold text-ink">{title}</h1>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Messages with enhanced notification badge */}
          <Link
            href={adminHref("messages")}
            aria-label={unread ? `${unread} unread messages` : "No unread messages"}
            title="Messages"
            className="group relative grid h-10 w-10 place-items-center rounded-lg border border-line/50 bg-surface/50 text-muted transition-all hover:border-accent/30 hover:bg-accent/5 hover:text-accent"
          >
            <Icon name="Bell" className="h-[18px] w-[18px] transition-transform group-hover:scale-110 group-hover:rotate-12" />
            {unread > 0 && (
              <>
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-75" />
                  <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-danger to-danger/80 text-[9px] font-bold text-white shadow-lg shadow-danger/30">
                    {unread > 9 ? "9+" : unread}
                  </span>
                </span>
              </>
            )}
          </Link>

          {/* Dynamic Background Effect selector (DNA / Rain / Grid) — same as main site */}
          {onBgModeChange && (
            <button
              type="button"
              onClick={() => {
                const next: BackgroundMode = bgMode === "dna" ? "rain" : bgMode === "rain" ? "none" : "dna";
                onBgModeChange(next);
              }}
              title={`Background: ${
                bgMode === "dna"
                  ? "DNA Neural Mesh (Default)"
                  : bgMode === "rain"
                  ? "Matrix Code Rain"
                  : "Minimal Grid"
              }`}
              className="flex h-10 items-center gap-1.5 rounded-lg border border-line/50 bg-surface/50 px-2.5 font-mono text-[11px] text-muted transition-all hover:border-accent/30 hover:bg-accent/5 hover:text-accent cursor-pointer shrink-0"
            >
              <Icon name="Activity" className="h-4 w-4 text-accent" />
              <span className="font-bold uppercase tracking-wider text-[10px]">
                {bgMode === "dna" ? "DNA" : bgMode === "rain" ? "Rain" : "Grid"}
              </span>
            </button>
          )}

          {/* Accent color picker — same 4 presets with active scale & ring, same as main site */}
          {onAccentChange && (
            <div className="flex h-10 items-center gap-1.5 rounded-lg border border-line/50 bg-surface/50 px-2.5 shrink-0" title="Accent color">
              <Icon name="Palette" className="h-3.5 w-3.5 text-muted mr-0.5 hidden xs:block" />
              {ACCENTS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => onAccentChange(a.id)}
                  aria-label={a.name}
                  title={a.name}
                  className={`h-4 w-4 rounded-full cursor-pointer transition ${
                    accentId === a.id
                      ? "scale-125 ring-2 ring-white/80"
                      : "opacity-70 hover:opacity-100"
                  }`}
                  style={{ background: `linear-gradient(135deg, ${a.a}, ${a.b})` }}
                />
              ))}
            </div>
          )}

          {/* Theme Customizer Menu (advanced dropdown) */}
          <ThemeCustomizerMenu />

          {/* View Site button with icon */}
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="group hidden h-10 items-center gap-2 rounded-lg border border-line/50 bg-surface/50 px-4 text-[13px] font-medium text-muted transition-all hover:border-accent/30 hover:bg-accent/5 hover:text-accent sm:inline-flex"
          >
            <Icon name="ExternalLink" className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            <span>View Site</span>
          </Link>

          {/* Account menu with enhanced dropdown */}
          <div ref={userRef} className="relative">
            <button
              type="button"
              onClick={() => setUserOpen((value) => !value)}
              aria-haspopup="menu"
              aria-expanded={userOpen}
              aria-label="Account"
              className="group flex items-center gap-2 rounded-lg border border-line/50 bg-surface/50 py-1.5 pl-1.5 pr-3 text-ink transition-all hover:border-accent/30 hover:bg-accent/5"
            >
              <div className="relative">
                <div className="absolute inset-0 animate-pulse rounded-lg bg-accent/20 opacity-0 blur-sm group-hover:opacity-100 transition-opacity" />
                <span className="relative grid h-7 w-7 place-items-center rounded-lg border border-accent/20 bg-gradient-to-br from-accent/20 to-accent/5 text-[11px] font-bold text-accent">
                  {initials(label)}
                </span>
              </div>
              <Icon
                name="ChevronDown"
                className={`h-3.5 w-3.5 text-muted transition-all group-hover:text-accent ${userOpen ? "rotate-180" : ""}`}
              />
            </button>

            {userOpen && (
              <div
                role="menu"
                className="absolute right-0 top-[calc(100%+12px)] w-64 overflow-hidden rounded-xl border border-line/50 bg-gradient-to-br from-surface/95 to-surface/80 shadow-2xl shadow-black/20 backdrop-blur-xl"
              >
                {/* User info header */}
                <div className="border-b border-line/50 bg-gradient-to-r from-accent/5 to-transparent px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg border border-accent/20 bg-gradient-to-br from-accent/20 to-accent/5 text-[13px] font-bold text-accent">
                      {initials(label)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-ink">{label}</p>
                      <p className="mono truncate text-[10px] text-muted">{detail}</p>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="p-1.5">
                  <Link
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    role="menuitem"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-muted transition-all hover:bg-surface-2/80 hover:text-accent sm:hidden"
                  >
                    <Icon name="Globe" className="h-4 w-4" />
                    <span>View Site</span>
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setUserOpen(false);
                      void signOut();
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] text-muted transition-all hover:bg-danger/10 hover:text-danger"
                  >
                    <Icon name="LogOut" className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
