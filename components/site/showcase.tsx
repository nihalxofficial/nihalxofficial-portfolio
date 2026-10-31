"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Project, SectionMeta } from "@/lib/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 6;
/** The tech row stays scannable: the most-used stacks only. */
const TECH_LIMIT = 8;

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

/** Host label for the browser-chrome strip; falls back to the slug. */
function hostOf(project: Project): string {
  if (!project.liveUrl) return `${project.slug}.local`;
  try {
    return new URL(project.liveUrl).host;
  } catch {
    return `${project.slug}.local`;
  }
}

/**
 * Project Showcase — filters drive both halves: the preview switcher on top
 * and the paginated card grid below. Everything comes from the published
 * projects, so new categories and stacks appear without a code change.
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
  const [page, setPage] = useState(1);
  const [activeSlug, setActiveSlug] = useState("");

  const categories = useMemo(
    () => ["All", ...unique(projects.map((project) => project.category))],
    [projects],
  );

  const technologies = useMemo(() => {
    const counts = new Map<string, number>();
    for (const project of projects) {
      for (const item of project.techStack) {
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
        (project) =>
          (category === "All" || project.category === category) &&
          (tech === "All" || project.techStack.includes(tech)),
      ),
    [projects, category, tech],
  );

  const totalPages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = matches.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const active = matches.find((project) => project.slug === activeSlug) ?? matches[0];
  const filtering = category !== "All" || tech !== "All";

  if (projects.length === 0) return null;

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
              "Filter the shelf by category or stack, preview one on the left and open the rest below."
            }
          />
        </Reveal>

        {/* Filters */}
        <Reveal delay={60}>
          <div className="mt-10 space-y-3">
            <FilterRow
              label="Category"
              options={categories}
              value={category}
              onChange={(next) => {
                setCategory(next);
                setPage(1);
              }}
            />
            <FilterRow
              label="Stack"
              options={technologies}
              value={tech}
              onChange={(next) => {
                setTech(next);
                setPage(1);
              }}
            />
            <div className="mono flex flex-wrap items-center gap-3 text-[11px] text-faint">
              <span>
                {matches.length} of {projects.length} projects
              </span>
              {filtering ? (
                <button
                  type="button"
                  onClick={() => {
                    setCategory("All");
                    setTech("All");
                    setPage(1);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md border border-line px-2 py-1 text-muted transition-colors hover:border-accent/50 hover:text-accent"
                >
                  <Icon name="X" className="h-3 w-3" />
                  clear filters
                </button>
              ) : null}
            </div>
          </div>
        </Reveal>

        {matches.length === 0 ? (
          <div className="panel mt-6 flex flex-col items-center gap-3 px-6 py-12 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-xl border border-line bg-accent/10 text-accent">
              <Icon name="Search" className="h-5 w-5" />
            </span>
            <p className="text-sm font-medium text-ink">Nothing matches those filters yet</p>
            <p className="max-w-sm text-[13px] text-muted">
              Try another category or stack — every published project shows up here once the filter
              is cleared.
            </p>
          </div>
        ) : (
          <>
            {/* Preview switcher */}
            <div className="mt-8 grid gap-5 lg:grid-cols-[0.62fr_1fr]">
              <Reveal>
                <div className="panel h-full overflow-hidden p-2">
                  <ul className="scrollbar-none flex gap-1.5 overflow-x-auto lg:max-h-[30rem] lg:flex-col lg:overflow-y-auto">
                    {matches.map((project, position) => {
                      const isActive = project.slug === active?.slug;
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

              <Reveal delay={90}>{active ? <Preview project={active} /> : null}</Reveal>
            </div>

            {/* Filtered, paginated grid */}
            <motion.div
              layout
              className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
              aria-label="Filtered projects"
            >
              <AnimatePresence mode="popLayout">
                {visible.map((project) => (
                  <motion.div
                    key={project._id}
                    layout
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                  >
                    <ShelfCard
                      project={project}
                      onPreview={() => setActiveSlug(project.slug)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {totalPages > 1 ? (
              <Pager page={safePage} totalPages={totalPages} onChange={setPage} />
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}

/** One row of single-select filter chips. */
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
      <span className="mono w-16 shrink-0 text-[10px] uppercase tracking-[0.18em] text-faint">
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
                ? "border-accent/55 bg-accent/12 text-accent"
                : "text-muted hover:border-line-strong hover:text-ink",
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

/** Compact shelf card; the title opens the case study, the button previews it. */
function ShelfCard({ project, onPreview }: { project: Project; onPreview: () => void }) {
  return (
    <article className="panel panel-hover group relative flex h-full flex-col overflow-hidden">
      <div className="relative border-b border-line bg-surface-2">
        <Image
          src={project.thumbnailUrl || "/preview.png"}
          alt={`${project.title} screenshot`}
          width={800}
          height={500}
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw"
          className="aspect-[16/10] w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <span className="absolute left-3 top-3 rounded-md border border-line bg-page/70 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-accent backdrop-blur">
          {project.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h4 className="text-[14px] font-semibold text-ink transition-colors group-hover:text-accent">
          <Link href={`/projects/${project.slug}`}>{project.title}</Link>
        </h4>
        <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-muted">
          {project.shortDescription}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.techStack.slice(0, 3).map((item) => (
            <span
              key={item}
              className="rounded-md border border-line bg-accent/5 px-1.5 py-0.5 text-[10px] text-accent/90"
            >
              {item}
            </span>
          ))}
          {project.techStack.length > 3 ? (
            <span className="rounded-md border border-line px-1.5 py-0.5 text-[10px] text-faint">
              +{project.techStack.length - 3}
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex items-center gap-2 pt-4">
          <button
            type="button"
            onClick={onPreview}
            className="mono inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-muted transition-colors hover:text-accent"
          >
            <Icon name="Eye" className="h-3.5 w-3.5" />
            preview
          </button>
          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.title} live site`}
              className="ml-auto grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-accent/50 hover:text-accent"
            >
              <Icon name="ExternalLink" className="h-3.5 w-3.5" />
            </a>
          ) : null}
          {project.sourceUrl ? (
            <a
              href={project.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.title} source code`}
              className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-accent/50 hover:text-accent"
            >
              <Icon name="Github" className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

/** Page switcher with a sliding indicator. */
function Pager({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        aria-label="Previous page"
        className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-accent/50 hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Icon name="ArrowLeft" className="h-4 w-4" />
      </button>

      {Array.from({ length: totalPages }, (_, offset) => offset + 1).map((candidate) => {
        const selected = candidate === page;
        return (
          <button
            key={candidate}
            type="button"
            onClick={() => onChange(candidate)}
            aria-current={selected ? "page" : undefined}
            className={cn(
              "mono relative grid h-9 w-9 place-items-center rounded-lg border text-[12px] transition-colors",
              selected
                ? "border-accent/55 text-accent-ink"
                : "border-line text-muted hover:border-line-strong hover:text-ink",
            )}
          >
            {selected ? (
              <motion.span
                layoutId="showcase-page-fill"
                className="absolute inset-0 rounded-lg grad-accent"
                transition={{ duration: 0.25 }}
              />
            ) : null}
            <span className="relative">{candidate}</span>
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        aria-label="Next page"
        className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-accent/50 hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Icon name="ArrowRight" className="h-4 w-4" />
      </button>
    </div>
  );
}

/** Browser-chrome preview of the selected project. */
function Preview({ project }: { project: Project }) {
  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center gap-1.5 border-b border-line px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
        <span className="mono ml-2 truncate text-[10.5px] text-faint">{hostOf(project)}</span>
      </div>

      <div className="relative bg-surface-2">
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
          <h3 className="text-lg font-semibold text-ink">{project.title}</h3>
          <span className="mono rounded-md border border-line px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-faint">
            {project.category}
          </span>
          {project.isFeatured ? (
            <span className="mono inline-flex items-center gap-1 rounded-md bg-accent/12 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-accent">
              <Icon name="Star" className="h-3 w-3" />
              featured
            </span>
          ) : null}
        </div>

        <p className="mt-2.5 text-[13px] leading-relaxed text-muted">{project.shortDescription}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.techStack.map((item) => (
            <span
              key={item}
              className="rounded-md border border-line bg-accent/5 px-2 py-0.5 text-[10.5px] text-accent/90"
            >
              {item}
            </span>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg grad-accent px-4 py-2.5 text-[12.5px] font-semibold text-accent-ink transition-transform hover:-translate-y-0.5"
            >
              Live Site
              <Icon name="ArrowUpRight" className="h-3.5 w-3.5" />
            </a>
          ) : null}
          {project.sourceUrl ? (
            <a
              href={project.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-line-strong px-4 py-2.5 text-[12.5px] font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
            >
              <Icon name="Github" className="h-3.5 w-3.5" />
              Source Code
            </a>
          ) : null}
          <Link
            href={`/projects/${project.slug}`}
            className="mono ml-auto inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-muted transition-colors hover:text-accent"
          >
            Case study
            <Icon name="ArrowRight" className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
