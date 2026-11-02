"use client";

import { useMemo, useState } from "react";
import {
  Briefcase, ChevronDown, Copy, Flag, GitBranch,
  GitCommitHorizontal, GraduationCap, MapPin,
} from "lucide-react";
import { Icon } from "@/components/ui/icon";
import type { Education as EducationEntry, Experience } from "@/lib/types";
import { formatMonth } from "@/lib/utils";

/* ─── Seeded RNG (identical to reference) ─────────────────────────────── */
function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/* ─── Contribution Heatmap ─────────────────────────────────────────────── */
function Heatmap() {
  const weeks = 40;
  const { cells, total } = useMemo(() => {
    const r = rng(42);
    let total = 0;
    const cells = Array.from({ length: weeks }, (_, w) =>
      Array.from({ length: 7 }, (_, d) => {
        const base = 0.35 + (w / weeks) * 0.5;
        const weekend = d === 0 || d === 6 ? 0.55 : 1;
        const v = r() < base * weekend ? Math.ceil(r() * 4) : 0;
        total += v * 3;
        return v;
      })
    );
    return { cells, total };
  }, []);

  const shade = [
    "bg-white/[0.05]",
    "bg-acc/25",
    "bg-acc/50",
    "bg-acc/75",
    "bg-acc shadow-[0_0_6px_var(--acc)]",
  ];

  return (
    <div className="hud p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <div className="font-mono text-[11px] text-acc uppercase tracking-widest">
            {"// contribution activity"}
          </div>
          <div className="text-sm text-slate-300 mt-1">
            <b className="text-white font-display text-lg">{total.toLocaleString()}</b>{" "}
            contributions in the last year
          </div>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
          less{" "}
          {shade.map((s, i) => (
            <span key={i} className={`w-3 h-3 rounded-sm ${s}`} />
          ))}{" "}
          more
        </div>
      </div>
      <div className="overflow-x-auto pb-1">
        <div className="min-w-[640px]">
          {/* Month labels */}
          <div className="flex gap-[3px] pl-0 mb-1 font-mono text-[9px] text-slate-600">
            {Array.from({ length: weeks }, (_, w) => (
              <span key={w} className="w-[14px] shrink-0">
                {w % 4 === 0 ? MONTHS[Math.floor((w / weeks) * 12)] : ""}
              </span>
            ))}
          </div>
          {/* Grid */}
          <div className="flex gap-[3px]">
            {cells.map((col, w) => (
              <div key={w} className="flex flex-col gap-[3px]">
                {col.map((v, d) => (
                  <span
                    key={d}
                    title={`${v * 3} contributions`}
                    className={`w-[14px] h-[14px] rounded-[3px] hover:scale-150 transition ${shade[v]}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Type metadata ────────────────────────────────────────────────────── */
const TYPE_META = {
  work:      { icon: Briefcase,      color: "var(--acc)",  label: "work" },
  edu:       { icon: GraduationCap,  color: "var(--acc2)", label: "learning" },
  milestone: { icon: Flag,           color: "#fbbf24",     label: "milestone" },
} as const;

/** Map Experience status → commit type */
function toCommitType(entry: Experience): "work" | "edu" | "milestone" {
  if (entry.status === "current" || entry.employmentType?.toLowerCase().includes("edu")) return "work";
  return "work";
}

/* ─── Status badge config ──────────────────────────────────────────────── */
const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  current:   { label: "HEAD → Current", cls: "text-emerald-400 border-emerald-400/40 bg-emerald-400/15 animate-pulse" },
  ongoing:   { label: "Ongoing",        cls: "text-acc border-acc/40 bg-acc/10" },
  upcoming:  { label: "Upcoming",       cls: "text-amber-400 border-amber-400/40 bg-amber-400/10" },
  completed: { label: "Completed",      cls: "text-slate-500 border-white/10 bg-white/4" },
};

function period(entry: Experience): string {
  const start = formatMonth(entry.startDate) || entry.startDate;
  const end   = entry.isCurrent ? "Present" : formatMonth(entry.endDate) || entry.endDate;
  if (!start && !end) return "";
  return [start, end].filter(Boolean).join(" — ");
}

function shortHash(id: string) { return id.slice(-7); }

/* ─── Enhanced CommitCard (matches reference layout) ───────────────────── */
function CommitCard({
  entry,
  index,
  open,
  toggle,
}: {
  entry: Experience;
  index: number;
  open: boolean;
  toggle: () => void;
}) {
  const isCurrent = entry.status === "current" || entry.isCurrent;
  const status    = STATUS_CFG[entry.status] ?? STATUS_CFG.completed;
  const range     = period(entry);
  const hash      = shortHash(entry._id);
  const branch    = entry.employmentType || "employment";

  // Derive icon type from employment type text
  const typeMeta = TYPE_META.work; // all experience entries are work type

  return (
    <div
      className="relative pl-14 sm:pl-16 rise"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      {/* Timeline node */}
      <span
        className="absolute left-0 top-4 w-10 h-10 rounded-full grid place-items-center bg-[#050a26] z-10"
        style={{
          border: `2px solid ${typeMeta.color}`,
          boxShadow: `0 0 16px ${typeMeta.color}`,
          color: typeMeta.color,
        }}
      >
        <typeMeta.icon size={16} />
      </span>

      <div className={`hud hud-hover overflow-hidden ${isCurrent ? "ring-acc glow-sm" : ""}`}>
        <button onClick={toggle} className="w-full text-left p-4 sm:p-5 cursor-pointer">
          {/* Metadata row */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 text-amber-300">
              <GitCommitHorizontal size={12} />{hash}
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded border border-acc/30 text-acc">
              <GitBranch size={11} />{branch}
            </span>
            {isCurrent && (
              <span className={`px-2 py-0.5 rounded-full border font-mono text-[10px] ${status.cls}`}>
                {status.label}
              </span>
            )}
            <span className="ml-auto text-slate-400">{range}</span>
          </div>

          {/* Role + org */}
          <div className="mt-3 flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-xl font-bold">{entry.role}</h3>
              <div className="text-sm text-slate-400">@ {entry.organization}</div>
            </div>
            <ChevronDown
              size={18}
              className={`text-acc shrink-0 mt-1 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </div>

          {/* Location */}
          {entry.location && (
            <div className="mt-2 font-mono text-xs text-slate-500 flex items-center gap-1">
              <MapPin size={10} /> {entry.location}
            </div>
          )}

          {/* Short description as commit message */}
          {entry.description && (
            <div className="mt-2 font-mono text-xs text-slate-500">&gt; {entry.description.slice(0, 80)}{entry.description.length > 80 ? "…" : ""}</div>
          )}
        </button>

        {/* Expandable body */}
        {open && (
          <div className="fade px-4 sm:px-5 pb-5 border-t border-white/10 pt-4">
            {entry.responsibilities.length > 0 && (
              <ul className="space-y-2">
                {entry.responsibilities.map((b) => (
                  <li key={b} className="flex gap-2 text-sm text-slate-300">
                    <span className="text-emerald-400 font-mono">+</span>{b}
                  </li>
                ))}
              </ul>
            )}
            {entry.technologies.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {entry.technologies.map((s) => (
                  <span key={s} className="font-mono text-[10px] px-2 py-0.5 rounded bg-acc/10 text-acc border border-acc/20">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Education Card ───────────────────────────────────────────────────── */
function EduCard({ entry, index }: { entry: EducationEntry; index: number }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className="relative pl-14 sm:pl-16 rise"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <span
        className="absolute left-0 top-4 w-10 h-10 rounded-full grid place-items-center bg-[#050a26] z-10"
        style={{
          border: `2px solid var(--acc2)`,
          boxShadow: `0 0 16px var(--acc2)`,
          color: "var(--acc2)",
        }}
      >
        <GraduationCap size={16} />
      </span>

      <div className="hud hud-hover overflow-hidden">
        <button onClick={() => setExpanded(v => !v)} className="w-full text-left p-4 sm:p-5 cursor-pointer">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded border border-acc2/30 text-acc2">
              <GraduationCap size={11} />{entry.field || "education"}
            </span>
            <span className="ml-auto text-slate-400">{entry.period}</span>
          </div>
          <div className="mt-3 flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-xl font-bold">{entry.degree}</h3>
              <div className="text-sm text-slate-400">@ {entry.institution}</div>
            </div>
            <ChevronDown
              size={18}
              className={`text-acc2 shrink-0 mt-1 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </div>
          {entry.description && (
            <div className="mt-2 font-mono text-xs text-slate-500">&gt; {entry.description.slice(0, 80)}{entry.description.length > 80 ? "…" : ""}</div>
          )}
        </button>
        {expanded && entry.highlights.length > 0 && (
          <div className="fade px-4 sm:px-5 pb-5 border-t border-white/10 pt-4">
            <ul className="space-y-2">
              {entry.highlights.map((b) => (
                <li key={b} className="flex gap-2 text-sm text-slate-300">
                  <span className="text-emerald-400 font-mono">+</span>{b}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main exported component ──────────────────────────────────────────── */
export function JourneySection({
  experience,
  education,
}: {
  experience: Experience[];
  education: EducationEntry[];
}) {
  const cleanEducation = useMemo(() => {
    return education
      .filter((e) => !/ssc|school/i.test(e.degree) && !/ssc/i.test(e.field))
      .map((e) => {
        if (/diploma/i.test(e.degree) || /polytechnic/i.test(e.institution)) {
          return { ...e, period: "2023 - Present" };
        }
        return e;
      });
  }, [education]);

  const [filter, setFilter] = useState<"all" | "work" | "edu" | "milestone">("all");
  const [openId, setOpenId] = useState<string>(experience[0]?._id ?? "");

  // Compute unique branches for repo stats
  const branches = new Set(experience.map((e) => e.employmentType || "employment")).size;

  return (
    <section id="journey" className="relative py-12">
      {/* View Header */}
      <div className="mb-6">
        <p className="eyebrow mb-2 font-mono text-xs text-acc">{"// my journey"}</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-3xl font-bold">
            Experience <span className="text-grad">Timeline</span>
          </h2>
          {/* Filter chips */}
          <div className="flex flex-wrap gap-2">
            {(["all", "work", "edu", "milestone"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`chip ${filter === f ? "on" : ""}`}
              >
                {f === "all" ? "all commits" : TYPE_META[f as keyof typeof TYPE_META]?.label ?? f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <Heatmap />

      {/* Timeline + Sidepanels */}
      <div className="mt-6 grid xl:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Main timeline */}
        <div>
          {/* Terminal command hint */}
          <div className="font-mono text-xs text-slate-400 mb-4 flex items-center gap-2 flex-wrap">
            <span className="text-emerald-400">➜</span>{" "}
            <span className="text-acc">~/career</span> git log --graph --oneline
            <button
              onClick={() => navigator.clipboard?.writeText("git log --graph --oneline")}
              aria-label="Copy command"
              className="text-slate-600 hover:text-acc cursor-pointer"
            >
              <Copy size={12} />
            </button>
          </div>

          <div className="relative space-y-5">
            {/* Gradient line */}
            <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-acc via-acc2 to-transparent opacity-60" />

            {/* Work experience entries */}
            {(filter === "all" || filter === "work") && experience.map((entry, i) => (
              <CommitCard
                key={entry._id}
                entry={entry}
                index={i}
                open={openId === entry._id}
                toggle={() => setOpenId(openId === entry._id ? "" : entry._id)}
              />
            ))}

            {/* Education entries */}
            {(filter === "all" || filter === "edu") && cleanEducation.map((entry, i) => (
              <EduCard key={entry._id} entry={entry} index={i} />
            ))}

            {/* Empty state for milestone filter */}
            {filter === "milestone" && (
              <div className="hud p-6 text-center text-slate-500 font-mono text-sm">
                // no milestone commits yet
              </div>
            )}
          </div>
        </div>

        {/* Sidepanels */}
        <div className="space-y-5">
          {/* Repo stats */}
          <div className="hud p-5">
            <div className="font-mono text-[11px] text-acc uppercase tracking-widest mb-3">{"// repo stats"}</div>
            {[
              ["Total commits",    experience.length + education.length],
              ["Branches",         branches],
              ["Years coding",     "2+"],
              ["Merge conflicts",  "resolved ✓"],
            ].map(([k, v]) => (
              <div key={k as string} className="flex justify-between py-2 border-b border-dashed border-white/10 last:border-0 text-sm">
                <span className="text-slate-400">{k}</span>
                <span className="font-mono text-acc">{v}</span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="hud p-5">
            <div className="font-mono text-[11px] text-acc uppercase tracking-widest mb-3">{"// legend"}</div>
            <div className="space-y-2.5 text-sm">
              {(Object.values(TYPE_META) as { icon: React.ElementType; color: string; label: string }[]).map((m) => (
                <div key={m.label} className="flex items-center gap-3">
                  <span
                    className="w-7 h-7 rounded-full grid place-items-center"
                    style={{ border: `2px solid ${m.color}`, color: m.color }}
                  >
                    <m.icon size={13} />
                  </span>
                  <span className="capitalize text-slate-300">{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Legacy export — kept for backward compat ─────────────────────────── */
export function JourneyTimeline({ experience }: { experience: Experience[] }) {
  const [openId, setOpenId] = useState<string>(experience[0]?._id ?? "");
  return (
    <div className="relative space-y-5 mt-6">
      <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-acc via-acc2 to-transparent opacity-60" />
      {experience.map((entry, i) => (
        <CommitCard
          key={entry._id}
          entry={entry}
          index={i}
          open={openId === entry._id}
          toggle={() => setOpenId(openId === entry._id ? "" : entry._id)}
        />
      ))}
    </div>
  );
}
