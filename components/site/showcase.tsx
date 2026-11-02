"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import type { Project, SectionMeta } from "@/lib/types";
import { cn } from "@/lib/utils";

const TECH_LIMIT = 8;

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function hostOf(project: Project): string {
  if (!project.liveUrl) return `${project.slug}.local`;
  try {
    return new URL(project.liveUrl).host;
  } catch {
    return `${project.slug}.local`;
  }
}

/**
 * Project Showcase — HUD dark terminal style.
 * Left shelf: filterable project list. Right: browser-chrome preview.
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
    <section id="showcase" className="relative section-pad">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px rule-grad" />

      <div className="container-page">
        {/* View header */}
        <Reveal>
          <div className="mb-8">
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
          <div className="mb-6 space-y-2.5">
            <FilterRow label="Category" options={categories} value={category} onChange={setCategory} />
            <FilterRow label="Stack" options={technologies} value={tech} onChange={setTech} />
            <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-slate-500">
              <span>
                {matches.length}/{projects.length} projects
              </span>
              {filtering && (
                <button
                  type="button"
                  onClick={() => { setCategory("All"); setTech("All"); }}
                  className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-2 py-1 text-slate-400 transition-colors hover:border-acc/50 hover:text-acc"
                >
                  <Icon name="X" className="h-3 w-3" />
                  clear
                </button>
              )}
            </div>
          </div>
        </Reveal>

        {matches.length === 0 ? (
          <div className="hud mt-4 flex flex-col items-center gap-3 px-6 py-12 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-xl border border-acc/20 bg-acc/10 text-acc">
              <Icon name="Search" className="h-5 w-5" />
            </span>
            <p className="text-sm font-medium text-white">Nothing matches those filters</p>
            <p className="max-w-sm text-[13px] text-slate-400">
              Try another category or stack.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-5 lg:grid-cols-[0.62fr_1fr] lg:items-stretch">
            {/* Shelf */}
            <Reveal className="h-full">
              <div className="hud h-full overflow-hidden !p-2">
                <ul
                  aria-label="Project list"
                  className="flex h-full gap-1.5 overflow-x-auto pb-1 no-scrollbar lg:flex-col lg:overflow-y-auto lg:pr-1"
                >
                  {matches.map((project, position) => {
                    const isActive = project.slug === active?.slug;
                    return (
                      <li key={project._id} className="shrink-0 lg:w-full">
                        <button
                          type="button"
                          onClick={() => setActiveSlug(project.slug)}
                          aria-current={isActive ? "true" : undefined}
                          className={cn(
                            "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all lg:h-11",
                            isActive
                              ? "bg-acc/10 text-white ring-acc glow-sm"
                              : "text-slate-400 hover:bg-white/5 hover:text-white",
                          )}
                        >
                          <span
                            className={cn(
                              "font-mono w-5 shrink-0 text-[10px]",
                              isActive ? "text-acc" : "text-slate-600",
                            )}
                          >
                            {String(position + 1).padStart(2, "0")}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span
                              className={cn(
                                "block truncate text-[12.5px] font-medium",
                                isActive && "text-acc",
                              )}
                            >
                              {project.title}
                            </span>
                            <span className="mt-0.5 hidden truncate text-[10px] text-slate-500 sm:block lg:leading-tight">
                              {project.category}
                            </span>
                          </span>
                          <Icon
                            name="ChevronRight"
                            className={cn(
                              "h-3.5 w-3.5 shrink-0 transition-transform",
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

            {/* Preview */}
            <Reveal delay={90} className="h-full">
              {active ? (
                <motion.div
                  key={active._id}
                  initial={{ opacity: 0.35, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <Preview project={active} />
                </motion.div>
              ) : null}
            </Reveal>
          </div>
        )}
      </div>
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
              "chip transition-colors",
              selected
                ? "chip on"
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
    <div className="hud overflow-hidden">
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 border-b border-white/5 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
        <span className="font-mono ml-2 truncate text-[10.5px] text-slate-500">{hostOf(project)}</span>
      </div>

      <div className="relative bg-[#060b14]">
        <Image
          key={project.slug}
          src={project.thumbnailUrl || "/preview.png"}
          alt={`${project.title} screenshot`}
          width={1280}
          height={800}
          sizes="(max-width: 1024px) 92vw, 56vw"
          className="aspect-[16/10] w-full object-cover object-top"
        />
      </div>

      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold text-white">{project.title}</h3>
          <span className="font-mono rounded-md border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-slate-500">
            {project.category}
          </span>
          {project.isFeatured && (
            <span className="font-mono inline-flex items-center gap-1 rounded-md bg-acc/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-acc">
              <Icon name="Star" className="h-3 w-3" />
              featured
            </span>
          )}
        </div>

        <p className="mt-2.5 text-[13px] leading-relaxed text-slate-400">{project.shortDescription}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.techStack.map((item) => (
            <span
              key={item}
              className="chip"
            >
              {item}
            </span>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2 !rounded-lg !py-2 !text-[12.5px]"
            >
              Live Site
              <Icon name="ArrowUpRight" className="h-3.5 w-3.5" />
            </a>
          )}
          {project.sourceUrl && (
            <a
              href={project.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost inline-flex items-center gap-2 !rounded-lg !py-2 !text-[12.5px]"
            >
              <Icon name="Github" className="h-3.5 w-3.5" />
              Source Code
            </a>
          )}
          <Link
            href={`/projects/${project.slug}`}
            className="font-mono ml-auto inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-slate-400 transition-colors hover:text-acc"
          >
            Case study
            <Icon name="ArrowRight" className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
