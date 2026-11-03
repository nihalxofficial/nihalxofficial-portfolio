"use client";

import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";

/**
 * KPI card used across the dashboard and analytics pages.
 *
 * Keeps the futuristic glass/glow treatment consistent: an icon tile, an optional
 * live badge, a gradient value and a supporting hint line.
 */
export function StatCard({
  label,
  value,
  hint,
  icon,
  live,
  trend,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon: string;
  live?: boolean;
  /** Optional up/down indicator, e.g. "+12%". */
  trend?: { direction: "up" | "down"; value: ReactNode };
}) {
  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between">
        <span className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-accent/10 text-accent">
          <Icon name={icon} className="h-4 w-4" />
        </span>
        {live ? (
          <span className="flex items-center gap-1.5 text-[10px] font-medium text-success">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            LIVE
          </span>
        ) : trend ? (
          <span
            className={`mono flex items-center gap-1 text-[10.5px] ${
              trend.direction === "up" ? "text-success" : "text-danger"
            }`}
          >
            <Icon name={trend.direction === "up" ? "ArrowUp" : "ArrowDown"} className="h-3 w-3" />
            {trend.value}
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-2xl font-semibold leading-none text-gradient">{value}</p>
      <p className="mt-1.5 text-[12.5px] font-medium text-ink">{label}</p>
      {hint ? <p className="mt-0.5 text-[10.5px] text-faint">{hint}</p> : null}
    </div>
  );
}
