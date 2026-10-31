"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

/**
 * Dual theme via next-themes, the setup HeroUI v3 expects.
 *
 * Both `class` and `data-theme` are written to <html> so Tailwind's `dark:`
 * variant and HeroUI's theme variables stay in sync, including for portalled
 * overlays such as modals and popovers.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute={["class", "data-theme"]}
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      storageKey="nihal-theme"
    >
      {children}
    </NextThemesProvider>
  );
}
