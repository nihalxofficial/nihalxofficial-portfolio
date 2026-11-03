"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Briefcase,
  ChevronDown,
  Cpu,
  FolderKanban,
  GraduationCap,
  Home,
  Layers,
  Mail,
  Menu,
  Rocket,
  Star,
  User,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { scrollToTarget } from "@/components/providers/smooth-scroll";
import type { NavigationItem } from "@/lib/types";

/** Beyond this the dock stops being one-thumb reachable. */
const MAX_DOCK_ITEMS = 5;
const MIN_FLAGGED_ITEMS = 4;

const ICON_BY_KEY: Record<string, LucideIcon> = {
  hero:         Home,
  about:        User,
  stats:        Cpu,
  services:     Layers,
  skills:       Wrench,
  projects:     FolderKanban,
  showcase:     Rocket,
  journey:      Briefcase,
  education:    GraduationCap,
  testimonials: Star,
  blog:         BookOpen,
  contact:      Mail,
};

function keyFor(href: string) {
  return href.replace(/^#/, "").split("/")[0] || "hero";
}

function NavIcon({ href }: { href: string }) {
  const Icon = ICON_BY_KEY[keyFor(href)] ?? Home;
  return <Icon size={21} />;
}

function scrollToHref(href: string) {
  const id = href.replace(/^#/, "");
  if (id === "hero" || id === "") {
    scrollToTarget(0, { duration: 1.25 });
  } else {
    scrollToTarget(`#${id}`, { offset: -24, duration: 1.25 });
  }
}

/**
 * Mobile-only bottom dock — exactly matches the reference MobileNav style.
 * Receives activeSection from shell (single observer). Overflow items fold into a sheet.
 */
export function MobileNav({
  navigation,
  activeSection = "",
}: {
  navigation: NavigationItem[];
  activeSection?: string;
}) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const { primary, rest } = splitForDock(navigation);
  const onHome = pathname === "/";

  useEffect(() => {
    if (!moreOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setMoreOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [moreOpen]);

  if (primary.length === 0) return null;

  const cells = primary.length + (rest.length > 0 ? 1 : 0);

  return (
    <>
      {/* More sheet */}
      {rest.length > 0 && (
        <div
          className={`fixed inset-x-0 bottom-[calc(56px+env(safe-area-inset-bottom))] z-[65] px-3 transition-all duration-200 md:hidden ${
            moreOpen
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none translate-y-3 opacity-0"
          }`}
          id="dock-more-sheet"
        >
          <div className="hud overflow-hidden rounded-2xl p-1.5">
            {rest.map((item) => {
              const isActive = activeSection === item.href;
              return (
                <button
                  key={item._id}
                  onClick={() => { scrollToHref(item.href); setMoreOpen(false); }}
                  className={`flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-[13px] transition-colors cursor-pointer ${
                    isActive ? "bg-acc/10 text-acc" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <NavIcon href={item.href} />
                  {item.label}
                  {isActive && (
                    <span className="mono ml-auto text-[9.5px] uppercase tracking-widest text-acc">here</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {moreOpen && (
        <button
          aria-label="Close menu"
          onClick={() => setMoreOpen(false)}
          className="fixed inset-0 z-[60] cursor-default bg-black/40 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Bottom tab bar — bg-page/90 avoids the bg-ink color token conflict */}
      <nav
        aria-label="Sections"
        className="md:hidden fixed bottom-0 inset-x-0 z-[66] bg-page/90 backdrop-blur-xl border-t border-white/10 flex justify-around px-1 pb-[env(safe-area-inset-bottom)]"
      >
        {primary.map((item) => {
          const isActive = activeSection === item.href;
          return (
            <button
              key={item._id}
              onClick={() => scrollToHref(item.href)}
              className={`flex flex-col items-center gap-1 py-2.5 px-2 text-[10.5px] font-medium flex-1 cursor-pointer transition-colors ${
                isActive ? "text-acc font-semibold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className={isActive ? "drop-shadow-[0_0_8px_var(--acc)] scale-110 transition-transform" : "transition-transform"}>
                <NavIcon href={item.href} />
              </span>
              <span className="leading-tight">{item.label}</span>
            </button>
          );
        })}

        {rest.length > 0 && (
          <button
            onClick={() => setMoreOpen((v) => !v)}
            aria-expanded={moreOpen}
            className={`flex flex-col items-center gap-0.5 py-2 px-1.5 text-[9px] flex-1 cursor-pointer transition-colors ${
              moreOpen ? "text-acc" : "text-slate-500"
            }`}
          >
            {moreOpen ? <ChevronDown size={19} /> : <Menu size={19} />}
            More
          </button>
        )}
      </nav>
    </>
  );
}

function splitForDock(items: NavigationItem[]): {
  primary: NavigationItem[];
  rest: NavigationItem[];
} {
  const flagged = items.filter((item) => item.isPrimary);
  const chosen = new Set(flagged);
  const target = items.length <= MAX_DOCK_ITEMS ? items.length : MIN_FLAGGED_ITEMS;

  if (chosen.size < target) {
    for (const item of items) {
      if (chosen.size >= target) break;
      chosen.add(item);
    }
  }

  const primary = items.filter((item) => chosen.has(item)).slice(0, MAX_DOCK_ITEMS);
  const keys = new Set(primary.map((item) => item._id));
  return { primary, rest: items.filter((item) => !keys.has(item._id)) };
}
