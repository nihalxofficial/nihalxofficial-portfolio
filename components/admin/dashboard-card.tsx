/**
 * Dashboard Card Component
 * Reusable card with futuristic styling for dashboard pages
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
  hover = false,
}: DashboardCardProps) {
  const variants = {
    default: "bg-surface/60 border-line/50",
    accent: "bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20",
    gradient: "bg-gradient-to-br from-surface/80 to-surface/60 border-line/50",
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border ${variants[variant]} backdrop-blur-sm transition-all ${
        hover ? "hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5" : ""
      } ${className}`}
    >
      {/* Animated glow on hover */}
      {hover && (
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-accent/10 to-accent/5 opacity-0 transition-opacity group-hover:opacity-100" />
      )}

      {/* Header */}
      {(title || description || icon || action) && (
        <div className="relative border-b border-line/50 bg-surface/30 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {icon && (
                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-lg border border-accent/20 bg-gradient-to-br from-accent/15 to-accent/5 text-accent">
                  <Icon name={icon} className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                {title && (
                  <h3 className="text-[15px] font-bold text-ink">{title}</h3>
                )}
                {description && (
                  <p className="mt-1 text-[13px] text-muted">{description}</p>
                )}
              </div>
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative p-5">{children}</div>
    </div>
  );
}

/**
 * Stat Card Component
 * For displaying metrics and statistics
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
    ? "text-emerald-500"
    : trend?.isPositive === false
      ? "text-danger"
      : "text-muted";

  return (
    <DashboardCard
      variant={accent ? "accent" : "gradient"}
      hover
      className={className}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[13px] font-medium text-muted">{label}</p>
          <p className="mt-2 text-3xl font-bold text-ink">{value}</p>
          {trend && (
            <div className={`mt-2 flex items-center gap-1.5 text-[12px] ${trendColor}`}>
              <Icon
                name={trend.isPositive ? "TrendingUp" : trend.isPositive === false ? "TrendingDown" : "Minus"}
                className="h-4 w-4"
              />
              <span className="font-semibold">
                {trend.value > 0 ? "+" : ""}
                {trend.value}%
              </span>
              {trend.label && <span className="text-muted">{trend.label}</span>}
            </div>
          )}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-accent/20 bg-gradient-to-br from-accent/20 to-accent/5 text-accent">
          <Icon name={icon} className="h-6 w-6" />
        </div>
      </div>
    </DashboardCard>
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
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line/50 bg-surface/30 px-6 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-accent/20 bg-gradient-to-br from-accent/10 to-accent/5 text-accent">
        <Icon name={icon} className="h-8 w-8" />
      </div>
      <h3 className="mt-4 text-[15px] font-semibold text-ink">{title}</h3>
      <p className="mt-2 max-w-sm text-[13px] text-muted">{description}</p>
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

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-line/50 bg-surface/30 px-6 py-12">
      <div className="relative">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-line/30 border-t-accent" />
        <div className="absolute inset-0 animate-pulse rounded-full bg-accent/10 blur-xl" />
      </div>
      <p className="mono mt-4 text-[13px] uppercase tracking-wider text-muted">{message}</p>
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
    <div className="flex flex-col items-center justify-center rounded-xl border border-danger/30 bg-danger/5 px-6 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-danger/30 bg-danger/10 text-danger">
        <Icon name="AlertTriangle" className="h-8 w-8" />
      </div>
      <h3 className="mt-4 text-[15px] font-semibold text-ink">{title}</h3>
      <p className="mt-2 max-w-sm text-[13px] text-muted">{message}</p>
      {retry && (
        <button
          onClick={retry}
          className="mt-6 inline-flex items-center gap-2 rounded-lg border border-line/50 bg-surface/50 px-4 py-2 text-[13px] font-medium text-ink transition-all hover:border-accent/30 hover:bg-accent/5 hover:text-accent"
        >
          <Icon name="RefreshCw" className="h-4 w-4" />
          Try Again
        </button>
      )}
    </div>
  );
}
