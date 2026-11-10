"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/components/admin/auth-provider";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Icon } from "@/components/ui/icon";
import { ADMIN_BASE } from "@/lib/admin-routes";
import { findNavItem, NAV_GROUPS, type NavGroup, type NavItem } from "@/lib/admin-nav";
import { initials } from "@/lib/utils";
import { NbLogo } from "@/components/ui/nb-logo";
import { useAccent } from "@/components/site/accent-context";
import { SiteBackground, type BackgroundMode } from "@/components/site/site-background";
import { saveSettingsField } from "@/components/admin/settings/settings-utils";

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
  const { accent, accentId, setAccentId } = useAccent();

  const [bgMode, setBgMode] = useState<BackgroundMode>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = (
          localStorage.getItem("portfolio_bg_mode") || localStorage.getItem("bg_mode")
        ) as BackgroundMode | null;
        if (saved && (saved === "dna" || saved === "rain" || saved === "none")) return saved;
      } catch {}
    }
    return "dna";
  });

  useEffect(() => {
    const onBgChange = (e: Event) => {
      const mode = (e as CustomEvent).detail as BackgroundMode;
      if (mode === "dna" || mode === "rain" || mode === "none") {
        setBgMode(mode);
      }
    };
    window.addEventListener("portfolio_bg_change", onBgChange);
    return () => window.removeEventListener("portfolio_bg_change", onBgChange);
  }, []);

  const changeBgMode = useCallback((mode: BackgroundMode) => {
    setBgMode(mode);
    try {
      localStorage.setItem("portfolio_bg_mode", mode);
      localStorage.setItem("bg_mode", mode);
      window.dispatchEvent(new CustomEvent("portfolio_bg_change", { detail: mode }));
    } catch {}
    void saveSettingsField("theme", { backgroundEffect: mode }).catch(() => {});
  }, []);

  const changeAccent = useCallback(
    (id: string) => {
      setAccentId(id);
      void saveSettingsField("theme", { accentId: id }).catch(() => {});
    },
    [setAccentId],
  );

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
    const className = `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[12.5px] font-medium transition-all duration-200 ${
      active
        ? "bg-acc/15 text-acc border border-acc/40 shadow-[0_0_14px_rgba(0,229,255,0.12)] font-semibold"
        : "text-slate-400 hover:bg-white/[0.04] hover:text-white border border-transparent"
    }`;

    const inner = (
      <>
        {active && (
          <span className="absolute -left-1 top-2.5 bottom-2.5 w-1 rounded-full bg-acc shadow-[0_0_8px_var(--acc)]" />
        )}
        <span className={`relative transition-colors ${active ? "text-acc" : "text-slate-400 group-hover:text-acc"}`}>
          <Icon name={item.icon} className="h-4 w-4" />
        </span>
        <span className="flex-1 truncate">{item.label}</span>
        {active && (
          <span className="h-1.5 w-1.5 rounded-full bg-acc shadow-[0_0_6px_var(--acc)] animate-pulse" />
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
      <div key={group.id} className="mb-5 last:mb-0">
        <button
          type="button"
          onClick={() => toggle(group.id)}
          className="group mb-1.5 flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 transition-all hover:bg-white/[0.04]"
          aria-expanded={open}
        >
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.2em] text-acc/80">
              {group.label}
            </span>
            {hasActive && (
              <span className="rounded-full bg-acc/15 px-1.5 py-0.2 text-[8.5px] font-bold text-acc ring-1 ring-acc/30">
                ACTIVE
              </span>
            )}
          </div>
          <Icon
            name="ChevronDown"
            className={`h-3 w-3 text-slate-500 transition-transform duration-200 group-hover:text-acc ${open ? "rotate-0" : "-rotate-90"}`}
          />
        </button>
        {open && (
          <div className="space-y-0.5">
            {group.items.map(navLink)}
          </div>
        )}
      </div>
    );
  };

  const sidebar = (
    <div className="flex h-full flex-col bg-[#03050f]/85 backdrop-blur-2xl">
      {/* Brand Header with signature cyber NB Monogram badge */}
      <Link
        href={ADMIN_BASE}
        className="group relative overflow-hidden border-b border-white/5 bg-[#03050f]/60 px-4 py-3.5 backdrop-blur-xl transition-all hover:border-acc/30"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-acc/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="relative flex items-center gap-3">
          <NbLogo size={38} className="glow-sm group-hover:glow" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-mono block truncate text-[9.5px] font-bold uppercase tracking-[0.18em] text-acc">
                Control Centre
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            </div>
            <span className="font-display block truncate text-xs font-bold text-white mt-0.5 tracking-tight">
              {session.name || "Md. Nihal Uddin Bijoy"}
            </span>
            <span className="font-mono block truncate text-[9px] text-slate-500">
              {session.email || "Full Stack Developer"}
            </span>
          </div>
        </div>
      </Link>

      {/* Navigation Groups */}
      <nav className="dashboard-scroll flex-1 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map(groupBlock)}
      </nav>

      {/* Footer with Sign Out */}
      <div className="border-t border-white/5 bg-[#03050f]/60 p-3 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => void signOut()}
          className="btn-ghost !rounded-xl group flex w-full items-center justify-center gap-2 py-2 text-xs font-mono font-medium text-slate-400 transition-all hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-400"
        >
          <Icon name="LogOut" className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  const current = findNavItem(pathname);

  return (
    <div className="fixed inset-0 overflow-hidden bg-page">
      {/* Animated background — exact same engine as the main site */}
      <SiteBackground accent={accent.a} secondaryAccent={accent.b} mode={bgMode} />

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
          accentId={accentId}
          onAccentChange={changeAccent}
          bgMode={bgMode}
          onBgModeChange={changeBgMode}
        />
        {/* Scrollable area */}
        <div className="dashboard-scroll flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-7xl px-4 pt-3 pb-8 sm:px-6 lg:pt-4 lg:pb-10">
            {children}
          </div>
        </div>
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
