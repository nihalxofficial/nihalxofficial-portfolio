"use client";

import type { ReactNode } from "react";

/**
 * Panel wrapper for a chart.
 *
 * Provides the shared title row, an optional right-side control (range selector,
 * legend) and consistent padding so recharts blocks line up across analytics.
 */
export function ChartCard({
  title,
  subtitle,
  actions,
  children,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel p-4 ${className ?? ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[13.5px] font-semibold text-ink">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-[11px] text-faint">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}
