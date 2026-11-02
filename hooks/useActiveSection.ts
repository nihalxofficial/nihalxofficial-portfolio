"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Tracks which `#anchor` section the visitor is looking at.
 *
 * Uses IntersectionObserver with the `#stage` scroll container as root,
 * since `body { overflow: hidden }` and all scrolling happens inside `#stage`.
 */
export function useActiveSection(hrefs: string[]): string {
  const [active, setActive] = useState("");
  const key = hrefs.join("|");
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const ids = key
      .split("|")
      .filter((href) => href.startsWith("#"))
      .map((href) => href.slice(1));

    if (ids.length === 0) return;

    const timer = setTimeout(() => {
      const stage = document.getElementById("stage");
      const targets = ids
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null);

      if (targets.length === 0) return;

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
          if (bestId) setActive(`#${bestId}`);
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
