"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { useActiveSection } from "@/hooks/useActiveSection";
import type { NavigationItem } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Beyond this the dock stops being one-thumb reachable, so the rest fold away. */
const MAX_DOCK_ITEMS = 5;
/** Smallest sensible dock: flagged links plus a top-up from the list. */
const MIN_FLAGGED_ITEMS = 4;

/**
 * Mobile-only bottom dock: the fixed, app-style tab bar.
 *
 * Which links live here is dashboard data (`isPrimary` on the navigation
 * document), everything else folds into a compact More sheet. The active tab
 * follows the visible section through IntersectionObserver rather than clicks,
 * and the whole bar sits inside the device safe area.
 */
export function MobileNav({ navigation }: { navigation: NavigationItem[] }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const { primary, rest } = splitForDock(navigation);
  const active = useActiveSection(navigation.map((item) => item.href));
  const onHome = pathname === "/";

  // Anchor links only exist on the homepage; elsewhere they route back to it.
  const hrefFor = (item: NavigationItem) =>
    onHome ? item.href : `/${item.href}`;

  useEffect(() => {
    if (!moreOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMoreOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [moreOpen]);

  if (primary.length === 0) return null;

  const cells = primary.length + (rest.length > 0 ? 1 : 0);

  return (
    <>
      {/* More sheet */}
      {rest.length > 0 ? (
        <div
          className={cn(
            "fixed inset-x-0 bottom-[calc(var(--dock-h)+env(safe-area-inset-bottom))] z-[65] px-3 transition-all duration-200 lg:hidden",
            moreOpen
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none translate-y-3 opacity-0",
          )}
          id="dock-more-sheet"
          role="group"
          aria-label="More sections"
          aria-hidden={!moreOpen}
        >
          <div className="panel-alt overflow-hidden rounded-2xl border-line-strong/60 p-1.5 shadow-[var(--shadow-float)] backdrop-blur-xl">
            {rest.map((item) => {
              const isActive = active === item.href;
              return (
                <Link
                  key={item._id}
                  href={hrefFor(item)}
                  onClick={() => setMoreOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-colors active:scale-[0.99]",
                    isActive ? "bg-accent/12 text-accent" : "text-muted hover:text-ink",
                  )}
                >
                  <Icon name={item.icon} className="h-4 w-4" />
                  {item.label}
                  {isActive ? (
                    <span aria-hidden className="mono ml-auto text-[9.5px] uppercase tracking-[0.18em]">
                      here
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Backdrop, so a tap outside the sheet closes it */}
      {moreOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMoreOpen(false)}
          className="fixed inset-0 z-[60] cursor-default bg-[var(--backdrop)] backdrop-blur-sm lg:hidden"
        />
      ) : null}

      <nav
        aria-label="Sections"
        className="dock fixed inset-x-0 bottom-0 z-[66] grid items-center gap-[0.15rem] lg:hidden"
        style={{ gridTemplateColumns: `repeat(${cells}, minmax(0, 1fr))` }}
      >
        {primary.map((item) => {
          const isActive = active === item.href;
          return (
            <Link
              key={item._id}
              href={hrefFor(item)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative flex flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 transition-transform duration-200 active:scale-90",
                isActive ? "text-accent" : "text-faint",
              )}
            >
              {/* Active glow pad behind the icon */}
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-3 inset-y-1 rounded-xl transition-all duration-300",
                  isActive
                    ? "bg-accent/12 shadow-[0_0_26px_-8px_var(--accent-glow)] ring-1 ring-accent/35"
                    : "bg-transparent",
                )}
              />
              {/* Top indicator rail */}
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-[30%] top-0 h-[2px] rounded-full grad-accent transition-transform duration-300",
                  isActive ? "scale-x-100" : "scale-x-0",
                )}
              />
              <Icon
                name={item.icon}
                className={cn(
                  "relative h-[18px] w-[18px] transition-transform duration-200",
                  isActive ? "scale-110" : "group-hover:scale-105",
                )}
              />
              <span
                className={cn(
                  "relative max-w-full truncate text-[10px] font-medium leading-none",
                  isActive && "text-shadow-glow",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}

        {rest.length > 0 ? (
          <button
            type="button"
            onClick={() => setMoreOpen((value) => !value)}
            aria-expanded={moreOpen}
            aria-controls="dock-more-sheet"
            className={cn(
              "group relative flex flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 transition-transform duration-200 active:scale-90",
              moreOpen ? "text-accent" : "text-faint",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "absolute inset-x-3 inset-y-1 rounded-xl transition-colors duration-300",
                moreOpen ? "bg-accent/12 ring-1 ring-accent/35" : "bg-transparent",
              )}
            />
            <Icon
              name={moreOpen ? "ChevronDown" : "Menu"}
              className="relative h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-105"
            />
            <span className="relative text-[10px] font-medium leading-none">More</span>
          </button>
        ) : null}
      </nav>
    </>
  );
}

/**
 * Flagged links always make the dock; when the owner has flagged too few, the
 * earliest unflagged sections top it up so the bar is never nearly empty.
 * Output keeps the dashboard's `order`, and everything else folds into More.
 */
function splitForDock(items: NavigationItem[]): {
  primary: NavigationItem[];
  rest: NavigationItem[];
} {
  const flagged = items.filter((item) => item.isPrimary);
  const chosen = new Set(flagged);
  // A short list needs no overflow menu at all.
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
