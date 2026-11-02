import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site/site-shell";
import { ProjectDetailView } from "@/components/site/project-detail-view";
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

  return (
    <SiteShell>
      <ProjectDetailView project={project} related={related} />
    </SiteShell>
  );
}
