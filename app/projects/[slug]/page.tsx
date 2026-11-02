import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, ExternalLink, Github, Check, FolderCode } from "lucide-react";
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
    { label: "Category", value: project.category },
    { label: "Stack", value: `${project.techStack.length} tech` },
    { label: "Featured", value: project.isFeatured ? "Yes" : "No" },
    { label: "Status", value: project.isPublished ? "Live" : "Shipped" },
  ].filter((f) => Boolean(f.value));

  return (
    <SiteShell>
      <article className="container-page py-8">
        {/* Back link */}
        <Link
          href="/#projects"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400 transition-colors hover:text-acc"
        >
          <ArrowLeft size={13} />
          All projects
        </Link>

        {/* Hero header */}
        <header className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-acc">
              {project.category}
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-[2.6rem]">
              {project.title}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-[0.95rem]">
              {project.description || project.shortDescription}
            </p>

            {/* Tech chips */}
            <div className="mt-6 flex flex-wrap gap-1.5">
              {project.techStack.map((tech) => (
                <span key={tech} className="chip">
                  {tech}
                </span>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm"
                >
                  Live site
                  <ArrowUpRight size={15} />
                </a>
              )}
              {project.sourceUrl && (
                <a
                  href={project.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm"
                >
                  <Github size={15} />
                  Source code
                </a>
              )}
            </div>
          </div>

          {/* Browser-chrome preview */}
          <Reveal>
            <div className="hud overflow-hidden">
              <div className="flex items-center gap-1.5 border-b border-white/5 px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                <span className="font-mono ml-auto truncate text-[10px] text-slate-500">
                  {project.liveUrl
                    ? (() => { try { return new URL(project.liveUrl).host; } catch { return project.slug; } })()
                    : project.slug}
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
                <div className="grid aspect-[16/10] place-items-center bg-[#060b14]">
                  <FolderCode size={40} className="text-acc/30" />
                </div>
              )}
            </div>
          </Reveal>
        </header>

        {/* Stats bar */}
        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-white/8 bg-white/5 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.label} className="bg-[#060b14]/80 px-5 py-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">{fact.label}</p>
              <p className="mt-1.5 text-[13px] font-medium text-white">{fact.value}</p>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="mt-12 grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-8">
            {project.features.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-white">Key features</h2>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {project.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 rounded-xl border border-white/8 bg-white/3 px-3.5 py-2.5 text-[12.5px] leading-snug text-slate-400"
                    >
                      <Check size={13} className="mt-0.5 shrink-0 text-acc" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {project.challenges && (
              <section>
                <h2 className="text-lg font-semibold text-white">Challenges</h2>
                <p className="mt-3 text-[13px] leading-relaxed text-slate-400">{project.challenges}</p>
              </section>
            )}

            {project.improvements && (
              <section>
                <h2 className="text-lg font-semibold text-white">Future improvements</h2>
                <p className="mt-3 text-[13px] leading-relaxed text-slate-400">{project.improvements}</p>
              </section>
            )}
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
                  className="w-full rounded-2xl border border-white/8 object-cover"
                />
              ))}
            </div>
          ) : (
            <aside className="hud h-max p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-acc">Overview</p>
              <p className="mt-3 text-[13px] leading-relaxed text-slate-400">{project.shortDescription}</p>
              <div className="mt-5 space-y-2 border-t border-white/5 pt-4">
                <p className="flex items-center justify-between gap-3 text-[12px] text-slate-400">
                  <span>Category</span>
                  <span className="text-white">{project.category}</span>
                </p>
                <p className="flex items-center justify-between gap-3 text-[12px] text-slate-400">
                  <span>Technologies</span>
                  <span className="text-white">{project.techStack.length}</span>
                </p>
                <p className="flex items-center justify-between gap-3 text-[12px] text-slate-400">
                  <span>Features</span>
                  <span className="text-white">{project.features.length}</span>
                </p>
              </div>
            </aside>
          )}
        </div>

        {/* Related projects */}
        {related.length > 0 && (
          <section className="mt-16 border-t border-white/5 pt-10">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-lg font-semibold text-white">More projects</h2>
              <Link
                href="/#projects"
                className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400 transition-colors hover:text-acc"
              >
                View all
              </Link>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item._id}
                  href={`/projects/${item.slug}`}
                  className="hud hud-hover group overflow-hidden"
                >
                  {item.thumbnailUrl && (
                    <Image
                      src={item.thumbnailUrl}
                      alt={`${item.title} preview`}
                      width={720}
                      height={450}
                      sizes="(max-width: 640px) 92vw, 30vw"
                      className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  )}
                  <div className="p-4">
                    <p className="text-[13.5px] font-medium text-white transition-colors group-hover:text-acc">
                      {item.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-slate-400">
                      {item.shortDescription}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </SiteShell>
  );
}
