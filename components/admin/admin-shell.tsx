"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/components/admin/auth-provider";
import { useAdminData } from "@/components/admin/admin-context";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Icon } from "@/components/ui/icon";
import { ADMIN_BASE, adminHref } from "@/lib/admin-routes";
import { initials } from "@/lib/utils";

type NavLink = { href: string; label: string; icon: string };

/** Primary dashboard actions, shown under a "Manage" heading. */
const MANAGE_LINKS: NavLink[] = [
  { href: ADMIN_BASE, label: "Overview", icon: "LayoutDashboard" },
  { href: adminHref("analytics"), label: "Analytics", icon: "Gauge" },
  { href: adminHref("messages"), label: "Messages", icon: "Inbox" },
  { href: adminHref("media"), label: "Media", icon: "Image" },
];

/** Pinned to the very bottom of the sidebar, separate from the scroll groups. */
const SETTINGS_LINK: NavLink = {
  href: adminHref("site-settings"),
  label: "Site settings",
  icon: "Settings",
};

/** Edited from the Site settings page instead of the generic form. */
const HIDDEN_ENTITIES = ["settings"];

/**
 * Dashboard chrome and access gate.
 *
 * Nothing inside renders until the API has accepted the session, so a signed-in
 * Firebase account that is missing from ADMIN_UIDS never sees the dashboard.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { session, loading, error, configError, signOut } = useAuth();
  const { types } = useAdminData();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !session && !configError) router.replace(adminHref("login"));
  }, [loading, session, configError, router]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  if (configError) {
    return (
      <Gate title="Dashboard not configured" body={configError}>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-line-strong px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
        >
          <Icon name="ArrowLeft" className="h-4 w-4" />
          Back to site
        </Link>
      </Gate>
    );
  }

  if (loading || !session) {
    return (
      <Gate
        title={loading ? "Checking access…" : "Redirecting to sign-in…"}
        body={error || "Verifying your Firebase session against the admin allowlist."}
      >
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-line-strong border-t-accent" />
      </Gate>
    );
  }

  const contentLinks: NavLink[] = types
    .filter((type) => !HIDDEN_ENTITIES.includes(type.key))
    .map((type) => ({
      href: adminHref(type.key),
      label: type.label,
      icon: type.singleton ? "Settings" : "FolderKanban",
    }));

  const isActive = (href: string) =>
    href === ADMIN_BASE ? pathname === ADMIN_BASE : pathname === href;

  const current = [...MANAGE_LINKS, ...contentLinks, SETTINGS_LINK].find((item) =>
    isActive(item.href),
  );

  const navItem = (item: NavLink) => {
    const active = isActive(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.5px] transition-colors ${
          active ? "bg-accent/12 text-accent" : "text-muted hover:bg-surface-2 hover:text-ink"
        }`}
      >
        <Icon name={item.icon} className="h-4 w-4 shrink-0" />
        <span className="truncate">{item.label}</span>
      </Link>
    );
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link href={ADMIN_BASE} className="flex items-center gap-3 px-4 py-4">
        <span className="grid h-9 w-9 place-items-center rounded-lg grad-accent text-[12px] font-bold text-accent-ink">
          {initials(session.name || session.email || "Admin")}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[13px] font-semibold text-ink">
            {session.name || "Dashboard"}
          </span>
          <span className="mono block truncate text-[10px] uppercase tracking-[0.14em] text-faint">
            {session.email || session.uid.slice(0, 10)}
          </span>
        </span>
      </Link>

      <nav className="scrollbar-none flex-1 overflow-y-auto px-2 pb-4">
        <p className="mono px-2 pb-1.5 pt-1 text-[9.5px] uppercase tracking-[0.2em] text-faint">
          Manage
        </p>
        <div className="space-y-0.5">{MANAGE_LINKS.map(navItem)}</div>

        {contentLinks.length ? (
          <>
            <p className="mono mt-4 px-2 pb-1.5 text-[9.5px] uppercase tracking-[0.2em] text-faint">
              Content
            </p>
            <div className="space-y-0.5">{contentLinks.map(navItem)}</div>
          </>
        ) : null}
      </nav>

      {/* Site settings stays pinned to the bottom, above the account footer. */}
      <div className="border-t border-line px-2 py-2">
        <p className="mono px-2 pb-1.5 text-[9.5px] uppercase tracking-[0.2em] text-faint">
          System
        </p>
        {navItem(SETTINGS_LINK)}
      </div>

      <div className="border-t border-line p-2">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.5px] text-muted transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <Icon name="Globe" className="h-4 w-4" />
          View site
        </Link>
        <button
          type="button"
          onClick={() => void signOut()}
          className="mt-0.5 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.5px] text-muted transition-colors hover:bg-danger/10 hover:text-danger"
        >
          <Icon name="LogOut" className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-page">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-line bg-surface/60 backdrop-blur-xl lg:block">
        {sidebar}
      </aside>

      {/* Mobile sidebar drawer (opened from the top bar) */}
      {menuOpen ? (
        <div className="fixed inset-0 top-14 z-30 bg-page lg:hidden">
          <div className="h-full overflow-y-auto">{sidebar}</div>
        </div>
      ) : null}

      <div className="lg:pl-60">
        <AdminTopbar
          title={current?.label ?? "Dashboard"}
          menuOpen={menuOpen}
          onToggleMenu={() => setMenuOpen((value) => !value)}
        />
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">{children}</div>
      </div>
    </div>
  );
}

function Gate({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="panel max-w-md p-7 text-center">
        <p className="mono text-[10px] uppercase tracking-[0.22em] text-accent">Dashboard</p>
        <h1 className="mt-2.5 text-xl font-semibold text-ink">{title}</h1>
        <p className="mt-3 text-[13px] leading-relaxed text-muted">{body}</p>
        <div className="mt-6 flex items-center justify-center gap-3">{children}</div>
      </div>
    </div>
  );
}
