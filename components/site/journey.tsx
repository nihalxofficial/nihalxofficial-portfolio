"use client";

import { useState } from "react";
import { ChevronDown, MapPin } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import type { Experience } from "@/lib/types";
import { formatMonth } from "@/lib/utils";

/** Status badge colors */
const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  current:   { label: "HEAD",      cls: "text-emerald-400 border-emerald-400/40 bg-emerald-400/10" },
  ongoing:   { label: "Ongoing",   cls: "text-acc border-acc/40 bg-acc/10" },
  upcoming:  { label: "Upcoming",  cls: "text-amber-400 border-amber-400/40 bg-amber-400/10" },
  completed: { label: "Completed", cls: "text-slate-500 border-white/10 bg-white/4" },
};

function period(entry: Experience): string {
  const start = formatMonth(entry.startDate) || entry.startDate;
  const end   = entry.isCurrent ? "Present" : formatMonth(entry.endDate) || entry.endDate;
  if (!start && !end) return "";
  return [start, end].filter(Boolean).join(" — ");
}

/** Short git-hash–style id derived from the entry _id */
function shortHash(id: string) {
  return id.slice(-7);
}

function CommitCard({ entry, index }: { entry: Experience; index: number }) {
  const [expanded, setExpanded] = useState(entry.status === "current");
  const status = STATUS_CFG[entry.status] ?? STATUS_CFG.completed;
  const range  = period(entry);
  const isCurrent = entry.status === "current" || entry.isCurrent;

  return (
    <div className={`hud transition ${isCurrent ? "ring-acc glow-sm" : ""}`}>
      {/* Commit header */}
      <button
        className="w-full flex items-start gap-3 p-4 cursor-pointer text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Timeline dot */}
        <span className="mt-1 shrink-0 w-3.5 h-3.5 rounded-full border-2 border-acc bg-ink" />

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {/* Git hash */}
            <span className="font-mono text-[10px] text-acc bg-acc/10 px-1.5 py-0.5 rounded">
              {shortHash(entry._id)}
            </span>
            {/* Branch badge */}
            <span className="font-mono text-[10px] text-slate-400 border border-white/10 px-1.5 py-0.5 rounded">
              {entry.employmentType || "employment"}
            </span>
            {/* HEAD badge */}
            {isCurrent && (
              <span className={`font-mono text-[10px] rounded-full border px-2 py-0.5 ${status.cls}`}>
                {status.label}
              </span>
            )}
          </div>

          {/* Role commit message */}
          <p className="font-semibold text-[14px] leading-snug">{entry.role}</p>
          <p className="text-sm text-acc mt-0.5">{entry.organization}</p>

          {(range || entry.location) && (
            <p className="font-mono flex flex-wrap items-center gap-x-2 gap-y-1 text-[10.5px] text-slate-500 mt-1.5">
              {range && <span>{range}</span>}
              {range && entry.location && <span className="text-white/10">•</span>}
              {entry.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin size={10} /> {entry.location}
                </span>
              )}
            </p>
          )}
        </div>

        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-500 mt-1 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {/* Expandable body */}
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-white/5">
          {entry.description && (
            <p className="text-[12.5px] leading-relaxed text-slate-400 mt-3">
              {entry.description}
            </p>
          )}

          {entry.responsibilities.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {entry.responsibilities.map((item) => (
                <li key={item} className="flex gap-2 text-[12.5px] leading-snug text-slate-300">
                  <span className="text-acc mt-0.5 shrink-0">▹</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}

          {entry.technologies.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {entry.technologies.map((tech) => (
                <span key={tech} className="chip !text-[10px] !py-0.5">{tech}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function JourneyTimeline({ experience }: { experience: Experience[] }) {
  return (
    <div className="relative mt-6 pl-4 border-l-2 border-acc/20">
      {/* Gradient line */}
      <div className="absolute -left-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-acc via-acc/40 to-transparent" />

      <div className="space-y-4">
        {experience.map((entry, i) => (
          <CommitCard key={entry._id} entry={entry} index={i} />
        ))}
      </div>
    </div>
  );
}
