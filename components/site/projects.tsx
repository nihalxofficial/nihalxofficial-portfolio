"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink, Github } from "lucide-react";
import type { Project, SectionMeta } from "@/lib/types";

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

  return (
    <section id="projects" className="relative py-12">
      {/* ViewHeader */}
      <p className="eyebrow mb-2 font-mono text-xs text-acc">{"// my projects"}</p>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <h2 className="text-3xl font-bold">
          Featured <span className="text-grad">Projects</span>
        </h2>
        <span className="chip">
          {projects.length} featured
          {typeof total === "number" && total !== projects.length && (
            <span className="text-slate-500"> · {total} total</span>
          )}
        </span>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, pos) => (
          <article
            key={project._id}
            style={{ animationDelay: `${pos * 60}ms` }}
            className="rise hud hud-hover group relative flex flex-col overflow-hidden transition-transform hover:-translate-y-1"
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
                  className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              ) : (
                <div className="grid aspect-[16/10] w-full place-items-center bg-white/3">
                  <span className="text-4xl text-acc/20">{"</>"}</span>
                </div>
              )}
              {/* Hover overlay */}
              <span className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 font-mono text-xs text-acc opacity-0 group-hover:opacity-100 transition-opacity">
                Open case file <ArrowRight size={13} />
              </span>
              {/* Category */}
              <span className="absolute left-3 top-3 rounded-md border border-white/10 bg-black/60 px-2 py-0.5 font-mono text-[10px] text-acc backdrop-blur">
                {project.category}
              </span>
              {/* Status */}
              {project.isPublished && (
                <span className="absolute right-3 top-3">
                  <StatusBadge status={project.isPublished ? "live" : "shipped"} />
                </span>
              )}
            </Link>

            {/* Body */}
            <div className="flex flex-1 flex-col p-5">
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
              <div className="mt-4 flex flex-wrap gap-1.5">
                {project.techStack.slice(0, 4).map((tech) => (
                  <span key={tech} className="chip !text-[10px] !py-0.5 !px-2">
                    {tech}
                  </span>
                ))}
                {project.techStack.length > 4 && (
                  <span className="chip !text-[10px] !py-0.5 !px-2 !text-slate-500">
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
        ))}
      </div>

      {/* View all link */}
      {typeof total === "number" && total > projects.length && (
        <div className="mt-8 text-center">
          <a href="#showcase" onClick={(e) => { e.preventDefault(); document.getElementById("showcase")?.scrollIntoView({ behavior: "smooth" }); }}
            className="btn-ghost rounded-full px-6 py-2.5 text-sm font-semibold inline-flex items-center gap-2"
          >
            View all {total} projects <ArrowRight size={14} />
          </a>
        </div>
      )}
    </section>
  );
}
