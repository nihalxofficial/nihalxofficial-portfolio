import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Small chrome pieces shared by the windowed cards in the reference design:
 * the "+" registration marks on panel corners and the traffic-light title bar.
 */

export function PlusMarks({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("pointer-events-none absolute inset-0", className)}>
      <Plus className="left-0 top-0 -translate-x-1/2 -translate-y-1/2" />
      <Plus className="right-0 top-0 translate-x-1/2 -translate-y-1/2" />
      <Plus className="bottom-0 left-0 -translate-x-1/2 translate-y-1/2" />
      <Plus className="bottom-0 right-0 translate-x-1/2 translate-y-1/2" />
    </span>
  );
}

function Plus({ className }: { className?: string }) {
  return (
    <span
      className={cn("absolute h-2.5 w-2.5 text-accent/45", className)}
      style={{
        backgroundImage:
          "linear-gradient(currentColor,currentColor),linear-gradient(currentColor,currentColor)",
        backgroundSize: "100% 1px, 1px 100%",
        backgroundPosition: "center, center",
        backgroundRepeat: "no-repeat",
      }}
    />
  );
}

/** macOS-style window header: three dots plus an optional right-aligned label. */
export function WindowBar({
  title,
  children,
  className,
}: {
  title?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 border-b border-line bg-surface-2/60 px-4 py-2.5",
        className,
      )}
    >
      <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
      <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
      <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
      {title ? (
        <span className="mono ml-2 truncate text-[10.5px] uppercase tracking-[0.16em] text-faint">
          {title}
        </span>
      ) : null}
      {children ? <span className="ml-auto flex items-center gap-2">{children}</span> : null}
    </div>
  );
}
