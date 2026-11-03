"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/admin/auth-provider";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Icon } from "@/components/ui/icon";
import { adminHref } from "@/lib/admin-routes";
import { fetchOverview } from "@/lib/admin";
import { initials } from "@/lib/utils";

/**
 * Dashboard top bar.
 *
 * Sits above every dashboard page (offset by the sidebar on desktop). It carries
 * the page title, a live unread-message bell, the theme switcher, a link back to
 * the public site and an account menu — the everyday controls that were not
 * worth hunting for in the sidebar.
 */
export function AdminTopbar({
  title,
  eyebrow,
  menuOpen,
  onToggleMenu,
}: {
  title: string;
  eyebrow?: string;
  menuOpen: boolean;
  onToggleMenu: () => void;
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
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-line bg-page/85 px-3 backdrop-blur-xl sm:px-5">
      {/* Mobile: reveal the sidebar drawer */}
      <button
        type="button"
        onClick={onToggleMenu}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line text-ink transition-colors hover:border-line-strong lg:hidden"
      >
        <Icon name={menuOpen ? "X" : "Menu"} className="h-4 w-4" />
      </button>

      <div className="min-w-0">
        {eyebrow ? (
          <p className="mono hidden truncate text-[9px] uppercase tracking-[0.2em] text-faint sm:block">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="truncate text-[13.5px] font-semibold text-ink">{title}</h1>
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        {/* Notifications → message inbox */}
        <Link
          href={adminHref("messages")}
          aria-label={unread ? `${unread} unread messages` : "No unread messages"}
          title="Messages"
          className="relative grid h-9 w-9 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-line-strong hover:text-accent"
        >
          <Icon name="Bell" className="h-[18px] w-[18px]" />
          {unread > 0 ? (
            <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[9px] font-bold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </Link>

        <ThemeToggle className="h-9 w-9 rounded-lg" />

        {/* Open the public site in a new tab */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-[12px] font-medium text-muted transition-colors hover:border-line-strong hover:text-accent sm:inline-flex"
        >
          <Icon name="ExternalLink" className="h-3.5 w-3.5" />
          View site
        </Link>

        {/* Account menu */}
        <div ref={userRef} className="relative">
          <button
            type="button"
            onClick={() => setUserOpen((value) => !value)}
            aria-haspopup="menu"
            aria-expanded={userOpen}
            aria-label="Account"
            className="flex items-center gap-1.5 rounded-lg border border-line py-1 pl-1 pr-2 text-ink transition-colors hover:border-line-strong"
          >
            <span className="grid h-7 w-7 place-items-center rounded-md grad-accent text-[11px] font-bold text-accent-ink">
              {initials(label)}
            </span>
            <Icon
              name="ChevronDown"
              className={`h-3.5 w-3.5 text-faint transition-transform ${userOpen ? "rotate-180" : ""}`}
            />
          </button>

          {userOpen ? (
            <div
              role="menu"
              className="absolute right-0 top-[calc(100%+8px)] w-56 overflow-hidden rounded-xl border border-line bg-surface shadow-[0_20px_50px_-24px_var(--accent-glow)]"
            >
              <div className="border-b border-line px-3.5 py-3">
                <p className="truncate text-[12.5px] font-semibold text-ink">{label}</p>
                <p className="mono truncate text-[10px] text-faint">{detail}</p>
              </div>
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                role="menuitem"
                className="flex items-center gap-2.5 px-3.5 py-2.5 text-[12.5px] text-muted transition-colors hover:bg-surface-2 hover:text-ink sm:hidden"
              >
                <Icon name="Globe" className="h-4 w-4" />
                View site
              </Link>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setUserOpen(false);
                  void signOut();
                }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[12.5px] text-muted transition-colors hover:bg-danger/10 hover:text-danger"
              >
                <Icon name="LogOut" className="h-4 w-4" />
                Sign out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
