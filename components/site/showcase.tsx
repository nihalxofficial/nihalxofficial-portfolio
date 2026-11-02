"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  ExternalLink,
  Github,
  Search,
  Star,
  Terminal,
  X,
} from "lucide-react";
import { SkillIcon } from "@/components/site/skills";
import { Reveal } from "@/components/ui/reveal";
import type { Project, SectionMeta } from "@/lib/types";
import { cn } from "@/lib/utils";

const TECH_LIMIT = 8;

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function hostOf(project: Project): string {
  if (!project.liveUrl) return `${project.slug}.vercel.app`;
  try {
    return new URL(project.liveUrl).host;
  } catch {
    return `${project.slug}.vercel.app`;
  }
}

/**
 * Project Showcase — HUD dark terminal style.
 * Left shelf: max 10 projects visible with scroll on desktop, swipeable on mobile.
 * Right: compact matching-height preview with robust mobile responsiveness and cohesive buttons.
 */
export function Showcase({
  projects,
  section,
  index,
}: {
  projects: Project[];
  section?: SectionMeta;
  index: number;
}) {
  const [category, setCategory] = useState("All");
  const [tech, setTech] = useState("All");
  const [activeSlug, setActiveSlug] = useState("");

  const categories = useMemo(
    () => ["All", ...unique(projects.map((p) => p.category))],
    [projects],
  );

  const technologies = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of projects) {
      for (const item of p.techStack) {
        counts.set(item, (counts.get(item) ?? 0) + 1);
      }
    }
    return [
      "All",
      ...[...counts.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, TECH_LIMIT)
        .map(([name]) => name),
    ];
  }, [projects]);

  const matches = useMemo(
    () =>
      projects.filter(
        (p) =>
          (category === "All" || p.category === category) &&
          (tech === "All" || p.techStack.includes(tech)),
      ),
    [projects, category, tech],
  );

  const active = matches.find((p) => p.slug === activeSlug) ?? matches[0];
  const filtering = category !== "All" || tech !== "All";

  if (projects.length === 0) return null;

  return (
    <section id="showcase" className="relative py-14">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px rule-grad" />

      {/* View header */}
      <Reveal>
        <div className="mb-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-acc/70">
            // showcase
          </p>
          <h2 className="mt-1 text-[1.7rem] font-bold leading-[1.15] tracking-tight text-white sm:text-[2rem]">
            {section?.heading?.split(" ").slice(0, -1).join(" ") || "Project"}{" "}
            <span className="text-grad">
              {section?.heading?.split(" ").slice(-1)[0] || "Showcase"}
            </span>
          </h2>
          {section?.description && (
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{section.description}</p>
          )}
        </div>
      </Reveal>

      {/* Filters */}
      <Reveal delay={60}>
        <div className="mb-5 space-y-2">
          <FilterRow label="Category" options={categories} value={category} onChange={setCategory} />
          <FilterRow label="Stack" options={technologies} value={tech} onChange={setTech} />
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-slate-500 pt-0.5">
            <span>
              {matches.length}/{projects.length} projects cataloged
            </span>
            {filtering && (
              <button
                type="button"
                onClick={() => { setCategory("All"); setTech("All"); }}
                className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-0.5 text-slate-400 transition-colors hover:border-acc/50 hover:text-acc cursor-pointer"
              >
                <X size={11} />
                clear
              </button>
            )}
          </div>
        </div>
      </Reveal>

      {matches.length === 0 ? (
        <div className="hud mt-4 flex flex-col items-center gap-3 px-6 py-12 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-xl border border-acc/20 bg-acc/10 text-acc">
            <Search size={20} />
          </span>
          <p className="text-sm font-medium text-white">Nothing matches those filters</p>
          <p className="max-w-sm text-[13px] text-slate-400">
            Try another category or tech filter.
          </p>
        </div>
      ) : (
        <div className="mt-2 grid gap-5 lg:grid-cols-[0.55fr_1fr] items-start min-w-0 max-w-full">
          {/* Left Shelf: Max 10 items visible, clean scroll */}
          <Reveal className="w-full min-w-0">
            <div className="hud !rounded-2xl overflow-hidden !p-2 lg:h-[480px] flex flex-col border border-white/10 min-w-0 max-w-full">
              <div className="px-3 py-2 mb-1 font-mono text-[10px] uppercase tracking-widest text-slate-500 border-b border-white/5 flex items-center justify-between">
                <span>// repository catalog</span>
                <span className="text-acc">{matches.length} active</span>
              </div>
              <ul
                aria-label="Project list"
                className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar lg:flex-col lg:overflow-y-auto lg:pr-1 flex-1 min-w-0"
              >
                {matches.map((project, position) => {
                  const isActive = project.slug === active?.slug;
                  return (
                    <li key={project._id} className="shrink-0 min-w-[150px] sm:min-w-[170px] lg:min-w-0 lg:w-full">
                      <button
                        type="button"
                        onClick={() => setActiveSlug(project.slug)}
                        aria-current={isActive ? "true" : undefined}
                        className={cn(
                          "group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-all lg:h-10 cursor-pointer",
                          isActive
                            ? "bg-acc/15 text-white ring-1 ring-acc glow-sm"
                            : "text-slate-400 hover:bg-white/5 hover:text-white",
                        )}
                      >
                        <span
                          className={cn(
                            "font-mono w-5 shrink-0 text-[10px]",
                            isActive ? "text-acc font-bold" : "text-slate-600",
                          )}
                        >
                          {String(position + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              "block truncate text-[12px] font-semibold leading-tight",
                              isActive ? "text-acc" : "text-slate-200",
                            )}
                          >
                            {project.title}
                          </span>
                          <span className="mt-0.5 truncate text-[9.5px] text-slate-500 block leading-none">
                            {project.category}
                          </span>
                        </span>
                        <ChevronRight
                          size={13}
                          className={cn(
                            "shrink-0 transition-transform hidden sm:block lg:block",
                            isActive ? "translate-x-0.5 text-acc" : "text-slate-600",
                          )}
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Reveal>

          {/* Right Preview Card: Matches left column height on desktop, fully responsive on mobile */}
          <Reveal delay={90} className="w-full min-w-0">
            <div className="w-full lg:h-[480px] min-w-0 max-w-full">
              {active ? (
                <motion.div
                  key={active._id}
                  initial={{ opacity: 0.35, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="h-full min-w-0 max-w-full"
                >
                  <Preview project={active} />
                </motion.div>
              ) : null}
            </div>
          </Reveal>
        </div>
      )}
    </section>
  );
}

function FilterRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-mono w-16 shrink-0 text-[10px] uppercase tracking-[0.18em] text-slate-500">
        {label}
      </span>
      {options.map((option) => {
        const selected = option === value;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={selected}
            className={cn(
              "chip text-xs transition-colors cursor-pointer",
              selected
                ? "chip on !border-acc text-acc bg-acc/10"
                : "text-slate-400 hover:border-white/20 hover:text-white",
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function Preview({ project }: { project: Project }) {
  return (
    <div className="hud !rounded-2xl overflow-hidden h-full flex flex-col justify-between border border-white/10 hover:border-acc/40 transition-colors min-w-0 max-w-full">
      <div className="min-w-0">
        {/* Browser window chrome */}
        <div className="flex items-center gap-2 border-b border-white/5 px-3 sm:px-4 py-2 bg-white/[0.02] min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="font-mono text-[10px] sm:text-[10.5px] text-slate-400 truncate min-w-0 flex-1">
            {hostOf(project)}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-auto shrink-0" />
        </div>

        {/* Thumbnail Frame */}
        <div className="relative bg-[#060b14] overflow-hidden group w-full">
          <Image
            key={project.slug}
            src={project.thumbnailUrl || "/preview.png"}
            alt={`${project.title} screenshot`}
            width={1280}
            height={800}
            sizes="(max-width: 1024px) 92vw, 56vw"
            className="aspect-[16/10] sm:aspect-[16/9] lg:h-[195px] w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          />
          {/* Subtle gradient overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#030617]/70 via-transparent to-transparent" />
        </div>
      </div>

      {/* Details Body */}
      <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between min-w-0">
        <div className="min-w-0">
          {/* Title, Category & Featured Badge */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate max-w-full">
              {project.title}
            </h3>
            <span className="font-mono rounded-md border border-acc/25 bg-acc/10 px-2 py-0.5 text-[9.5px] sm:text-[10px] uppercase tracking-wider text-acc shrink-0">
              {project.category}
            </span>
            {project.isFeatured && (
              <span className="font-mono inline-flex items-center gap-1 rounded-md bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 text-[9.5px] sm:text-[10px] uppercase tracking-wider text-amber-300 shrink-0">
                <Star size={10} className="fill-amber-400 text-amber-400" />
                Featured
              </span>
            )}
          </div>

          <p className="mt-2 text-[12.5px] sm:text-[13px] leading-relaxed text-slate-300 line-clamp-2">
            {project.shortDescription || project.description}
          </p>

          {/* Tech Stack Chips with Brand Logos */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.techStack.map((item) => (
              <span
                key={item}
                className="font-mono text-[10px] sm:text-[10.5px] px-2 py-0.5 rounded bg-acc/10 text-acc border border-acc/20 inline-flex items-center gap-1"
              >
                <SkillIcon name={item} className="w-3 h-3 text-current shrink-0" size={11} />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons: Live Site + Source Code + Case Study (Clean, Responsive) */}
        <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-acc/15 hover:bg-acc/25 text-acc border border-acc/40 hover:border-acc font-mono text-[11px] sm:text-xs font-semibold shadow-[0_0_12px_rgba(0,255,200,0.15)] hover:shadow-[0_0_16px_var(--acc)] transition-all cursor-pointer whitespace-nowrap"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span>Live Site</span>
                <ArrowUpRight size={13} className="shrink-0" />
              </a>
            )}
            {project.sourceUrl && (
              <a
                href={project.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10 hover:border-acc/40 font-mono text-[11px] sm:text-xs transition-all cursor-pointer whitespace-nowrap"
              >
                <Github size={13} className="shrink-0 text-slate-400 group-hover:text-white" />
                <span>Source Code</span>
              </a>
            )}
          </div>
          <Link
            href={`/projects/${project.slug}`}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] sm:text-xs font-semibold text-slate-400 hover:text-acc transition-colors uppercase tracking-widest whitespace-nowrap ml-auto sm:ml-0"
          >
            <span>Case Study</span>
            <ArrowRight size={13} className="shrink-0" />
          </Link>
        </div>
      </div>
    </div>
  );
}
