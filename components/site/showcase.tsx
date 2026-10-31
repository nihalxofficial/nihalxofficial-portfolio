"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Project, SectionMeta } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Showcase — the featured project switcher from the reference:
 * a vertical list of projects on the left, a large live preview on the right.
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
  const [activeSlug, setActiveSlug] = useState(projects[0]?.slug ?? "");
  const active = projects.find((project) => project.slug === activeSlug) ?? projects[0];

  if (!active) return null;

  return (
    <section id="showcase" className="relative section-pad">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px rule-grad" />

      <div className="container-page">
        <Reveal>
          <SectionHeading
            index={index}
            label={section?.label || "Showcase"}
            title={section?.heading || "Project Showcase"}
            description={
              section?.description ||
              "Pick a project on the left to preview the interface — every one is deployed and clickable."
            }
          />
        </Reveal>

        <div className="mt-10 grid gap-5 lg:grid-cols-[0.62fr_1fr]">
          {/* Project list */}
          <Reveal>
            <div className="panel h-full overflow-hidden p-2">
              <ul className="scrollbar-none flex gap-1.5 overflow-x-auto lg:max-h-[30rem] lg:flex-col lg:overflow-y-auto">
                {projects.map((project, position) => {
                  const isActive = project.slug === active.slug;
                  return (
                    <li key={project._id} className="shrink-0 lg:w-full">
                      <button
                        type="button"
                        onClick={() => setActiveSlug(project.slug)}
                        aria-current={isActive ? "true" : undefined}
                        className={cn(
                          "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                          isActive
                            ? "bg-accent/10 text-ink"
                            : "text-muted hover:bg-surface-2 hover:text-ink",
                        )}
                      >
                        <span
                          className={cn(
                            "mono w-5 shrink-0 text-[10px]",
                            isActive ? "text-accent" : "text-faint",
                          )}
                        >
                          {String(position + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              "block truncate text-[13px] font-medium",
                              isActive && "text-accent",
                            )}
                          >
                            {project.title}
                          </span>
                          <span className="mt-0.5 hidden truncate text-[10.5px] text-faint sm:block">
                            {project.category}
                          </span>
                        </span>
                        <Icon
                          name="ChevronRight"
                          className={cn(
                            "h-3.5 w-3.5 shrink-0 transition-transform",
                            isActive ? "translate-x-0.5 text-accent" : "text-faint",
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
          <Reveal delay={90}>
            <div className="panel overflow-hidden">
              <div className="flex items-center gap-1.5 border-b border-line px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
                <span className="mono ml-2 truncate text-[10.5px] text-faint">
                  {active.liveUrl ? new URL(active.liveUrl).host : `${active.slug}.local`}
                </span>
              </div>

              <div className="relative bg-surface-2">
                <Image
                  key={active.slug}
                  src={active.thumbnailUrl || "/preview.png"}
                  alt={`${active.title} screenshot`}
                  width={1280}
                  height={800}
                  sizes="(max-width: 1024px) 92vw, 56vw"
                  className="aspect-[16/10] w-full animate-[fade-in_0.4s_ease] object-cover object-top"
                />
              </div>

              <div className="p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-ink">{active.title}</h3>
                  {active.liveUrl ? (
                    <a
                      href={active.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open ${active.title}`}
                      className="text-accent transition-transform hover:-translate-y-0.5"
                    >
                      <Icon name="ArrowUpRight" className="h-4 w-4" />
                    </a>
                  ) : null}
                  <span className="mono ml-auto rounded-md border border-line px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-faint">
                    {active.category}
                  </span>
                </div>

                <p className="mt-2.5 text-[13px] leading-relaxed text-muted">
                  {active.shortDescription}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {active.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-md border border-line bg-accent/5 px-2 py-0.5 text-[10.5px] text-accent/90"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {active.liveUrl ? (
                    <a
                      href={active.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg grad-accent px-4 py-2.5 text-[12.5px] font-semibold text-accent-ink transition-transform hover:-translate-y-0.5"
                    >
                      Live Site
                      <Icon name="ArrowUpRight" className="h-3.5 w-3.5" />
                    </a>
                  ) : null}
                  {active.sourceUrl ? (
                    <a
                      href={active.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-line-strong px-4 py-2.5 text-[12.5px] font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
                    >
                      <Icon name="Github" className="h-3.5 w-3.5" />
                      Source Code
                    </a>
                  ) : null}
                  <Link
                    href={`/projects/${active.slug}`}
                    className="mono ml-auto inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-muted transition-colors hover:text-accent"
                  >
                    Case study
                    <Icon name="ArrowRight" className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
