"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ADMIN_BASE } from "@/lib/admin-routes";

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input[type="submit"], input[type="reset"], summary, label[for]';
const TEXT_SELECTOR = 'input, textarea, select, [contenteditable="true"], [data-cursor="text"]';

/**
 * Theme-matched cursor: a precise accent dot inside a lagging glow ring that
 * shrinks over controls, stretches into a caret over fields and pulses on
 * click. Purely decorative — the native cursor stays visible, so nothing
 * becomes unusable without JS.
 *
 * Only renders for fine pointers (a real mouse) and never on the dashboard,
 * where dense forms need the precise system cursor.
 */
export function CursorEffect() {
  const pathname = usePathname();
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const enabled = !pathname?.startsWith(ADMIN_BASE);

  // Pointer anchor; the ring trails it with a soft spring, the dot snaps to it.
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 320, damping: 36, mass: 0.7 });
  const ringY = useSpring(y, { stiffness: 320, damping: 36, mass: 0.7 });

  // 0 = idle · 1 = over a control · 2 = over a text field; 1 while held down.
  const mode = useMotionValue(0);
  const pressed = useMotionValue(0);

  const ringScale = useTransform(mode, [0, 1, 2], [1, 1.7, 1]);
  const ringScaleX = useTransform(mode, [0, 1, 2], [1, 1, 0.28]);
  const ringScaleY = useTransform(mode, [0, 1, 2], [1, 1, 1.9]);
  const ringPress = useTransform(pressed, [0, 1], [1, 0.82]);
  const dotScale = useTransform(pressed, [0, 1], [1, 0.4]);
  const dotFade = useTransform(mode, [0, 1, 2], [1, 0.1, 0]);

  useEffect(() => {
    if (!enabled) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const modeOf = (target: EventTarget | null): number => {
      if (!(target instanceof Element)) return 0;
      if (target.closest(TEXT_SELECTOR)) return 2;
      if (target.closest(INTERACTIVE_SELECTOR)) return 1;
      return 0;
    };

    const onMove = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      mode.set(modeOf(event.target));
    };
    const onDown = () => pressed.set(1);
    const onUp = () => pressed.set(0);
    const onLeave = () => {
      mode.set(0);
      pressed.set(0);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled, x, y, mode, pressed]);

  if (!enabled) return null;

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[2147483000]"
      style={{ transform: `translate3d(${x.get()}px, ${y.get()}px, 0)` }}
    >
      {/* Subscription keeps the anchor following the raw pointer every frame. */}
      <AnchorFollow wrapRef={wrapRef} x={x} y={y} />

      {/* Lagging glow ring */}
      <motion.div
        style={{
          x: ringX,
          y: ringY,
          scale: ringScale,
          scaleX: ringScaleX,
          scaleY: ringScaleY,
        }}
        className="absolute left-0 top-0 -ml-4 -mt-4 h-8 w-8 rounded-full border border-accent/55 bg-accent/[0.07] shadow-[0_0_18px_-2px_var(--accent-glow)]"
      >
        {/* Press pulse rides on top of the mode transform */}
        <motion.span
          style={{ scale: ringPress }}
          className="block h-full w-full rounded-full border border-accent/30"
        />
      </motion.div>

      {/* Precise accent dot */}
      <motion.div
        style={{ x, y, scale: dotScale, opacity: dotFade }}
        className="absolute left-0 top-0 -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_var(--accent-glow)]"
      />
    </div>
  );
}

/** Re-applies the wrapper translate whenever the raw pointer moves. */
function AnchorFollow({
  wrapRef,
  x,
  y,
}: {
  wrapRef: React.RefObject<HTMLDivElement | null>;
  x: ReturnType<typeof useMotionValue<number>>;
  y: ReturnType<typeof useMotionValue<number>>;
}) {
  useEffect(() => {
    const apply = () => {
      const el = wrapRef.current;
      if (el) el.style.transform = `translate3d(${x.get()}px, ${y.get()}px, 0)`;
    };
    apply();
    const unsubX = x.on("change", apply);
    const unsubY = y.on("change", apply);
    return () => {
      unsubX();
      unsubY();
    };
  }, [wrapRef, x, y]);
  return null;
}
