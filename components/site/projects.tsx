"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ExternalLink,
  Eye,
  FileCode2,
  GitCommitHorizontal,
  Github,
  Layers,
  LayoutGrid,
  Radio,
  Search,
  Sparkles,
  Star,
  Terminal,
} from "lucide-react";
import { SkillIcon } from "@/components/site/skills";
import type { Project, SectionMeta } from "@/lib/types";

/* ── 3-D tilt card wrapper ─────────────────────────────────────────────── */
function Tilt({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-3px)`;
  };
  const leave = () => {
    if (ref.current) ref.current.style.transform = "";
  };
  return (
    <div
      ref={ref}
      onMouseMove={move}
      onMouseLeave={leave}
      className={`transition-transform duration-200 ${className}`}
    >
      {children}
    </div>
  );
}

/* ── Status badge ─────────────────────────────────────────────────────── */
function StatusBadge({ status }: { status?: string }) {
  const isLive = true;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2.5 py-0.5 font-mono text-[10px] text-emerald-400 backdrop-blur shadow-[0_0_8px_rgba(52,211,153,0.2)]">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      Live
    </span>
  );
}

export function Projects({
  projects,
  total,
  section,
  index,
}: {
  projects: Project[];
  total?: number;
  section?: SectionMeta;
  index: number;
}) {
  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"spotlight" | "matrix">("spotlight");

  // Unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["ALL", ...Array.from(set)];
  }, [projects]);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesCat = selectedCat === "ALL" || p.category === selectedCat;
      if (!matchesCat) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.shortDescription?.toLowerCase().includes(q) ||
        p.techStack.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [projects, selectedCat, query]);

  // In spotlight mode, the 1st project is the flagship hero, rest are fleet cards
  const flagship = filtered[0];
  const fleet = filtered.slice(1);

  // Bail out only after every hook has run, so the hook order stays stable
  // when the CMS list becomes empty between renders.
  if (projects.length === 0) return null;

  return (
    <section id="projects" className="relative py-14">
      {/* View Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2 font-mono text-xs text-acc">
            <span>{"// portfolio dossiers"}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">selected production engineering</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Featured <span className="text-grad">Projects</span>
          </h2>
          {section?.description && (
            <p className="text-sm text-slate-400 mt-2 max-w-xl">{section.description}</p>
          )}
        </div>

        {/* View mode toggle & Search */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Mode Switcher */}
          <div className="hud !rounded-lg p-1 flex shrink-0">
            <button
              onClick={() => setViewMode("spotlight")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs cursor-pointer transition ${
                viewMode === "spotlight"
                  ? "bg-acc/15 text-acc font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Spotlight Flagship view"
            >
              <Radio size={13} />
              Spotlight
            </button>
            <button
              onClick={() => setViewMode("matrix")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs cursor-pointer transition ${
                viewMode === "matrix"
                  ? "bg-acc/15 text-acc font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Matrix Grid view"
            >
              <LayoutGrid size={13} />
              Matrix
            </button>
          </div>

          {/* Search box */}
          <div className="flex items-center gap-2 hud !rounded-lg px-3 py-1.5 w-48 sm:w-56">
            <Search size={13} className="text-slate-500 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="filter stack or title…"
              className="bg-transparent outline-none text-xs w-full placeholder:text-slate-600 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {categories.map((cat) => {
          const active = selectedCat === cat;
          const count =
            cat === "ALL"
              ? projects.length
              : projects.filter((p) => p.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`chip text-xs transition cursor-pointer ${
                active
                  ? "on !border-acc text-acc bg-acc/10"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {cat === "ALL" ? "All Featured" : cat}
              <span className="ml-1.5 opacity-60 font-mono text-[10px]">{count}</span>
            </button>
          );
        })}
      </div>

      {/* ── SPOTLIGHT MODE ──────────────────────────────────────────────── */}
      {viewMode === "spotlight" && flagship ? (
        <div className="space-y-6">
          {/* Flagship Hero Card */}
          <div className="hud hud-hover !rounded-2xl p-5 sm:p-7 relative overflow-hidden border border-acc/30 glow-sm">
            {/* Top scanning gradient bar */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-acc via-acc2 to-acc" />

            {/* Corner Sci-Fi Brackets */}
            <div className="pointer-events-none absolute left-2 top-2 w-3 h-3 border-l-2 border-t-2 border-acc/50" />
            <div className="pointer-events-none absolute right-2 bottom-2 w-3 h-3 border-r-2 border-b-2 border-acc/50" />

            <div className="grid lg:grid-cols-[1.1fr_1fr] gap-6 sm:gap-8 items-center">
              {/* Left: Browser Frame Mockup */}
              <div className="space-y-3">
                <div className="hud !rounded-xl overflow-hidden border border-white/10 bg-[#020515]/90 shadow-2xl">
                  {/* Browser window top bar */}
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 bg-white/[0.03]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <div className="mx-auto font-mono text-[11px] text-slate-400 truncate max-w-[220px] sm:max-w-[280px]">
                      {flagship.liveUrl || `https://${flagship.slug}.vercel.app`}
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-auto" />
                  </div>

                  {/* Screenshot with interactive hover zoom */}
                  <Link
                    href={`/projects/${flagship.slug}`}
                    className="relative block aspect-[16/10] overflow-hidden group cursor-pointer"
                  >
                    {flagship.thumbnailUrl ? (
                      <Image
                        src={flagship.thumbnailUrl}
                        alt={flagship.title}
                        width={960}
                        height={600}
                        priority
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full grid place-items-center bg-white/[0.02]">
                        <span className="font-mono text-3xl text-acc/30">{"</>"}</span>
                      </div>
                    )}
                    {/* Hover sheen */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <span className="btn-primary inline-flex items-center gap-2 text-xs py-2 px-4 rounded-xl">
                        Open Full Case File <ArrowRight size={13} />
                      </span>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Right: Flagship Dossier Details */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                  <span className="text-acc font-semibold uppercase tracking-wider">
                    // case_file: 01 · {flagship.category}
                  </span>
                  <StatusBadge status="Live" />
                </div>

                <div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    <Link
                      href={`/projects/${flagship.slug}`}
                      className="hover:text-grad transition-colors"
                    >
                      {flagship.title}
                    </Link>
                  </h3>
                  <div className="font-mono text-xs text-acc/80 mt-1 flex items-center gap-1.5">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    Flagship Full-Stack Production System
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-slate-300">
                  {flagship.description || flagship.shortDescription}
                </p>

                {/* Architecture Highlights */}
                {flagship.features && flagship.features.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {flagship.features.slice(0, 3).map((feat) => (
                      <div key={feat} className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="text-acc font-mono font-bold mt-0.5">+</span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tech Stack Chips with Brand Logos */}
                <div className="space-y-1.5 pt-1">
                  <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
                    {"// tech architecture"}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {flagship.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="font-mono text-[11px] px-2.5 py-1 rounded bg-acc/10 text-acc border border-acc/25 inline-flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <SkillIcon name={tech} className="w-3.5 h-3.5 text-current shrink-0" size={13} />
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Primary CTA Deck */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Link
                    href={`/projects/${flagship.slug}`}
                    className="btn-primary inline-flex items-center gap-2 text-xs py-2.5 px-5 rounded-xl font-bold cursor-pointer"
                  >
                    <span>Inspect Case Study</span>
                    <ArrowRight size={14} />
                  </Link>

                  {flagship.liveUrl && (
                    <a
                      href={flagship.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost inline-flex items-center gap-1.5 text-xs py-2 px-4 rounded-xl font-mono text-slate-300 hover:text-white"
                    >
                      <span>Live Site</span>
                      <ExternalLink size={13} />
                    </a>
                  )}

                  {flagship.sourceUrl && (
                    <a
                      href={flagship.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-slate-400 hover:border-acc/60 hover:text-acc transition-colors"
                      title="View GitHub Repository"
                      aria-label="GitHub Repository"
                    >
                      <Github size={15} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Fleet Grid (Remaining Featured Projects) */}
          {fleet.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4 font-mono text-xs uppercase tracking-widest text-slate-400">
                <Terminal size={12} className="text-acc" />
                <span>{"// companion production fleet (" + fleet.length + ")"}</span>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {fleet.map((project, pos) => (
                  <Tilt key={project._id} className="rise">
                    <article
                      style={{ animationDelay: `${pos * 60}ms` }}
                      className="hud hud-hover group relative flex flex-col overflow-hidden h-full rounded-xl border border-white/10 hover:border-acc/40 transition-all"
                    >
                      {/* Browser Thumbnail Frame */}
                      <Link
                        href={`/projects/${project.slug}`}
                        className="relative block overflow-hidden border-b border-white/10 bg-[#030617]"
                        aria-label={project.title}
                      >
                        {/* Mini browser top bar */}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-white/5 bg-white/[0.02]">
                          <span className="w-2 h-2 rounded-full bg-white/20" />
                          <span className="w-2 h-2 rounded-full bg-white/20" />
                          <span className="w-2 h-2 rounded-full bg-white/20" />
                          <span className="ml-auto font-mono text-[9px] text-slate-500 uppercase">
                            case:0{pos + 2}
                          </span>
                        </div>

                        {project.thumbnailUrl ? (
                          <Image
                            src={project.thumbnailUrl}
                            alt={`${project.title} preview`}
                            width={800}
                            height={480}
                            className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="grid aspect-[16/10] w-full place-items-center bg-white/3">
                            <span className="text-3xl text-acc/20 font-mono">{"</>"}</span>
                          </div>
                        )}

                        {/* Category & Status Badges */}
                        <span className="absolute left-3 top-8 rounded-full border border-white/10 bg-black/70 px-2 py-0.5 font-mono text-[9.5px] text-acc backdrop-blur">
                          {project.category}
                        </span>
                        <span className="absolute right-3 top-8">
                          <StatusBadge status="live" />
                        </span>
                      </Link>

                      {/* Body */}
                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-base font-bold text-white transition-colors group-hover:text-grad">
                            <Link href={`/projects/${project.slug}`}>{project.title}</Link>
                          </h3>
                        </div>

                        <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-slate-400">
                          {project.shortDescription}
                        </p>

                        {/* Tech Chips with Brand Logos */}
                        <div className="mt-3.5 flex flex-wrap gap-1.5">
                          {project.techStack.slice(0, 4).map((tech) => (
                            <span
                              key={tech}
                              className="font-mono text-[10px] px-2 py-0.5 rounded bg-acc/10 text-acc border border-acc/20 inline-flex items-center gap-1"
                            >
                              <SkillIcon name={tech} className="w-3 h-3 text-current shrink-0" size={11} />
                              {tech}
                            </span>
                          ))}
                          {project.techStack.length > 4 && (
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-white/10 text-slate-500">
                              +{project.techStack.length - 4}
                            </span>
                          )}
                        </div>

                        {/* Card Footer */}
                        <div className="mt-auto flex items-center justify-between gap-2 pt-4 border-t border-white/5 mt-4">
                          <Link
                            href={`/projects/${project.slug}`}
                            className="font-mono inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-acc hover:text-white transition-colors font-semibold"
                          >
                            Case Study <ArrowRight size={12} />
                          </Link>
                          <div className="flex items-center gap-1.5">
                            {project.liveUrl && (
                              <a
                                href={project.liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${project.title} live`}
                                className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-slate-400 hover:border-acc hover:text-acc transition-colors"
                              >
                                <ExternalLink size={13} />
                              </a>
                            )}
                            {project.sourceUrl && (
                              <a
                                href={project.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${project.title} source`}
                                className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-slate-400 hover:border-acc hover:text-acc transition-colors"
                              >
                                <Github size={13} />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  </Tilt>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ── MATRIX VIEW MODE (3-COLUMN CYBER GRID) ─────────────────────── */
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project, pos) => (
            <Tilt key={project._id} className="rise">
              <article
                style={{ animationDelay: `${pos * 50}ms` }}
                className="hud hud-hover group relative flex flex-col overflow-hidden h-full rounded-2xl border border-white/10 hover:border-acc/40 transition-all"
              >
                {/* Browser Frame */}
                <Link
                  href={`/projects/${project.slug}`}
                  className="relative block overflow-hidden border-b border-white/10 bg-[#030617]"
                  aria-label={project.title}
                >
                  <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-white/5 bg-white/[0.02]">
                    <span className="w-2 h-2 rounded-full bg-white/20" />
                    <span className="w-2 h-2 rounded-full bg-white/20" />
                    <span className="w-2 h-2 rounded-full bg-white/20" />
                    <span className="ml-auto font-mono text-[9px] text-slate-500 uppercase">
                      SYS_PROJ:0{pos + 1}
                    </span>
                  </div>

                  {project.thumbnailUrl ? (
                    <Image
                      src={project.thumbnailUrl}
                      alt={`${project.title} preview`}
                      width={800}
                      height={480}
                      className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="grid aspect-[16/10] w-full place-items-center bg-white/3">
                      <span className="text-3xl text-acc/20 font-mono">{"</>"}</span>
                    </div>
                  )}

                  <span className="absolute left-3 top-8 rounded-full border border-white/10 bg-black/70 px-2 py-0.5 font-mono text-[9.5px] text-acc backdrop-blur">
                    {project.category}
                  </span>
                  <span className="absolute right-3 top-8">
                    <StatusBadge status="live" />
                  </span>
                </Link>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-bold text-white transition-colors group-hover:text-grad">
                      <Link href={`/projects/${project.slug}`}>{project.title}</Link>
                    </h3>
                  </div>

                  <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-slate-400">
                    {project.shortDescription}
                  </p>

                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="font-mono text-[10px] px-2 py-0.5 rounded bg-acc/10 text-acc border border-acc/20 inline-flex items-center gap-1"
                      >
                        <SkillIcon name={tech} className="w-3 h-3 text-current shrink-0" size={11} />
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-2 pt-4 border-t border-white/5 mt-4">
                    <Link
                      href={`/projects/${project.slug}`}
                      className="font-mono inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-acc hover:text-white transition-colors font-semibold"
                    >
                      Case Study <ArrowRight size={12} />
                    </Link>
                    <div className="flex items-center gap-1.5">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${project.title} live`}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-slate-400 hover:border-acc hover:text-acc transition-colors"
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}
                      {project.sourceUrl && (
                        <a
                          href={project.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${project.title} source`}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-slate-400 hover:border-acc hover:text-acc transition-colors"
                        >
                          <Github size={13} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            </Tilt>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="hud p-16 text-center text-slate-500 font-mono text-sm mt-4">
          <Terminal size={24} className="mx-auto mb-2 text-slate-600" />
          {`$ find ./featured -name "${query}" → 0 results found.`}
        </div>
      )}

      {/* View All Projects Footer Callout */}
      {typeof total === "number" && total > projects.length && (
        <div className="mt-10 text-center">
          <a
            href="#showcase"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("showcase")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="btn-ghost rounded-full px-6 py-2.5 text-xs font-mono font-semibold inline-flex items-center gap-2"
          >
            <span>Explore All {total} System Deployments</span>
            <ArrowRight size={13} />
          </a>
        </div>
      )}
    </section>
  );
}
