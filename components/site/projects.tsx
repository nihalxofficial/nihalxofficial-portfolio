import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Project, SectionMeta } from "@/lib/types";

/** Projects — full grid of published work; each card opens the detail page. */
export function Projects({
  projects,
  section,
  index,
}: {
  projects: Project[];
  section?: SectionMeta;
  index: number;
}) {
  if (projects.length === 0) return null;

  return (
    <section id="projects" className="relative section-pad">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px rule-grad" />

      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <SectionHeading
              index={index}
              label={section?.label || "Projects"}
              title={section?.heading || "Featured Projects"}
              description={
                section?.description ||
                "Full-stack builds where the product, the API and the database all live in one repository."
              }
            />
          </Reveal>

          <Reveal delay={80}>
            <span className="mono rounded-full border border-line bg-surface/60 px-3 py-1.5 text-[11px] text-muted">
              {projects.length} projects
            </span>
          </Reveal>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, position) => (
            <Reveal key={project._id} delay={position * 50}>
              <article className="panel panel-hover group relative flex h-full flex-col overflow-hidden">
                <Link
                  href={`/projects/${project.slug}`}
                  className="relative block overflow-hidden border-b border-line bg-surface-2"
                  aria-label={project.title}
                >
                  {project.thumbnailUrl ? (
                    <Image
                      src={project.thumbnailUrl}
                      alt={`${project.title} preview`}
                      width={900}
                      height={560}
                      sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw"
                      className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="grid aspect-[16/10] w-full place-items-center bg-surface-2">
                      <Icon name="FolderCode" className="h-9 w-9 text-accent/30" />
                    </div>
                  )}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-page/85 via-page/10 to-transparent opacity-70"
                  />
                  <span className="absolute left-3 top-3 rounded-md border border-line bg-page/70 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-accent backdrop-blur">
                    {project.category}
                  </span>
                </Link>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-[15px] font-semibold text-ink transition-colors group-hover:text-accent">
                      <Link href={`/projects/${project.slug}`}>{project.title}</Link>
                    </h3>
                    <span className="mono text-[10px] text-faint">
                      {String(position + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-muted">
                    {project.shortDescription}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {project.techStack.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="rounded-md border border-line bg-accent/5 px-2 py-0.5 text-[10.5px] text-accent/90"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.techStack.length > 4 ? (
                      <span className="rounded-md border border-line px-2 py-0.5 text-[10.5px] text-faint">
                        +{project.techStack.length - 4}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-2 pt-5">
                    <Link
                      href={`/projects/${project.slug}`}
                      className="mono inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-muted transition-colors hover:text-accent"
                    >
                      Case study
                      <Icon name="ArrowRight" className="h-3.5 w-3.5" />
                    </Link>

                    <div className="flex items-center gap-1">
                      {project.liveUrl ? (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${project.title} live site`}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-line-strong hover:text-accent"
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
                          className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-line-strong hover:text-accent"
                        >
                          <Icon name="Github" className="h-3.5 w-3.5" />
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
