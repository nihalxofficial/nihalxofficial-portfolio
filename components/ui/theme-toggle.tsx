"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Single icon button that flips between the dark and light twins. */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme !== "light";

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={!isDark}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "group relative grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface/60 text-muted backdrop-blur transition-colors hover:border-line-strong hover:text-accent",
        className,
      )}
    >
      {mounted ? (
        isDark ? (
          <Sun className="h-[18px] w-[18px]" />
        ) : (
          <Moon className="h-[18px] w-[18px]" />
        )
      ) : (
        <span className="h-[18px] w-[18px]" />
      )}
      <span className="pointer-events-none absolute inset-0 rounded-xl bg-accent/0 transition-colors group-hover:bg-accent/5" />
    </button>
  );
}
