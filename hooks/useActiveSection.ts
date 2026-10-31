"use client";

import { useEffect, useState } from "react";

/**
 * Tracks which `#anchor` section the visitor is looking at.
 *
 * Shared by the desktop pill and the mobile dock so both highlight the same
 * section. An IntersectionObserver drives the state (never click handlers), so
 * the indicator also follows manual scrolling, keyboard scrolling and restored
 * scroll positions.
 */
export function useActiveSection(hrefs: string[]): string {
  const [active, setActive] = useState("");
  // Join into one string so the observer is rebuilt only when the targets change,
  // not on every render of the caller.
  const key = hrefs.join("|");

  useEffect(() => {
    const targets = key
      .split("|")
      .filter((href) => href.startsWith("#"))
      .map((href) => document.getElementById(href.slice(1)))
      .filter((element): element is HTMLElement => element !== null);

    if (targets.length === 0) return;

    const viewport = () => window.innerHeight || document.documentElement.clientHeight;

    /** The section covering most of the viewport, used as the observer baseline. */
    const best = () => {
      let winner: HTMLElement | null = null;
      let largest = 0;

      for (const element of targets) {
        const { top, bottom } = element.getBoundingClientRect();
        const visible = Math.min(bottom, viewport()) - Math.max(top, 0);
        if (visible > largest) {
          largest = visible;
          winner = element;
        }
      }

      return winner ? `#${winner.id}` : "";
    };

    // The observer fires once per target immediately after `observe`, so the
    // indicator is positioned on mount without measuring here.
    const observer = new IntersectionObserver(
      () => setActive(best()),
      { rootMargin: "-10% 0px -10% 0px", threshold: [0, 0.15, 0.35, 0.6] },
    );

    targets.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [key]);

  return active;
}
