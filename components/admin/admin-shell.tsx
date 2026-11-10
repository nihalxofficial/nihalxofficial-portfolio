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
import { AccentProvider } from "@/components/site/accent-context";

/** Groups open by default; owners can collapse any group for a cleaner view. */
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
      <AccentProvider>
        <Gate title="Dashboard not configured" body={configError}>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-line-strong px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
          >
            <Icon name="ArrowLeft" className="h-4 w-4" />
            Back to site
          </Link>
        </Gate>
      </AccentProvider>
    );
  }

  if (loading || !session) {
    return (
      <AccentProvider>
        <Gate
          title={loading ? "Checking access…" : "Redirecting to sign-in…"}
          body={error || "Verifying your Firebase session against the admin allowlist."}
        >
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-line-strong border-t-accent" />
        </Gate>
      </AccentProvider>
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
    const className = `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all ${
      active
        ? "bg-gradient-to-r from-accent/15 to-accent/5 text-accent shadow-sm shadow-accent/10 border border-accent/20"
        : "text-muted hover:bg-surface-2/80 hover:text-ink border border-transparent hover:border-line/30"
    }`;
    
    const inner = (
      <>
        {active && (
          <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r-full bg-accent shadow-sm shadow-accent/50" />
        )}
        <span className={`relative ${active ? "text-accent" : "text-muted group-hover:text-accent transition-colors"}`}>
          <Icon name={item.icon} className="h-[18px] w-[18px]" />
        </span>
        <span className="flex-1 truncate">{item.label}</span>
        {active && (
          <span className="h-1.5 w-1.5 rounded-full bg-accent/70 animate-pulse" />
        )}
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
    const hasActive = group.items.some(isActive);
    const open = !isCollapsed || hasActive;

    return (
      <div key={group.id} className="mb-6 last:mb-0">
        <button
          type="button"
          onClick={() => toggle(group.id)}
          className="group mb-2 flex w-full items-center justify-between rounded-lg px-3 py-2 transition-all hover:bg-surface-2/50"
          aria-expanded={open}
        >
          <div className="flex items-center gap-2">
            <span className="mono text-[10px] font-bold uppercase tracking-[0.2em] text-accent/90">
              {group.label}
            </span>
            {hasActive && (
              <span className="rounded-full bg-accent/15 px-1.5 py-0.5 text-[9px] font-bold text-accent ring-1 ring-accent/20">
                ACTIVE
              </span>
            )}
          </div>
          <Icon
            name="ChevronDown"
            className={`h-3.5 w-3.5 text-muted transition-all group-hover:text-accent ${open ? "rotate-0" : "-rotate-90"}`}
          />
        </button>
        {open && (
          <div className="space-y-1 pl-0.5">
            {group.items.map(navLink)}
          </div>
        )}
      </div>
    );
  };

  const sidebar = (
    <div className="flex h-full flex-col bg-gradient-to-b from-surface/80 to-surface/40">
      {/* Brand Header with futuristic design */}
      <Link href={ADMIN_BASE} className="group relative overflow-hidden border-b border-line/50 bg-gradient-to-br from-surface/60 to-surface/20 px-4 py-4 backdrop-blur-sm transition-all hover:border-accent/30">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="relative flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 animate-pulse rounded-lg bg-accent/20 blur-md" />
            <div className="relative grid h-10 w-10 place-items-center rounded-lg border border-accent/30 bg-gradient-to-br from-accent/20 to-accent/5 text-[13px] font-bold text-accent shadow-lg shadow-accent/10">
              {initials(session.name || session.email || "Admin")}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="mono block truncate text-[10px] font-semibold uppercase tracking-[0.15em] text-accent">
                Control Centre
              </span>
              <span className="h-1 w-1 rounded-full bg-accent/60 animate-pulse" />
            </div>
            <span className="mono mt-0.5 block truncate text-[10px] text-muted">
              {session.email || session.uid.slice(0, 12)}
            </span>
          </div>
        </div>
      </Link>

      {/* Navigation Groups */}
      <nav className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-line/30 hover:scrollbar-thumb-line/50 flex-1 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map(groupBlock)}
      </nav>

      {/* Footer with Sign Out */}
      <div className="border-t border-line/50 bg-surface/40 p-3 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => void signOut()}
          className="group flex w-full items-center gap-2.5 rounded-lg border border-transparent px-3 py-2.5 text-[12.5px] font-medium text-muted transition-all hover:border-danger/30 hover:bg-danger/5 hover:text-danger"
        >
          <Icon name="LogOut" className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );

  const current = findNavItem(pathname);

  return (
    <AccentProvider>
      {/* Full-height scroll container that works even when body has overflow:hidden */}
      <div className="fixed inset-0 overflow-hidden bg-page">
        {/* Subtle grid background — same visual language as main site */}
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />

        {/* Desktop sidebar */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-line/50 bg-surface/80 shadow-2xl shadow-black/20 backdrop-blur-xl lg:block">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent opacity-50" />
          <div className="relative h-full">
            {sidebar}
          </div>
        </aside>

        {/* Mobile sidebar drawer */}
        {menuOpen && (
          <>
            <div
              className="fixed inset-0 top-14 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <div className="fixed inset-0 top-14 z-30 bg-gradient-to-br from-surface/95 to-surface/80 backdrop-blur-xl lg:hidden">
              <div className="h-full overflow-y-auto">{sidebar}</div>
            </div>
          </>
        )}

        {/* Main content column — this is the actual scroll container */}
        <div className="flex h-full flex-col lg:pl-64">
          <AdminTopbar
            title={current?.item.label ?? "Dashboard"}
            eyebrow={current?.group.label}
            menuOpen={menuOpen}
            onToggleMenu={() => setMenuOpen((value) => !value)}
          />
          {/* Scrollable area */}
          <div className="dashboard-scroll flex-1 overflow-y-auto overflow-x-hidden">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
              {children}
            </div>
          </div>
        </div>
      </div>
    </AccentProvider>
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
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-page via-page to-surface/30 px-6">
      <div className="relative w-full max-w-lg">
        {/* Animated background glow */}
        <div className="absolute -inset-4 animate-pulse rounded-2xl bg-gradient-to-r from-accent/20 via-accent/10 to-accent/20 opacity-50 blur-3xl" />
        
        {/* Main card */}
        <div className="relative overflow-hidden rounded-xl border border-line/50 bg-gradient-to-br from-surface/90 to-surface/60 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
          {/* Corner accents */}
          <div className="absolute left-0 top-0 h-px w-16 bg-gradient-to-r from-accent/60 to-transparent" />
          <div className="absolute right-0 top-0 h-px w-16 bg-gradient-to-l from-accent/60 to-transparent" />
          <div className="absolute bottom-0 left-0 h-px w-16 bg-gradient-to-r from-accent/60 to-transparent" />
          <div className="absolute bottom-0 right-0 h-px w-16 bg-gradient-to-l from-accent/60 to-transparent" />
          
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              <span className="mono text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
                Control Centre
              </span>
            </div>
            
            <h1 className="mt-6 bg-gradient-to-br from-ink to-muted bg-clip-text text-2xl font-bold text-transparent">
              {title}
            </h1>
            
            <p className="mt-4 text-[14px] leading-relaxed text-muted">
              {body}
            </p>
            
            <div className="mt-8 flex items-center justify-center gap-3">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
