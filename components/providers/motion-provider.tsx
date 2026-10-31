"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * One motion contract for the whole site: springy-but-short transitions, and
 * transform/opacity animations are dropped for visitors who ask their OS for
 * reduced motion.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ type: "spring", stiffness: 320, damping: 30, mass: 0.8 }}
    >
      {children}
    </MotionConfig>
  );
}
