"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Icon } from "@/components/ui/icon";
import { ChartCard, SectionHeader, StatCard } from "@/components/admin/ui";
import {
  fetchProjectAnalytics,
  type ProjectAnalyticsOverview,
  type ProjectPerformanceMetric,
} from "@/lib/admin";

/** Daily (last 24h, hourly buckets) / Weekly / Monthly windows. */
const RANGES = [
  { days: 1, label: "Daily", hint: "last 24 hours" },
  { days: 7, label: "Weekly", hint: "last 7 days" },
  { days: 30, label: "Monthly", hint: "last 30 days" },
];

/** Short axis label for a timeline bucket ("…T14:00" hour vs "%Y-%m-%d" day). */
function bucketLabel(bucket: string): string {
  const hour = bucket.match(/T(\d{2}):\d{2}$/);
  if (hour) return `${hour[1]}h`;
  const parts = bucket.split("-");
  return parts.length === 3 ? `${parts[2]}/${parts[1]}` : bucket;
}

function formatSeconds(sec: number): string {
  if (!sec || sec < 0) return "0s";
  const minutes = Math.floor(sec / 60);
  const seconds = sec % 60;
  return minutes ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

export default function ProjectAnalyticsPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<ProjectAnalyticsOverview | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetchProjectAnalytics(days)
      .then((value) => {
        setData(value);
        setError("");
      })
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : "Could not load project analytics.");
      })
      .finally(() => setLoading(false));
  }, [days]);

  useEffect(load, [load]);

  const projects = data?.projects ?? [];
  const selectedProject = useMemo(
    () => projects.find((p) => p.slug === selected) ?? null,
    [projects, selected],
  );

  const totals = data?.totals;
  const rangeMeta = RANGES.find((r) => r.days === days);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Overview"
        title="Project Analytics"
        description="Engagement per portfolio project — views, visitors, click-throughs and dwell time. Real data from the visitor beacon."
        icon="BarChart3"
        actions={
          <>
            <div className="inline-flex rounded-lg border border-line bg-surface-2/40 p-0.5">
              {RANGES.map((range) => (
                <button
                  key={range.days}
                  type="button"
                  onClick={() => {
                    setDays(range.days);
                    setSelected(null);
                  }}
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
          </>
        }
      />

      {error ? (
        <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-[12.5px] text-danger">
          {error}
        </p>
      ) : null}

      {/* Totals */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {totals ? (
          <>
            <StatCard
              label="Project views"
              value={totals.totalProjectViews.toLocaleString()}
              hint={rangeMeta?.hint}
              icon="Eye"
            />
            <StatCard
              label="Unique visitors"
              value={totals.totalUniqueVisitors.toLocaleString()}
              hint="across all projects"
              icon="Users"
            />
            <StatCard
              label="Outbound clicks"
              value={totals.totalProjectClicks.toLocaleString()}
              hint="live / source / case study"
              icon="Activity"
            />
            <StatCard
              label="Avg. engagement"
              value={formatSeconds(totals.avgEngagementDurationSec)}
              hint="per project view"
              icon="Clock"
            />
          </>
        ) : (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="panel space-y-2 p-4">
              <span className="block h-9 w-9 animate-pulse rounded-lg bg-surface-2" />
              <span className="block h-6 w-14 animate-pulse rounded bg-surface-2" />
              <span className="block h-3 w-20 animate-pulse rounded bg-surface-2" />
            </div>
          ))
        )}
      </div>

      {/* Most viewed / Most engaged callouts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <HighlightCard
          kind="mostViewed"
          metric={data?.mostViewedProject ?? null}
          onSelect={setSelected}
        />
        <HighlightCard
          kind="mostEngaged"
          metric={data?.mostEngagedProject ?? null}
          onSelect={setSelected}
        />
      </div>

      {/* Views comparison + engagement duration */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Views comparison"
          subtitle="Page views and outbound clicks per project"
        >
          <ViewsComparisonChart data={data?.viewsComparison ?? []} onSelect={setSelected} />
        </ChartCard>
        <ChartCard title="Engagement duration" subtitle="Average dwell time per project (seconds)">
          <DurationChart projects={projects} onSelect={setSelected} />
        </ChartCard>
      </div>

      {/* Per-project performance table */}
      <section className="panel p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[13.5px] font-semibold text-ink">Project performance</h2>
          <span className="mono text-[10px] uppercase tracking-[0.16em] text-faint">
            {projects.length} projects · {rangeMeta?.label.toLowerCase()}
          </span>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="mono text-[9.5px] uppercase tracking-[0.14em] text-faint">
                <th className="pb-2 font-medium">Project</th>
                <th className="pb-2 text-right font-medium">Views</th>
                <th className="pb-2 text-right font-medium">Visitors</th>
                <th className="pb-2 text-right font-medium">Clicks</th>
                <th className="pb-2 text-right font-medium">Avg. time</th>
                <th className="pb-2 text-right font-medium">CTR</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {projects.map((project) => (
                <tr
                  key={project.slug}
                  onClick={() => setSelected(project.slug)}
                  className={`cursor-pointer text-[12.5px] transition-colors hover:bg-surface-2/50 ${
                    selected === project.slug ? "bg-accent/5" : ""
                  }`}
                >
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-2.5">
                      {project.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={project.thumbnailUrl}
                          alt=""
                          className="h-8 w-8 shrink-0 rounded-md border border-line object-cover"
                        />
                      ) : (
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-line bg-surface-2/50 text-faint">
                          <Icon name="FolderKanban" className="h-4 w-4" />
                        </span>
                      )}
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-ink">{project.title}</span>
                        <span className="mono block truncate text-[10px] text-faint">
                          {project.category}
                        </span>
                      </span>
                    </div>
                  </td>
                  <td className="mono py-2.5 pr-3 text-right text-ink">
                    {project.views.toLocaleString()}
                  </td>
                  <td className="mono py-2.5 pr-3 text-right text-muted">
                    {project.uniqueVisitors.toLocaleString()}
                  </td>
                  <td className="mono py-2.5 pr-3 text-right text-muted">
                    {project.clicks.toLocaleString()}
                  </td>
                  <td className="mono py-2.5 pr-3 text-right text-muted">
                    {formatSeconds(project.avgDurationSec)}
                  </td>
                  <td className="mono py-2.5 pr-3 text-right text-accent">{project.ctr}%</td>
                  <td className="py-2.5 text-right text-faint">
                    <Icon name="ChevronRight" className="inline h-3.5 w-3.5" />
                  </td>
                </tr>
              ))}
              {!projects.length && !loading ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-[12px] text-faint">
                    No projects to report on yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {/* Drilldown */}
      {selectedProject ? (
        <ProjectDrilldown
          project={selectedProject}
          timeline={data?.timeline ?? []}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </div>
  );
}

/** Most-viewed / most-engaged spotlight card. */
function HighlightCard({
  kind,
  metric,
  onSelect,
}: {
  kind: "mostViewed" | "mostEngaged";
  metric: ProjectPerformanceMetric | null;
  onSelect: (slug: string) => void;
}) {
  const isViewed = kind === "mostViewed";
  const label = isViewed ? "Most viewed project" : "Most engaged project";
  const icon = isViewed ? "TrendingUp" : "Heart";

  return (
    <section className="panel p-4">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-accent/10 text-accent">
          <Icon name={icon} className="h-4 w-4" />
        </span>
        <p className="mono text-[10px] uppercase tracking-[0.18em] text-faint">{label}</p>
      </div>
      {metric ? (
        <button
          type="button"
          onClick={() => onSelect(metric.slug)}
          className="mt-3 flex w-full items-center gap-3 rounded-xl border border-line bg-surface-2/40 p-3 text-left transition-colors hover:border-line-strong"
        >
          {metric.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={metric.thumbnailUrl}
              alt=""
              className="h-12 w-12 shrink-0 rounded-lg border border-line object-cover"
            />
          ) : (
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-line bg-surface-2/50 text-faint">
              <Icon name="FolderKanban" className="h-5 w-5" />
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14px] font-semibold text-ink">{metric.title}</span>
            <span className="mono block truncate text-[10.5px] text-faint">{metric.category}</span>
          </span>
          <span className="shrink-0 text-right">
            <span className="text-gradient block text-xl font-semibold leading-none">
              {isViewed
                ? metric.views.toLocaleString()
                : formatSeconds(metric.avgDurationSec)}
            </span>
            <span className="mono mt-1 block text-[9.5px] uppercase tracking-[0.14em] text-faint">
              {isViewed ? "views" : "avg. dwell"}
            </span>
          </span>
        </button>
      ) : (
        <p className="mt-3 rounded-xl border border-dashed border-line px-3 py-6 text-center text-[12px] text-faint">
          No project data yet.
        </p>
      )}
    </section>
  );
}

const tooltipStyle = {
  background: "var(--surface)",
  border: "1px solid var(--line)",
  borderRadius: 10,
  fontSize: 12,
} as const;

function ViewsComparisonChart({
  data,
  onSelect,
}: {
  data: ProjectAnalyticsOverview["viewsComparison"];
  onSelect: (slug: string) => void;
}) {
  const rows = useMemo(
    () => data.filter((d) => d.views > 0 || d.clicks > 0).sort((a, b) => b.views - a.views).slice(0, 8),
    [data],
  );

  if (!rows.length) {
    return <ChartEmpty text="No project views in this range yet." />;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={rows}
          margin={{ top: 6, right: 8, bottom: 0, left: -18 }}
        >
          <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="title"
            tick={{ fill: "var(--faint)", fontSize: 9 }}
            tickLine={false}
            axisLine={{ stroke: "var(--line)" }}
            interval={0}
            angle={-18}
            textAnchor="end"
            height={44}
          />
          <YAxis
            tick={{ fill: "var(--faint)", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={40}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={{ color: "var(--ink)" }}
            cursor={{ fill: "var(--surface-2, rgba(255,255,255,0.04))" }}
          />
          <Bar
            dataKey="views"
            name="Views"
            fill="var(--accent)"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
            onClick={(entry: { payload?: { slug?: string } }) => {
              const slug = entry?.payload?.slug;
              if (slug) onSelect(slug);
            }}
          />
          <Bar dataKey="clicks" name="Clicks" fill="var(--accent-2, #7c4dff)" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function DurationChart({
  projects,
  onSelect,
}: {
  projects: ProjectPerformanceMetric[];
  onSelect: (slug: string) => void;
}) {
  const rows = useMemo(
    () =>
      projects
        .filter((p) => p.avgDurationSec > 0)
        .sort((a, b) => b.avgDurationSec - a.avgDurationSec)
        .slice(0, 8)
        .map((p) => ({ slug: p.slug, title: p.title, avgDurationSec: p.avgDurationSec })),
    [projects],
  );

  if (!rows.length) {
    return <ChartEmpty text="No dwell-time data in this range yet." />;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={rows}
          layout="vertical"
          margin={{ top: 6, right: 16, bottom: 0, left: 8 }}
        >
          <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: "var(--faint)", fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: "var(--line)" }}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="title"
            tick={{ fill: "var(--faint)", fontSize: 9 }}
            tickLine={false}
            axisLine={false}
            width={110}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={{ color: "var(--ink)" }}
            cursor={{ fill: "var(--surface-2, rgba(255,255,255,0.04))" }}
            formatter={(value) => [`${value}s`, "Avg. dwell"]}
          />
          <Bar
            dataKey="avgDurationSec"
            radius={[0, 4, 4, 0]}
            maxBarSize={22}
            onClick={(entry: { payload?: { slug?: string } }) => {
              const slug = entry?.payload?.slug;
              if (slug) onSelect(slug);
            }}
          >
            {rows.map((row, index) => (
              <Cell key={row.slug} fill="var(--accent)" fillOpacity={1 - index * 0.08} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartEmpty({ text }: { text: string }) {
  return (
    <div className="grid h-64 place-items-center rounded-xl border border-dashed border-line text-[12px] text-faint">
      {text}
    </div>
  );
}

/** Individual project drilldown: metrics tiles + a view-timeline for the slug. */
function ProjectDrilldown({
  project,
  timeline,
  onClose,
}: {
  project: ProjectPerformanceMetric;
  timeline: ProjectAnalyticsOverview["timeline"];
  onClose: () => void;
}) {
  const series = useMemo(
    () =>
      timeline.map((row) => ({
        label: bucketLabel(String(row.bucket ?? "")),
        views: Number(row[project.slug] ?? 0),
      })),
    [timeline, project.slug],
  );

  const tiles = [
    { label: "Views", value: project.views.toLocaleString(), icon: "Eye" },
    { label: "Unique visitors", value: project.uniqueVisitors.toLocaleString(), icon: "Users" },
    { label: "Outbound clicks", value: project.clicks.toLocaleString(), icon: "Activity" },
    { label: "Avg. dwell", value: formatSeconds(project.avgDurationSec), icon: "Clock" },
    { label: "Click-through", value: `${project.ctr}%`, icon: "TrendingUp" },
  ];

  return (
    <section className="panel p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {project.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.thumbnailUrl}
              alt=""
              className="h-10 w-10 rounded-lg border border-line object-cover"
            />
          ) : null}
          <div>
            <h2 className="text-[14px] font-semibold text-ink">{project.title}</h2>
            <p className="mono text-[10.5px] text-faint">
              {project.category} · /projects/{project.slug}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-[11.5px] font-medium text-muted transition-colors hover:border-line-strong hover:text-accent"
        >
          <Icon name="X" className="h-3.5 w-3.5" />
          Close
        </button>
      </div>

      <div className="mt-4 grid gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-xl border border-line bg-surface-2/40 p-3">
            <div className="flex items-center gap-1.5 text-faint">
              <Icon name={tile.icon} className="h-3.5 w-3.5" />
              <span className="mono text-[9.5px] uppercase tracking-[0.14em]">{tile.label}</span>
            </div>
            <p className="mt-1.5 text-lg font-semibold leading-none text-ink">{tile.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 h-40 w-full">
        {series.some((s) => s.views > 0) ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series} margin={{ top: 6, right: 8, bottom: 0, left: -18 }}>
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
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "var(--ink)" }} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="views" name="Views" fill="var(--accent)" radius={[4, 4, 0, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="grid h-full place-items-center rounded-xl border border-dashed border-line text-[12px] text-faint">
            No view activity for this project in the selected range.
          </div>
        )}
      </div>
    </section>
  );
}
