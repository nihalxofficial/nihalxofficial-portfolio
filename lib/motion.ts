import type { Transition, Variants } from "framer-motion";

/**
 * Shared entrance choreography.
 *
 * Sections that render server-side fade up through the `Reveal` wrapper; the
 * client sections (hero, skills, showcase) drive the same curves through these
 * variants so a card and a reveal never feel like two different materials.
 */

/** Springy fade-and-rise used by every entrance on the public site. */
export const EASE_SPRING: Transition = { type: "spring", stiffness: 170, damping: 24, mass: 0.9 };

export const REVEAL_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.985 },
  visible: { ...EASE_SPRING, opacity: 1, y: 0, scale: 1 },
};

/** Parent variant: children cascade instead of arriving as one slab. */
export const STAGGER_VARIANTS: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

/** Standard viewport config — animate once, start slightly before entry. */
export const VIEWPORT_ONCE = { once: true, margin: "0px 0px -8% 0px" } as const;

/** Card hover lift for motion elements (paired with a spring tap). */
export const CARD_HOVER = { y: -5, scale: 1.012 } as const;
export const CARD_TAP: Transition = { type: "spring", stiffness: 420, damping: 26 };
