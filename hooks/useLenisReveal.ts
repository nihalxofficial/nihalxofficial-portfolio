"use client";

import { useRef } from "react";
import { useLenis } from "lenis/react";

interface LenisRevealOptions {
  /** How far the element slides in from (px). Default: 40 */
  distance?: number;
  /** The fraction of the viewport height over which the animation plays. Default: 0.3 */
  viewportFraction?: number;
  /** Extra offset from the bottom (px) before animation starts. Default: 0 */
  offset?: number;
  /** Stagger delay index — multiplies a small delay per item. Default: 0 */
  staggerIndex?: number;
  /** Direction: 'up' (default), 'left', 'right' */
  direction?: "up" | "left" | "right";
}

/**
 * Attach to any element to get a Lenis-driven, real-time scroll reveal animation.
 * The element scrubs in as the user scrolls — animating on both scroll-down AND scroll-up.
 */
export function useLenisReveal<T extends HTMLElement = HTMLDivElement>(
  options: LenisRevealOptions = {}
) {
  const {
    distance = 40,
    viewportFraction = 0.3,
    offset = 0,
    staggerIndex = 0,
    direction = "up",
  } = options;

  const ref = useRef<T>(null);

  useLenis(() => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Stagger: each successive item starts slightly lower on the screen
    const staggerOffset = staggerIndex * windowHeight * 0.04;

    const progress = Math.min(
      Math.max(
        (windowHeight - rect.top - offset - staggerOffset) /
          (windowHeight * viewportFraction),
        0
      ),
      1
    );

    const remaining = distance * (1 - progress);

    let transform = "";
    if (direction === "up") transform = `translateY(${remaining}px)`;
    else if (direction === "left") transform = `translateX(-${remaining}px)`;
    else if (direction === "right") transform = `translateX(${remaining}px)`;

    el.style.transform = transform;
    el.style.opacity = progress.toString();
  });

  return ref;
}
