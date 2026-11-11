"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Icon } from "@/components/ui/icon";
import { ChartCard } from "@/components/admin/ui";
import { StatCard, DashboardCard, LoadingState } from "@/components/admin/dashboard-card";
import {
  fetchAnalyticsOverview,
  fetchAnalyticsRealtime,
  type AnalyticsOverview,
  type AnalyticsRealtime,
} from "@/lib/admin";
import { timeAgo } from "@/lib/utils";

const RANGES = [
  { days: 1, label: "24h" },
  { days: 7, label: "1w" },
  { days: 30, label: "1m" },
  { days: 90, label: "3m" },
  { days: 365, label: "1y" },
];

const REALTIME_POLL_MS = 15_000;

/** "1m 20s" / "45s" — no date library, matching the rest of lib/utils. */
function formatDuration(ms: number): string {
  if (!ms || ms < 0) return "0s";
  const total = Math.round(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return minutes ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

/** Short axis label for a timeline bucket ("…T14:00" hour vs "%Y-%m-%d" day). */
function bucketLabel(bucket: string): string {
  const hour = bucket.match(/T(\d{2}):\d{2}$/);
  if (hour) return `${hour[1]}h`;
  const parts = bucket.split("-");
  return parts.length === 3 ? `${parts[2]}/${parts[1]}` : bucket;
}

function deviceIcon(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("mobile") || lower.includes("phone")) return "Smartphone";
  if (lower.includes("tablet")) return "Container";
  return "Laptop";
}

export default function AdminAnalyticsPage() {
  const [days, setDays] = useState(7);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [realtime, setRealtime] = useState<AnalyticsRealtime | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetchAnalyticsOverview(days)
      .then((value) => {
        setOverview(value);
        setError("");
      })
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : "Could not load analytics.");
      })
      .finally(() => setLoading(false));
  }, [days]);

  useEffect(load, [load]);

  // Live panel polls on its own timer; the tab pauses it while hidden so we do
  // not burn requests (and thus Vercel function invocations) in the background.
  const liveRef = useRef<AnalyticsRealtime | null>(null);
  useEffect(() => {
    let alive = true;
    const poll = () => {
      if (document.visibilityState !== "visible") return;
      fetchAnalyticsRealtime()
        .then((value) => {
          if (alive) {
            liveRef.current = value;
            setRealtime(value);
          }
        })
        .catch(() => {
          /* realtime is best-effort; a failed poll just keeps the last frame */
        });
    };
    poll();
    const timer = window.setInterval(poll, REALTIME_POLL_MS);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, []);

  const totals = overview?.totals;
  const cards = totals
    ? [
        { label: "Page views", value: totals.pageViews.toLocaleString(), hint: "in range", icon: "Eye" },
        { label: "Unique visitors", value: totals.uniqueVisitors.toLocaleString(), hint: "distinct people", icon: "Users" },
        { label: "Sessions", value: totals.sessions.toLocaleString(), hint: `${totals.bounceRate}% bounce`, icon: "Layers" },
        { label: "Online now", value: totals.onlineNow.toLocaleString(), hint: "last 5 minutes", icon: "Zap", live: true },
        { label: "Avg. duration", value: formatDuration(totals.avgDurationMs), hint: "per session", icon: "Clock" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.22em] text-accent">Dashboard</p>
          <h1 className="mt-1.5 text-2xl font-semibold text-ink">Analytics</h1>
          <p className="mt-1 text-[12.5px] text-muted">
            Who is visiting, for how long, on what, and from where.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-line bg-surface-2/40 p-0.5">
            {RANGES.map((range) => (
              <button
                key={range.days}
                type="button"
                onClick={() => setDays(range.days)}
                className={`rounded-md px-2.5 py-1.5 text-[11.5px] font-medium transition-colors ${
                  days === range.days ? "bg-accent/15 text-accent" : "text-muted hover:text-ink"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-[12px] font-medium text-muted transition-colors hover:border-line-strong hover:text-accent"
          >
            <Icon
              name={loading ? "Loader" : "RefreshCw"}
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </header>

      {error ? (
        <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-[12.5px] text-danger">
          {error}
        </p>
      ) : null}

      {/* Stat cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {totals
          ? cards.map((card) => (
              <div key={card.label} className="panel p-4">
                <div className="flex items-center justify-between">
                  <span className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-accent/10 text-accent">
                    <Icon name={card.icon} className="h-4 w-4" />
                  </span>
                  {"live" in card && card.live ? (
                    <span className="flex items-center gap-1.5 text-[10px] font-medium text-success">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/70" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                      </span>
                      LIVE
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-2xl font-semibold leading-none text-gradient">{card.value}</p>
                <p className="mt-1.5 text-[12.5px] font-medium text-ink">{card.label}</p>
                <p className="mt-0.5 text-[10.5px] text-faint">{card.hint}</p>
              </div>
            ))
          : Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="panel space-y-2 p-4">
                <span className="block h-9 w-9 animate-pulse rounded-lg bg-surface-2" />
                <span className="block h-6 w-14 animate-pulse rounded bg-surface-2" />
                <span className="block h-3 w-20 animate-pulse rounded bg-surface-2" />
              </div>
            ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Timeline chart */}
        <ChartCard
          title="Traffic over time"
          subtitle={days <= 2 ? "Views and sessions per hour" : "Views and sessions per day"}
          className="lg:col-span-2"
        >
          <TimelineChart data={overview?.timeline ?? []} />
        </ChartCard>

        {/* New vs returning */}
        <ChartCard title="Audience" subtitle="First-time vs returning visitors">
          <NewVsReturning data={overview?.newVsReturning} total={totals?.uniqueVisitors ?? 0} />
        </ChartCard>

        {/* Realtime */}
        <section className="panel flex flex-col p-4 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[13.5px] font-semibold text-ink">Realtime</h2>
            <span className="mono flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              {realtime?.onlineNow ?? 0} online
            </span>
          </div>
          <div className="mt-3 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {realtime?.events.length ? (
              realtime.events.slice(0, 9).map((event, index) => (
                <div
                  key={`${event.at}-${index}`}
                  className="flex items-center gap-2.5 rounded-lg border border-line bg-surface-2/40 px-2.5 py-1.5"
                >
                  <Icon name="Globe" className="h-3.5 w-3.5 shrink-0 text-faint" />
                  <span className="min-w-0 flex-1">
                    <span className="mono block truncate text-[11px] text-ink">{event.path}</span>
                    <span className="block truncate text-[10px] text-faint">
                      {[event.city, event.country].filter(Boolean).join(", ") || "Unknown location"} ·{" "}
                      {event.browser}
                    </span>
                  </span>
                  <span className="mono shrink-0 text-[9.5px] text-faint">{timeAgo(event.at)}</span>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-line px-3 py-6 text-center text-[12px] text-faint sm:col-span-3">
                No live visitors right now.
              </p>
            )}
          </div>
        </section>
      </div>

      {/* World map + top countries */}
      <section className="panel p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[13.5px] font-semibold text-ink">Where visitors are</h2>
          <span className="mono text-[10px] uppercase tracking-[0.16em] text-faint">
            {overview?.countries.length ?? 0} countries
          </span>
        </div>
        <WorldMap countries={overview?.countries ?? []} />
        <CountryList countries={overview?.countries ?? []} />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <BreakdownList
          title="Top pages"
          empty="No page views yet."
          rows={(overview?.topPages ?? []).map((page) => ({
            name: page.path,
            count: page.views,
            icon: "File",
          }))}
          total={overview?.totals.pageViews ?? 0}
        />
        <BreakdownList
          title="Traffic sources"
          empty="No sources yet."
          rows={(overview?.sources ?? []).map((source) => ({
            name: source.source,
            count: source.views,
            icon: "ExternalLink",
          }))}
          total={overview?.totals.pageViews ?? 0}
        />
        <BreakdownList
          title="Browsers"
          empty="No browser data yet."
          rows={(overview?.browsers ?? []).map((browser) => ({
            name: browser.name,
            count: browser.count,
            icon: "Globe",
          }))}
          total={overview?.browsers.reduce((sum, row) => sum + row.count, 0) ?? 0}
        />
        <div className="grid gap-4">
          <BreakdownList
            title="Operating systems"
            empty="No OS data yet."
            rows={(overview?.oses ?? []).map((os) => ({
              name: os.name,
              count: os.count,
              icon: "Server",
            }))}
            total={overview?.oses.reduce((sum, row) => sum + row.count, 0) ?? 0}
          />
          <BreakdownList
            title="Devices"
            empty="No device data yet."
            rows={(overview?.devices ?? []).map((device) => ({
              name: device.name,
              count: device.count,
              icon: deviceIcon(device.name),
            }))}
            total={overview?.devices.reduce((sum, row) => sum + row.count, 0) ?? 0}
          />
        </div>
      </div>

      {/* Recent activity */}
      <section className="panel p-4">
        <h2 className="text-[13.5px] font-semibold text-ink">Recent activity</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left">
            <thead>
              <tr className="mono text-[9.5px] uppercase tracking-[0.14em] text-faint">
                <th className="pb-2 font-medium">Page</th>
                <th className="pb-2 font-medium">Location</th>
                <th className="pb-2 font-medium">Browser</th>
                <th className="pb-2 font-medium">Device</th>
                <th className="pb-2 text-right font-medium">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {(overview?.recent ?? []).map((row, index) => (
                <tr key={`${row.at}-${index}`} className="text-[12px]">
                  <td className="mono py-2 pr-3 text-ink">{row.path}</td>
                  <td className="py-2 pr-3 text-muted">
                    {[row.city, row.country].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td className="py-2 pr-3 text-muted">{row.browser}</td>
                  <td className="py-2 pr-3 text-muted">{row.device}</td>
                  <td className="mono py-2 text-right text-faint">{timeAgo(row.at)}</td>
                </tr>
              ))}
              {!overview?.recent.length ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-[12px] text-faint">
                    No activity recorded yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/** Interactive recharts area for page views + sessions across the range. */
function TimelineChart({ data }: { data: AnalyticsOverview["timeline"] }) {
  const rows = useMemo(
    () =>
      data.map((row) => ({
        label: bucketLabel(row.bucket),
        pageViews: row.pageViews,
        sessions: row.sessions,
      })),
    [data],
  );

  if (!data.length) {
    return (
      <div className="grid h-56 place-items-center rounded-xl border border-dashed border-line text-[12px] text-faint">
        No traffic in this range yet.
      </div>
    );
  }

  return (
    <div className="mt-1 h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rows} margin={{ top: 6, right: 8, bottom: 0, left: -18 }}>
          <defs>
            <linearGradient id="tl-views" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "var(--faint)", fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: "var(--line)" }}
            minTickGap={24}
          />
          <YAxis
            tick={{ fill: "var(--faint)", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={40}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: 10,
              fontSize: 12,
            }}
            labelStyle={{ color: "var(--ink)" }}
          />
          <Area
            type="monotone"
            dataKey="pageViews"
            name="Page views"
            stroke="var(--accent)"
            strokeWidth={2}
            fill="url(#tl-views)"
          />
          <Area
            type="monotone"
            dataKey="sessions"
            name="Sessions"
            stroke="var(--accent-2, #7c4dff)"
            strokeWidth={1.5}
            fillOpacity={0}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** New-vs-returning split: a stacked bar with the counts beneath it. */
function NewVsReturning({
  data,
  total,
}: {
  data?: { newVisitors: number; returningVisitors: number };
  total: number;
}) {
  const newV = data?.newVisitors ?? 0;
  const returning = data?.returningVisitors ?? 0;
  const sum = newV + returning || total || 1;
  const newPct = Math.round((newV / sum) * 100);

  if (!newV && !returning) {
    return (
      <div className="grid h-56 place-items-center rounded-xl border border-dashed border-line text-[12px] text-faint">
        No identified visitors yet.
      </div>
    );
  }

  return (
    <div className="flex h-56 flex-col justify-center gap-4">
      <div>
        <div className="flex items-baseline justify-between text-[12px]">
          <span className="font-medium text-ink">New</span>
          <span className="mono text-faint">{newPct}%</span>
        </div>
        <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full grad-accent" style={{ width: `${newPct}%` }} />
        </div>
        <p className="mono mt-1 text-[11px] text-accent">{newV.toLocaleString()} visitors</p>
      </div>

      <div>
        <div className="flex items-baseline justify-between text-[12px]">
          <span className="font-medium text-ink">Returning</span>
          <span className="mono text-faint">{100 - newPct}%</span>
        </div>
        <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-line-strong"
            style={{ width: `${100 - newPct}%` }}
          />
        </div>
        <p className="mono mt-1 text-[11px] text-muted">{returning.toLocaleString()} visitors</p>
      </div>
    </div>
  );
}

/**
 * Equirectangular projection over a graticule. Locations come from the server's
 * country centroids (derived from edge headers), so no tile provider, key, or
 * client-side network call is needed — this stays Vercel-safe and offline.
 */
function WorldMap({ countries }: { countries: AnalyticsOverview["countries"] }) {
  const located = countries.filter((c) => typeof c.lat === "number" && typeof c.lng === "number");
  const peak = Math.max(1, ...located.map((c) => c.count));

  return (
    <div className="relative mt-3 w-full overflow-hidden rounded-xl border border-line bg-surface-2/40">
      <svg viewBox="0 0 360 180" className="h-52 w-full sm:h-64" preserveAspectRatio="xMidYMid meet">
        {/* graticule */}
        {Array.from({ length: 11 }).map((_, i) => (
          <line
            key={`lon-${i}`}
            x1={i * 36}
            y1={0}
            x2={i * 36}
            y2={180}
            stroke="var(--line)"
            strokeWidth={0.4}
          />
        ))}
        {Array.from({ length: 7 }).map((_, i) => (
          <line
            key={`lat-${i}`}
            x1={0}
            y1={i * 30}
            x2={360}
            y2={i * 30}
            stroke="var(--line)"
            strokeWidth={0.4}
          />
        ))}
        <line x1={0} y1={90} x2={360} y2={90} stroke="var(--line-strong)" strokeWidth={0.6} />
        {located.map((c) => {
          const x = ((c.lng as number) + 180) / 360 * 360;
          const y = (90 - (c.lat as number)) / 180 * 180;
          const radius = 2.5 + (c.count / peak) * 7;
          return (
            <g key={c.code}>
              <circle cx={x} cy={y} r={radius} fill="var(--accent)" fillOpacity={0.18} />
              <circle cx={x} cy={y} r={Math.max(1.4, radius * 0.45)} fill="var(--accent)">
                <title>{`${c.country} — ${c.count} views`}</title>
              </circle>
            </g>
          );
        })}
      </svg>
      {!located.length ? (
        <div className="absolute inset-0 grid place-items-center text-[12px] text-faint">
          Location data appears once visitors have a resolvable country.
        </div>
      ) : null}
    </div>
  );
}

function CountryList({ countries }: { countries: AnalyticsOverview["countries"] }) {
  if (!countries.length) return null;
  const peak = Math.max(1, countries[0].count);
  return (
    <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
      {countries.slice(0, 8).map((c) => (
        <div key={c.code} className="flex items-center gap-2.5">
          <span className="mono w-24 shrink-0 truncate text-[11px] text-ink">{c.country}</span>
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
            <span
              className="block h-full rounded-full grad-accent"
              style={{ width: `${(c.count / peak) * 100}%` }}
            />
          </span>
          <span className="mono w-10 shrink-0 text-right text-[10.5px] text-faint">{c.count}</span>
        </div>
      ))}
    </div>
  );
}

function BreakdownList({
  title,
  rows,
  total,
  empty,
}: {
  title: string;
  empty: string;
  rows: Array<{ name: string; count: number; icon: string }>;
  total: number;
}) {
  const peak = Math.max(1, ...rows.map((row) => row.count));
  return (
    <section className="panel p-4">
      <h2 className="text-[13.5px] font-semibold text-ink">{title}</h2>
      <div className="mt-3 space-y-2">
        {rows.length ? (
          rows.map((row) => (
            <div key={row.name} className="flex items-center gap-2.5">
              <Icon name={row.icon} className="h-3.5 w-3.5 shrink-0 text-faint" />
              <span className="w-28 shrink-0 truncate text-[12px] text-ink" title={row.name}>
                {row.name}
              </span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                <span
                  className="block h-full rounded-full grad-accent"
                  style={{ width: `${(row.count / peak) * 100}%` }}
                />
              </span>
              <span className="mono w-16 shrink-0 text-right text-[10.5px] text-faint">
                {row.count}
                {total ? <span className="ml-1 text-faint/70">· {Math.round((row.count / total) * 100)}%</span> : null}
              </span>
            </div>
          ))
        ) : (
          <p className="rounded-xl border border-dashed border-line px-3 py-6 text-center text-[12px] text-faint">
            {empty}
          </p>
        )}
      </div>
    </section>
  );
}
