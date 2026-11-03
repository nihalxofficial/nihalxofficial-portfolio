"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ADMIN_BASE } from "@/lib/admin-routes";

interface LenisScrollToOptions {
  offset?: number;
  duration?: number;
  immediate?: boolean;
  lock?: boolean;
}

interface LenisContextValue {
  lenis: Lenis | null;
  scrollTo: (target: string | number | HTMLElement, options?: LenisScrollToOptions) => void;
}

const LenisContext = createContext<LenisContextValue>({
  lenis: null,
  scrollTo: () => {},
});

/**
 * Access the global Lenis smooth-scroll instance and programmatic scrollTo helper.
 */
export const useLenis = () => useContext(LenisContext);

/**
 * Programmatic helper usable outside of React component trees if needed.
 */
export function scrollToTarget(
  target: string | number | HTMLElement,
  options?: LenisScrollToOptions
) {
  if (typeof window !== "undefined" && (window as unknown as { lenis?: Lenis }).lenis) {
    const lenis = (window as unknown as { lenis: Lenis }).lenis;
    lenis.scrollTo(target, {
      offset: options?.offset ?? -20,
      duration: options?.duration ?? 1.2,
      immediate: options?.immediate ?? false,
      lock: options?.lock ?? false,
    });
    return;
  }

  // Fallback for SSR or environments where Lenis is disabled
  if (typeof target === "number") {
    const stage = document.getElementById("stage");
    if (stage) stage.scrollTo({ top: target, behavior: "smooth" });
    else window.scrollTo({ top: target, behavior: "smooth" });
  } else {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    if (el) (el as HTMLElement).scrollIntoView({ behavior: "smooth" });
  }
}

/**
 * High-vibe inertial smooth-scroll provider powered by Lenis v1.
 *
 * Configured specifically for the OS shell layout (#stage scroll container).
 * Uses exponential ease-out curve for that ultra-luxurious, cinematic feel.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = Boolean(pathname?.startsWith(ADMIN_BASE));
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Admin dashboard uses native scrolling
    if (isAdmin) return;

    // Respect visitor's reduced motion OS setting
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const stage = document.getElementById("stage");
    if (!stage) return;

    const content =
      document.getElementById("stage-content") ||
      (stage.firstElementChild as HTMLElement | null) ||
      stage;

    // Luxury easing function: exponential ease-out
    const easing = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

    const lenis = new Lenis({
      wrapper: stage,
      content,
      eventsTarget: stage,
      duration: 1.2,
      easing,
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      infinite: false,
      autoRaf: true,
      anchors: true,
      prevent: (node: HTMLElement) => {
        return (
          node.hasAttribute("data-lenis-prevent") ||
          Boolean(node.closest("[data-lenis-prevent]"))
        );
      },
    });

    lenisRef.current = lenis;
    setLenisInstance(lenis);
    (window as unknown as { lenis?: Lenis }).lenis = lenis;

    return () => {
      lenis.destroy();
      lenisRef.current = null;
      setLenisInstance(null);
      if ((window as unknown as { lenis?: Lenis }).lenis === lenis) {
        delete (window as unknown as { lenis?: Lenis }).lenis;
      }
    };
  }, [isAdmin, pathname]);

  const scrollTo = useCallback(
    (target: string | number | HTMLElement, options?: LenisScrollToOptions) => {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(target, {
          offset: options?.offset ?? -20,
          duration: options?.duration ?? 1.2,
          immediate: options?.immediate ?? false,
          lock: options?.lock ?? false,
        });
      } else {
        scrollToTarget(target, options);
      }
    },
    []
  );

  return (
    <LenisContext.Provider value={{ lenis: lenisInstance, scrollTo }}>
      {children}
    </LenisContext.Provider>
  );
}
