"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/components/admin/auth-provider";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Icon } from "@/components/ui/icon";
import { ADMIN_BASE } from "@/lib/admin-routes";
import { findNavItem, NAV_GROUPS, type NavGroup, type NavItem } from "@/lib/admin-nav";
import { initials } from "@/lib/utils";

/** Groups open by default; owners can collapse the long Content list. */
function useCollapsedGroups() {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  return { collapsed, toggle };
}

/**
 * Dashboard chrome and access gate.
 *
 * Nothing inside renders until the API has accepted the session, so a signed-in
 * Firebase account that is missing from ADMIN_UIDS never sees the dashboard.
 * The sidebar is driven entirely by `lib/admin-nav` — grouped, collapsible, and
 * icon-led — so the whole CMS is navigable from one logical structure.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { session, loading, error, configError, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const { collapsed, toggle } = useCollapsedGroups();

  useEffect(() => {
    if (!loading && !session && !configError) router.replace("/control-centre/login");
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

  const isActive = (item: NavItem) =>
    item.external
      ? false
      : item.href === ADMIN_BASE
        ? pathname === ADMIN_BASE
        : pathname.startsWith(item.href);

  const navLink = (item: NavItem) => {
    const active = isActive(item);
    const className = `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.5px] transition-colors ${
      active ? "bg-accent/12 text-accent" : "text-muted hover:bg-surface-2 hover:text-ink"
    }`;
    const inner = (
      <>
        <Icon name={item.icon} className="h-4 w-4 shrink-0" />
        <span className="truncate">{item.label}</span>
      </>
    );
    return item.external ? (
      <Link key={item.href} href="/" target="_blank" rel="noreferrer" className={className}>
        {inner}
      </Link>
    ) : (
      <Link key={item.href} href={item.href} className={className}>
        {inner}
      </Link>
    );
  };

  const groupBlock = (group: NavGroup) => {
    const isCollapsed = collapsed[group.id] ?? false;
    // Keep the group holding the active route expanded even if it was collapsed.
    const hasActive = group.items.some(isActive);
    const open = !isCollapsed || hasActive;

    return (
      <div key={group.id} className="mt-4 first:mt-0">
        <button
          type="button"
          onClick={() => toggle(group.id)}
          className="mono flex w-full items-center justify-between px-2 pb-1.5 text-[9.5px] uppercase tracking-[0.2em] text-faint transition-colors hover:text-muted"
          aria-expanded={open}
        >
          {group.label}
          <Icon
            name="ChevronDown"
            className={`h-3 w-3 transition-transform ${open ? "" : "-rotate-90"}`}
          />
        </button>
        {open ? <div className="space-y-0.5">{group.items.map(navLink)}</div> : null}
      </div>
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
            {session.name || "Control Centre"}
          </span>
          <span className="mono block truncate text-[10px] uppercase tracking-[0.14em] text-faint">
            {session.email || session.uid.slice(0, 10)}
          </span>
        </span>
      </Link>

      <nav className="scrollbar-none flex-1 overflow-y-auto px-2 pb-4">
        {NAV_GROUPS.map(groupBlock)}
      </nav>

      <div className="border-t border-line p-2">
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

  const current = findNavItem(pathname);

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
          title={current?.item.label ?? "Dashboard"}
          eyebrow={current?.group.label}
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
