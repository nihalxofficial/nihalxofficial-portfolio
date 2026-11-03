"use client";

import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";

/**
 * Dashboard section header.
 *
 * A consistent eyebrow + title + optional description and actions row used at
 * the top of every management page and inside most panels.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  icon,
  actions,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  icon?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mono text-[10px] uppercase tracking-[0.22em] text-accent">{eyebrow}</p>
        ) : null}
        <h1 className="mt-1.5 flex items-center gap-2 text-2xl font-semibold text-ink">
          {icon ? <Icon name={icon} className="h-5 w-5 text-accent" /> : null}
          {title}
        </h1>
        {description ? <p className="mt-1 text-[12.5px] text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
