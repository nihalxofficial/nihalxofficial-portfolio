import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { SiteShell } from "@/components/site/site-shell";
import { getProject } from "@/lib/api";
import { absoluteUrl } from "@/lib/utils";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProject(slug);
  if (!data) return { title: "Project not found" };

  const { project } = data;
  const title = project.seo?.title || project.title;
  const description = project.seo?.description || project.shortDescription;

  return {
    title,
    description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/projects/${project.slug}`,
      images: project.thumbnailUrl
        ? [{ url: absoluteUrl(project.thumbnailUrl), alt: project.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: project.thumbnailUrl ? [absoluteUrl(project.thumbnailUrl)] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const data = await getProject(slug);
  if (!data) notFound();

  const { project, related } = data;
  const gallery = project.screenshots.filter(Boolean);

  const facts = [
    { icon: "FolderCode", label: "Category", value: project.category },
    { icon: "Code2", label: "Stack", value: `${project.techStack.length} technologies` },
    { icon: "Star", label: "Featured", value: project.isFeatured ? "Yes" : "No" },
    { icon: "CircleDot", label: "Status", value: "Live" },
  ].filter((fact) => Boolean(fact.value));

  return (
    <SiteShell>
      <article className="container-page">
        <Link
          href="/#projects"
          className="mono inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-muted transition-colors hover:text-accent"
        >
          <Icon name="ArrowLeft" className="h-3.5 w-3.5" />
          All projects
        </Link>

        <header className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mono text-[11px] uppercase tracking-[0.22em] text-accent">
              {project.category}
            </p>

            <h1 className="mt-3 text-3xl font-semibold leading-tight text-ink sm:text-[2.6rem]">
              {project.title}
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-[0.95rem]">
              {project.description || project.shortDescription}
            </p>

            <div className="mt-6 flex flex-wrap gap-1.5">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-md border border-line bg-accent/5 px-2.5 py-1 text-[11px] text-accent/90"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              {project.liveUrl ? (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg grad-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition-transform hover:-translate-y-0.5"
                >
                  Live site
                  <Icon name="ArrowUpRight" className="h-4 w-4" />
                </a>
              ) : null}

              {project.sourceUrl ? (
                <a
                  href={project.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-line-strong px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
                >
                  <Icon name="Github" className="h-4 w-4" />
                  Source code
                </a>
              ) : null}
            </div>
          </div>

          <Reveal>
            <div className="overflow-hidden rounded-2xl border border-line bg-surface">
              <div className="flex items-center gap-1.5 border-b border-line px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
                <span className="mono ml-auto truncate text-[10px] text-faint">
                  {project.liveUrl ? new URL(project.liveUrl).host : project.slug}
                </span>
              </div>

              {project.thumbnailUrl ? (
                <Image
                  src={project.thumbnailUrl}
                  alt={`${project.title} screenshot`}
                  width={1280}
                  height={800}
                  priority
                  sizes="(max-width: 1024px) 92vw, 44vw"
                  className="aspect-[16/10] w-full object-cover object-top"
                />
              ) : (
                <div className="grid aspect-[16/10] place-items-center bg-surface-2">
                  <Icon name="FolderCode" className="h-10 w-10 text-accent/30" />
                </div>
              )}
            </div>
          </Reveal>
        </header>

        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.label} className="bg-surface/80 px-4 py-4">
              <p className="mono text-[10px] uppercase tracking-[0.18em] text-faint">{fact.label}</p>
              <p className="mt-1.5 flex items-center gap-2 text-[13px] text-ink">
                <Icon name={fact.icon} className="h-3.5 w-3.5 text-accent" />
                {fact.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-8">
            {project.features.length > 0 ? (
              <section>
                <h2 className="text-lg font-semibold text-ink">Key features</h2>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {project.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 rounded-xl border border-line bg-surface/40 px-3.5 py-2.5 text-[12.5px] leading-snug text-muted"
                    >
                      <Icon name="Check" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {project.challenges ? (
              <section>
                <h2 className="text-lg font-semibold text-ink">Challenges</h2>
                <p className="mt-3 text-[13px] leading-relaxed text-muted">{project.challenges}</p>
              </section>
            ) : null}

            {project.improvements ? (
              <section>
                <h2 className="text-lg font-semibold text-ink">Future improvements</h2>
                <p className="mt-3 text-[13px] leading-relaxed text-muted">
                  {project.improvements}
                </p>
              </section>
            ) : null}
          </div>

          {gallery.length > 0 ? (
            <div className="space-y-4">
              {gallery.map((shot, position) => (
                <Image
                  key={shot}
                  src={shot}
                  alt={`${project.title} screenshot ${position + 1}`}
                  width={1280}
                  height={800}
                  sizes="(max-width: 1024px) 92vw, 44vw"
                  className="w-full rounded-2xl border border-line object-cover"
                />
              ))}
            </div>
          ) : (
            <aside className="panel-alt h-max p-5">
              <p className="mono text-[10px] uppercase tracking-[0.18em] text-accent">Overview</p>
              <p className="mt-3 text-[13px] leading-relaxed text-muted">
                {project.shortDescription}
              </p>
              <div className="mt-5 space-y-2 border-t border-line pt-4">
                <p className="flex items-center justify-between gap-3 text-[12px] text-muted">
                  <span>Category</span>
                  <span className="text-ink">{project.category}</span>
                </p>
                <p className="flex items-center justify-between gap-3 text-[12px] text-muted">
                  <span>Technologies</span>
                  <span className="text-ink">{project.techStack.length}</span>
                </p>
                <p className="flex items-center justify-between gap-3 text-[12px] text-muted">
                  <span>Features</span>
                  <span className="text-ink">{project.features.length}</span>
                </p>
              </div>
            </aside>
          )}
        </div>

        {related.length > 0 ? (
          <section className="mt-16 border-t border-line pt-10">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-lg font-semibold text-ink">More projects</h2>
              <Link
                href="/#projects"
                className="mono text-[11px] uppercase tracking-[0.16em] text-muted transition-colors hover:text-accent"
              >
                View all
              </Link>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item._id}
                  href={`/projects/${item.slug}`}
                  className="panel panel-hover group overflow-hidden"
                >
                  {item.thumbnailUrl ? (
                    <Image
                      src={item.thumbnailUrl}
                      alt={`${item.title} preview`}
                      width={720}
                      height={450}
                      sizes="(max-width: 640px) 92vw, 30vw"
                      className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  ) : null}
                  <div className="p-4">
                    <p className="text-[13.5px] font-medium text-ink transition-colors group-hover:text-accent">
                      {item.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-muted">
                      {item.shortDescription}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </SiteShell>
  );
}
