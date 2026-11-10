/**
 * Dashboard Card Component
 * Styled identically to the main site's Cyber HUD design system
 */

import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";

interface DashboardCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  icon?: string;
  action?: ReactNode;
  variant?: "default" | "accent" | "gradient";
  hover?: boolean;
}

export function DashboardCard({
  children,
  className = "",
  title,
  description,
  icon,
  action,
  variant = "default",
  hover = true,
}: DashboardCardProps) {
  return (
    <div
      className={`hud ${hover ? "hud-hover" : ""} group relative overflow-hidden !rounded-2xl transition-all duration-300 ${
        variant === "accent"
          ? "!border-acc/40 bg-gradient-to-br from-acc/10 via-surface/80 to-surface/40"
          : ""
      } ${className}`}
    >
      {/* Top glowing laser scanline on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] scale-x-0 bg-gradient-to-r from-acc via-acc2 to-acc transition-transform duration-500 group-hover:scale-x-100 z-10"
      />

      {/* Header */}
      {(title || description || icon || action) && (
        <div className="relative border-b border-white/5 bg-[#070d30]/40 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              {icon && (
                <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-acc/30 bg-[#070d30] text-acc shadow-[0_0_12px_rgba(0,255,200,0.12)] group-hover:scale-105 group-hover:shadow-[0_0_18px_var(--acc)] group-hover:border-acc transition-all">
                  <Icon name={icon} className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                {title && (
                  <h3 className="text-base font-bold text-white tracking-tight group-hover:text-grad transition-colors">
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="mt-0.5 text-[13px] text-slate-400 font-normal leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative p-5 sm:p-6">{children}</div>
    </div>
  );
}

/**
 * Stat Card Component
 * For displaying metrics and statistics with cyberpunk HUD styling
 */

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: {
    value: number;
    label?: string;
    isPositive?: boolean;
  };
  className?: string;
  accent?: boolean;
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  className = "",
  accent = false,
}: StatCardProps) {
  const trendColor = trend?.isPositive
    ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
    : trend?.isPositive === false
      ? "text-rose-400 border-rose-500/30 bg-rose-500/10"
      : "text-slate-400 border-white/10 bg-white/5";

  return (
    <div
      className={`hud hud-hover group relative overflow-hidden !rounded-2xl p-5 transition-all ${
        accent ? "!border-acc/40" : ""
      } ${className}`}
    >
      {/* Top glowing laser scanline */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] scale-x-0 bg-gradient-to-r from-acc via-acc2 to-acc transition-transform duration-500 group-hover:scale-x-100 z-10"
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-gradient leading-none">
            {value}
          </p>
          {trend && (
            <div className={`mt-2.5 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] ${trendColor}`}>
              <Icon
                name={trend.isPositive ? "TrendingUp" : trend.isPositive === false ? "TrendingDown" : "Minus"}
                className="h-3 w-3"
              />
              <span className="font-bold">
                {trend.value > 0 ? "+" : ""}
                {trend.value}%
              </span>
              {trend.label && <span className="opacity-80">· {trend.label}</span>}
            </div>
          )}
        </div>
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-acc/30 bg-[#070d30] text-acc shadow-[0_0_15px_rgba(0,255,200,0.12)] group-hover:scale-105 group-hover:shadow-[0_0_20px_var(--acc)] group-hover:border-acc transition-all">
          <Icon name={icon} className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

/**
 * Empty State Component
 */

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="hud !rounded-2xl !border-dashed border-white/10 p-8 sm:p-12 text-center flex flex-col items-center justify-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl border border-acc/30 bg-[#070d30] text-acc shadow-[0_0_20px_rgba(0,255,200,0.15)] mb-4">
        <Icon name={icon} className="h-7 w-7" />
      </div>
      <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-slate-400 leading-relaxed">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/**
 * Loading State Component
 */

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading data..." }: LoadingStateProps) {
  return (
    <div className="hud !rounded-2xl p-12 text-center flex flex-col items-center justify-center">
      <div className="relative">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-acc shadow-[0_0_18px_var(--acc)]" />
        <div className="absolute inset-0 animate-pulse rounded-full bg-acc/10 blur-xl" />
      </div>
      <p className="font-mono mt-4 text-xs uppercase tracking-widest text-slate-400">{message}</p>
    </div>
  );
}

/**
 * Error State Component
 */

interface ErrorStateProps {
  title?: string;
  message: string;
  retry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  retry,
}: ErrorStateProps) {
  return (
    <div className="hud !rounded-2xl !border-rose-500/30 bg-rose-500/5 p-8 sm:p-12 text-center flex flex-col items-center justify-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.2)] mb-4">
        <Icon name="AlertTriangle" className="h-7 w-7" />
      </div>
      <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-slate-400 leading-relaxed">{message}</p>
      {retry && (
        <button
          onClick={retry}
          className="btn-ghost !rounded-xl mt-6 px-4 py-2 text-xs font-mono font-semibold flex items-center gap-2 text-slate-300 hover:text-white"
        >
          <Icon name="RefreshCw" className="h-3.5 w-3.5" />
          <span>Retry Operation</span>
        </button>
      )}
    </div>
  );
}
