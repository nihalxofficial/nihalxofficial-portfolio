"use client";

import { useEffect, useRef, useState } from "react";

// The projects block renders as `id="showcase"`, so a `#projects` nav link watches
// that element to stay highlighted. Keep nav on one of the two and this is moot.
const SECTION_ELEMENT_ID: Record<string, string> = {
  "#projects": "showcase",
};

/**
 * Tracks which `#anchor` section the visitor is looking at.
 *
 * Uses IntersectionObserver with the `#stage` scroll container as root,
 * since `body { overflow: hidden }` and all scrolling happens inside `#stage`.
 * Reports the nav href (not the raw element id) so `activeSection === item.href`
 * always matches, whichever alias form the saved navigation uses.
 */
export function useActiveSection(hrefs: string[]): string {
  const [active, setActive] = useState("");
  const key = hrefs.join("|");
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const anchors = key.split("|").filter((href) => href.startsWith("#"));

    // Resolve each href to the element to observe, keeping a back-map to the href.
    const hrefByElementId = new Map<string, string>();
    const targets: HTMLElement[] = [];
    for (const href of anchors) {
      const el = document.getElementById(SECTION_ELEMENT_ID[href] ?? href.slice(1));
      if (el && !hrefByElementId.has(el.id)) {
        hrefByElementId.set(el.id, href);
        targets.push(el);
      }
    }

    if (targets.length === 0) return;

    const timer = setTimeout(() => {
      const stage = document.getElementById("stage");

      const observer = new IntersectionObserver(
        (entries) => {
          // Pick the entry with the highest intersection ratio that is intersecting
          let bestId = "";
          let bestRatio = 0;
          for (const entry of entries) {
            if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
              bestRatio = entry.intersectionRatio;
              bestId = entry.target.id;
            }
          }
          const href = hrefByElementId.get(bestId);
          if (href) setActive(href);
        },
        {
          root: stage ?? null,
          rootMargin: "-5% 0px -40% 0px",
          threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0],
        },
      );

      targets.forEach((el) => observer.observe(el));
      cleanupRef.current = () => observer.disconnect();
    }, 150);

    return () => {
      clearTimeout(timer);
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [key]);

  return active;
}
