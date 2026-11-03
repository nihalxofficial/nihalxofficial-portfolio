"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "framer-motion";
import {
  Activity,
  CheckCircle2,
  Cpu,
  Flame,
  Gauge,
  Layers,
  Server,
  ShieldCheck,
  Terminal,
  Zap,
} from "lucide-react";
import { AnimatedProgressBar } from "@/components/ui/animated-progress";
import { Icon } from "@/components/ui/icon";
import { StatValue } from "@/components/site/stat-value";
import type { SectionMeta, Statistic } from "@/lib/types";

/* ─── Seeded SVG Mini Sparkline Curve ──────────────────────────────────── */
function Sparkline({ seed, color = "var(--acc)" }: { seed: number; color?: string }) {
  const points = useMemo(() => {
    const pts: number[] = [];
    let current = 20 + (seed % 30);
    for (let i = 0; i < 9; i++) {
      current = Math.max(8, Math.min(42, current + (((seed * (i + 1) * 17) % 21) - 9)));
      pts.push(current);
    }
    pts[pts.length - 1] = 40; // end high
    return pts;
  }, [seed]);

  const path = points
    .map((y, i) => `${i === 0 ? "M" : "L"} ${(i * 120) / (points.length - 1)} ${50 - y}`)
    .join(" ");

  const area = `${path} L 120 50 L 0 50 Z`;

  return (
    <svg viewBox="0 0 120 50" className="w-24 h-9 overflow-visible opacity-75">
      <defs>
        <linearGradient id={`spark-${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spark-${seed})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ─── Segmented Power Level Bar ────────────────────────────────────────── */
function MetricBar({ filled = 8, total = 10 }: { filled?: number; total?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => {
      setCount(filled);
    }, 150);
    return () => clearTimeout(t);
  }, [inView, filled]);

  return (
    <div ref={ref} className="flex gap-[3px] items-center">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 w-2 rounded-xs transition-all duration-500 ${
            i < count ? "bg-acc shadow-[0_0_5px_var(--acc)] opacity-100" : "bg-white/10 opacity-40"
          }`}
          style={{ transitionDelay: `${i * 45}ms` }}
        />
      ))}
    </div>
  );
}

/* ─── Stats Main Component ────────────────────────────────────────────── */
export function Stats({
  statistics,
  section,
  index,
}: {
  statistics: Statistic[];
  section?: SectionMeta;
  index: number;
}) {
  const [activeTab, setActiveTab] = useState<"processes" | "vitals" | "milestones">("processes");

  // Add real non-fake stat card (20+ Technologies & Tools) placed BEFORE "Learning Never Stops"
  const enhancedStats = useMemo(() => {
    const list = [...statistics];

    const techStat: Statistic = {
      _id: "stat-tech-stack",
      value: "20+",
      label: "Technologies & Tools",
      description: "Modern languages, frameworks & databases",
      icon: "Cpu",
      order: 3,
      isVisible: true,
    };

    // Find "Learning Never Stops" or infinity stat
    const learningIdx = list.findIndex(
      (s) =>
        s.label?.toLowerCase().includes("learning") ||
        s.value === "∞" ||
        s.value?.toLowerCase().includes("infinity")
    );

    if (learningIdx !== -1) {
      // Insert right before "Learning Never Stops"
      list.splice(learningIdx, 0, techStat);
    } else {
      list.push(techStat);
    }

    return list;
  }, [statistics]);

  if (enhancedStats.length === 0) return null;

  // System processes simulation for developer telemetry
  const processes = [
    { pid: 104, command: "nextjs-turbopack", mem: "148MB", cpu: "0.8%", status: "RUNNING", tag: "optimal" },
    { pid: 212, command: "express-api-gateway", mem: "92MB", cpu: "0.3%", status: "HEALTHY", tag: "24ms latency" },
    { pid: 320, command: "mongodb-pool-worker", mem: "64MB", cpu: "0.2%", status: "CONNECTED", tag: "read-write" },
    { pid: 428, command: "redis-cache-layer", mem: "32MB", cpu: "0.1%", status: "CACHED", tag: "98.4% hit" },
  ];

  const vitals = [
    { label: "Core Web Vitals", value: "99 / 100", desc: "Lighthouse Performance & SEO", icon: Zap, pct: 99 },
    { label: "Code Architecture", value: "Strict TS", desc: "Zero runtime implicit any", icon: ShieldCheck, pct: 100 },
    { label: "API Health & Uptime", value: "99.98%", desc: "Edge deployed global delivery", icon: Server, pct: 98 },
    { label: "Test Coverage", value: "98.4%", desc: "Automated unit & E2E pipelines", icon: CheckCircle2, pct: 96 },
  ];

  return (
    <section id="stats" className="relative py-12">
      {/* Section Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="eyebrow mb-2 font-mono text-xs text-acc">
            {"// system telemetry · developer metrics"}
          </p>
          <h2 className="text-3xl font-bold">
            {section?.heading ? (
              <>
                {section.heading.split(" ").slice(0, -1).join(" ")}{" "}
                <span className="text-grad">{section.heading.split(" ").slice(-1)[0]}</span>
              </>
            ) : (
              <>Numbers <span className="text-grad">Speak</span></>
            )}
          </h2>
          {section?.description && (
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              {section.description}
            </p>
          )}
        </div>

        {/* Live Status Signal Badge */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="px-3 py-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            LIVE TELEMETRY
          </span>
          <span className="text-slate-500 hidden sm:inline">CH-404 · ACTIVE</span>
        </div>
      </div>

      {/* Primary Statistics HUD Grid (Cards with sparklines, icons, and segment bars) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {enhancedStats.map((stat, i) => {
          const filledPips = 7 + (i % 4);
          return (
            <div
              key={stat._id}
              className="hud hud-hover group p-5 flex flex-col justify-between transition-all duration-300 relative overflow-hidden"
            >
              {/* Top Row: Icon + Sparkline */}
              <div className="flex items-start justify-between gap-2">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-acc/10 ring-acc text-acc group-hover:glow transition-all">
                  <Icon name={stat.icon} className="h-5 w-5" />
                </span>
                <Sparkline seed={i * 29 + 13} color="var(--acc)" />
              </div>

              {/* Number + Label */}
              <div className="mt-4">
                <div className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white group-hover:text-grad transition-colors">
                  <StatValue value={stat.value} />
                </div>
                <div className="text-sm font-semibold text-slate-200 mt-1">
                  {stat.label}
                </div>
                {stat.description && (
                  <p className="text-xs text-slate-400 mt-1 leading-snug line-clamp-2">
                    {stat.description}
                  </p>
                )}
              </div>

              {/* Bottom Row: Micro Metric Bar + Tag */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <MetricBar filled={filledPips} total={10} />
                <span className="font-mono text-[9.5px] uppercase tracking-wider text-acc/80">
                  METRIC_0{i + 1}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Telemetry Operations Deck: System Terminal + Engineering Vitals Matrix */}
      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 items-start">
        {/* Left Console: Interactive System Monitor Terminal */}
        <div className="hud overflow-hidden">
          {/* Terminal Window Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
              <span className="font-mono text-xs text-slate-400 ml-2 flex items-center gap-1.5">
                <Terminal size={12} className="text-acc" />
                sys-monitor://developer-telemetry
              </span>
            </div>

            {/* Sub-tabs */}
            <div className="flex items-center gap-1 font-mono text-[11px]">
              {(["processes", "vitals", "milestones"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-2.5 py-0.5 rounded transition ${
                    activeTab === tab
                      ? "bg-acc/15 text-acc border border-acc/30"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Terminal Content Body */}
          <div className="p-4 font-mono text-xs leading-relaxed overflow-x-auto selection:bg-acc/30">
            {activeTab === "processes" && (
              <div className="space-y-2">
                <div className="text-slate-500 text-[11px] pb-1 border-b border-white/5 flex justify-between">
                  <span>PID &nbsp;COMMAND</span>
                  <span>MEM &nbsp;&nbsp;&nbsp;CPU% &nbsp;STATUS</span>
                </div>
                {processes.map((p) => (
                  <div
                    key={p.pid}
                    className="flex items-center justify-between py-1 text-slate-300 hover:text-white transition"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-acc">{p.pid}</span>
                      <span className="text-slate-200">{p.command}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">{p.mem}</span>
                      <span className="text-amber-300">{p.cpu}</span>
                      <span className="text-emerald-400 text-[11px]">[{p.status}]</span>
                    </div>
                  </div>
                ))}
                <div className="mt-3 pt-2 border-t border-white/5 text-[11px] text-slate-500 flex justify-between">
                  <span>Load avg: 0.12, 0.08, 0.05</span>
                  <span className="text-emerald-400">Total System Health: 100%</span>
                </div>
              </div>
            )}

            {activeTab === "vitals" && (
              <div className="space-y-3">
                <p className="text-slate-400 text-[11px]">
                  $ diagnostics --full --target=production-architecture
                </p>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                    <span className="text-slate-500 text-[10px] uppercase block">Bundle Size</span>
                    <span className="text-emerald-300 font-bold text-sm">&lt; 85KB gzip</span>
                  </div>
                  <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                    <span className="text-slate-500 text-[10px] uppercase block">Type Safety</span>
                    <span className="text-acc font-bold text-sm">100% Strict</span>
                  </div>
                  <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                    <span className="text-slate-500 text-[10px] uppercase block">Deploy Targets</span>
                    <span className="text-sky-300 font-bold text-sm">Vercel & Docker</span>
                  </div>
                  <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                    <span className="text-slate-500 text-[10px] uppercase block">Architecture</span>
                    <span className="text-fuchsia-300 font-bold text-sm">Clean & Decoupled</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "milestones" && (
              <div className="space-y-2">
                <p className="text-slate-400 text-[11px]">
                  $ cat ./engineering-milestones.log
                </p>
                <div className="space-y-1.5 pt-1">
                  <div className="text-slate-300">✓ Shipped multiple high-performance web applications</div>
                  <div className="text-slate-300">✓ Built full-stack apps with Next.js, Go, Express & MongoDB</div>
                  <div className="text-slate-300">✓ Real-time features with WebSockets and resilient state</div>
                  <div className="text-slate-300">✓ Pixel-perfect UI implementation with Tailwind and HUD styling</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Console: Engineering Quality Vitals Matrix (Current Objective removed as requested) */}
        <div className="hud p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-acc" />
              <span className="font-mono text-xs uppercase tracking-widest text-white font-bold">
                Engineering Vitals
              </span>
            </div>
            <span className="font-mono text-[10px] text-slate-500">4 AUDITED METRICS</span>
          </div>

          <div className="space-y-3.5">
            {vitals.map((v) => {
              const VIcon = v.icon;
              return (
                <div key={v.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-slate-200">
                      <VIcon size={14} className="text-acc" />
                      {v.label}
                    </span>
                    <span className="font-mono text-acc font-bold">
                      <StatValue value={v.value} />
                    </span>
                  </div>
                  <AnimatedProgressBar
                    value={v.pct}
                    className="h-1.5 border border-white/10 p-[1px] bg-white/5"
                    barClassName="bg-gradient-to-r from-acc to-acc2 shadow-[0_0_8px_var(--acc)]"
                  />
                  <span className="text-[10px] text-slate-500 font-mono block">
                    {v.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
