import type { ReactNode } from "react";
import { WindowBar } from "@/components/ui/panel-chrome";
import { cn } from "@/lib/utils";

/**
 * Loading placeholders for the streaming route segments.
 *
 * Every shape is painted from the theme tokens (`.skeleton` in globals.css),
 * so the same markup reads as frosted glass in light mode and as a faint cyan
 * scan in dark mode without a single `dark:` override.
 */

export function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden className={cn("skeleton block", className)} />;
}

/** A stack of text bars; the last one is short so it looks like a real paragraph. */
export function SkeletonText({
  lines = 3,
  className,
  height = "h-3",
}: {
  lines?: number;
  className?: string;
  height?: string;
}) {
  return (
    <span aria-hidden className={cn("space-y-2", className)}>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          className={cn(height, index === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </span>
  );
}

export function SkeletonChips({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <span aria-hidden className={cn("flex flex-wrap gap-1.5", className)}>
      {Array.from({ length: count }, (_, index) => (
        <Skeleton key={index} className="h-5 w-20 rounded-lg" />
      ))}
    </span>
  );
}

/** A placeholder card in the windowed chrome used across the site. */
export function SkeletonWindow({
  title,
  className,
  bodyClassName,
  children,
}: {
  title?: string;
  className?: string;
  bodyClassName?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn("code-window overflow-hidden", className)}>
      <WindowBar title={title} />
      {children ? <div className={cn("p-5", bodyClassName)}>{children}</div> : null}
    </div>
  );
}

/** Mono readout shown while a segment is streaming in. */
export function LoadingStatus({ label }: { label: string }) {
  return (
    <p
      role="status"
      className="mono load-line inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.22em] text-faint"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
      {label}
      <span className="sr-only">Loading</span>
    </p>
  );
}

/**
 * Stand-in for the site chrome (header + footer) on the detail routes.
 * The real chrome needs a data read, so a loading file draws the shape instead
 * of waiting for it — the swap is nearly invisible thanks to the same heights.
 */
export function SkeletonFrame({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="border-b border-line/70 bg-surface/40">
        <div className="container-page flex h-16 items-center gap-4">
          <Skeleton className="h-8 w-36 rounded-lg" />
          <SkeletonChips count={5} className="mx-auto hidden lg:flex" />
          <Skeleton className="ml-auto h-8 w-8 rounded-full lg:ml-0" />
          <Skeleton className="hidden h-9 w-24 rounded-lg sm:block" />
        </div>
      </header>

      <main className="pb-20 pt-10 sm:pt-14">{children}</main>

      <footer className="border-t border-line/70 bg-surface/30">
        <div className="container-page flex flex-col gap-4 py-10 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-10 w-40 rounded-xl" />
          <SkeletonText lines={2} className="max-w-sm" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </footer>
    </>
  );
}
