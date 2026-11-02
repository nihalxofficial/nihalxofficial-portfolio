"use client";
import { useRef, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink, Github, Search } from "lucide-react";
import type { Project, SectionMeta } from "@/lib/types";

/* ── 3-D tilt card wrapper ─────────────────────────────────────────────── */
function Tilt({ children, className = "" }: { children: React.ReactNode; className?: string }) {
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
    <div ref={ref} onMouseMove={move} onMouseLeave={leave} className={`transition-transform duration-200 ${className}`}>
      {children}
    </div>
  );
}

/* ── Status badge ─────────────────────────────────────────────────────── */
function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  const lower = status.toLowerCase();
  const cfg =
    lower.includes("live") || lower.includes("published")
      ? { cls: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10", label: "Live" }
      : lower.includes("progress")
      ? { cls: "text-amber-400 border-amber-400/30 bg-amber-400/10", label: "In Progress" }
      : { cls: "text-sky-400 border-sky-400/30 bg-sky-400/10", label: "Shipped" };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[10px] ${cfg.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  );
}

/* ── Main component ───────────────────────────────────────────────────── */
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
  if (projects.length === 0) return null;

  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return projects;
    const q = query.toLowerCase();
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.techStack.some((t) => t.toLowerCase().includes(q))
    );
  }, [projects, query]);

  return (
    <section id="projects" className="relative py-12">
      {/* ViewHeader */}
      <p className="eyebrow mb-2 font-mono text-xs text-acc">{"// my projects"}</p>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold">
            Featured <span className="text-grad">Projects</span>
          </h2>
          {section?.description && (
            <p className="text-sm text-slate-400 mt-2 max-w-xl">{section.description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 hud !rounded-lg px-3 py-2 w-52">
            <Search size={14} className="text-slate-500 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="search name or tech…"
              className="bg-transparent outline-none text-sm w-full placeholder:text-slate-600"
            />
          </div>
          <span className="chip !cursor-default">
            {filtered.length} featured
            {typeof total === "number" && total !== projects.length && (
              <span className="text-slate-500"> · {total} total</span>
            )}
          </span>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((project, pos) => (
          <Tilt key={project._id} className="rise" >
            <article
              style={{ animationDelay: `${pos * 60}ms` }}
              className="hud hud-hover group relative flex flex-col overflow-hidden h-full"
            >
              {/* Thumbnail */}
              <Link
                href={`/projects/${project.slug}`}
                className="relative block overflow-hidden border-b border-white/5"
                aria-label={project.title}
              >
                {project.thumbnailUrl ? (
                  <Image
                    src={project.thumbnailUrl}
                    alt={`${project.title} preview`}
                    width={900}
                    height={560}
                    sizes="(max-width:640px) 92vw, (max-width:1024px) 46vw, 30vw"
                    className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                  />
                ) : (
                  <div className="grid aspect-[16/10] w-full place-items-center bg-white/3">
                    <span className="text-4xl text-acc/20">{"</>"}</span>
                  </div>
                )}
                {/* Hover overlay */}
                <span className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 font-mono text-xs text-acc opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="btn-primary rounded-full px-5 py-2 text-sm flex items-center gap-2">
                    Open case file <ArrowRight size={14} />
                  </span>
                </span>
                {/* Status badge */}
                <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/60 px-2 py-0.5 font-mono text-[10px] text-acc backdrop-blur">
                  {project.category}
                </span>
                {project.isPublished && (
                  <span className="absolute right-3 top-3">
                    <StatusBadge status="live" />
                  </span>
                )}
              </Link>

              {/* Body */}
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-[15px] font-semibold transition-colors group-hover:text-acc">
                    <Link href={`/projects/${project.slug}`}>{project.title}</Link>
                  </h3>
                  <span className="font-mono text-[10px] text-slate-600">
                    {String(pos + 1).padStart(2, "0")}
                  </span>
                </div>

                <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-slate-400">
                  {project.shortDescription}
                </p>

                {/* Tech chips */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {project.techStack.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="font-mono text-[10px] px-2 py-0.5 rounded bg-acc/10 text-acc border border-acc/20"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.techStack.length > 4 && (
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-white/10 text-slate-500">
                      +{project.techStack.length - 4}
                    </span>
                  )}
                </div>

                {/* Footer links */}
                <div className="mt-auto flex items-center justify-between gap-2 pt-4 border-t border-white/5 mt-4">
                  <Link
                    href={`/projects/${project.slug}`}
                    className="font-mono inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-slate-400 hover:text-acc transition-colors"
                  >
                    Case study <ArrowRight size={12} />
                  </Link>
                  <div className="flex items-center gap-1">
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${project.title} live`}
                        className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-slate-400 hover:border-acc/60 hover:text-acc transition-colors"
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
                        className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-slate-400 hover:border-acc/60 hover:text-acc transition-colors"
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
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-20 font-mono text-slate-500">
            {`$ find ./projects -name "${query}" → 0 results`}
          </div>
        )}
      </div>

      {/* View all link */}
      {typeof total === "number" && total > projects.length && (
        <div className="mt-8 text-center">
          <a
            href="#showcase"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("showcase")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="btn-ghost rounded-full px-6 py-2.5 text-sm font-semibold inline-flex items-center gap-2"
          >
            View all {total} projects <ArrowRight size={14} />
          </a>
        </div>
      )}
    </section>
  );
}
