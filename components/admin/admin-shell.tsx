"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/components/admin/auth-provider";
import { useAdminData } from "@/components/admin/admin-context";
import { Icon } from "@/components/ui/icon";
import { initials } from "@/lib/utils";

const FIXED_LINKS = [
  { href: "/admin", label: "Overview", icon: "LayoutDashboard" },
  { href: "/admin/messages", label: "Messages", icon: "Inbox" },
  { href: "/admin/media", label: "Media", icon: "Image" },
];

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
    if (!loading && !session && !configError) router.replace("/admin/login");
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

  const nav = [
    ...FIXED_LINKS,
    ...types.map((type) => ({
      href: `/admin/${type.key}`,
      label: type.label,
      icon: type.singleton ? "Settings" : "FolderKanban",
    })),
  ];

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname === href;

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link href="/admin" className="flex items-center gap-3 px-4 py-4">
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

      <nav className="scrollbar-none flex-1 space-y-0.5 overflow-y-auto px-2 pb-4">
        {nav.map((item, index) => {
          const active = isActive(item.href);
          const firstContent = index === FIXED_LINKS.length;

          return (
            <div key={item.href}>
              {firstContent ? (
                <p className="mono mt-4 px-2 pb-1.5 text-[9.5px] uppercase tracking-[0.2em] text-faint">
                  Content
                </p>
              ) : null}

              <Link
                href={item.href}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.5px] transition-colors ${
                  active
                    ? "bg-accent/12 text-accent"
                    : "text-muted hover:bg-surface-2 hover:text-ink"
                }`}
              >
                <Icon name={item.icon} className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            </div>
          );
        })}
      </nav>

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

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-line bg-page/90 px-4 py-3 backdrop-blur-xl lg:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="grid h-9 w-9 place-items-center rounded-lg border border-line text-ink"
        >
          <Icon name={menuOpen ? "X" : "Menu"} className="h-4 w-4" />
        </button>
        <span className="text-[13px] font-semibold text-ink">Dashboard</span>
        <Link
          href="/"
          className="mono ml-auto text-[10px] uppercase tracking-[0.16em] text-faint hover:text-accent"
        >
          View site
        </Link>
      </div>

      {menuOpen ? (
        <div className="fixed inset-0 top-[57px] z-30 bg-page lg:hidden">
          <div className="h-full overflow-y-auto">{sidebar}</div>
        </div>
      ) : null}

      <div className="lg:pl-60">
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
