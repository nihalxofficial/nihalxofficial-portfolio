import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { SiteShell } from "@/components/site/site-shell";
import { getPost } from "@/lib/api";
import { absoluteUrl, formatDate, paragraphs } from "@/lib/utils";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPost(slug);
  if (!data) return { title: "Post not found" };

  const { post } = data;
  const title = post.seo?.title || post.title;
  const description = post.seo?.description || post.excerpt;

  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/blog/${post.slug}`,
      publishedTime: post.publishedAt,
      images: post.coverImageUrl
        ? [{ url: absoluteUrl(post.coverImageUrl), alt: post.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.coverImageUrl ? [absoluteUrl(post.coverImageUrl)] : undefined,
    },
  };
}

/** Minimal block renderer: headings, lists, quotes, code fences and paragraphs. */
function renderContent(content: string) {
  const blocks = paragraphs(content);

  return blocks.map((block, position) => {
    if (block.startsWith("```")) {
      const body = block.replace(/^```[^\n]*\n?/, "").replace(/```$/, "");
      return (
        <pre key={position} className="mono text-[12px]">
          <code>{body.trim()}</code>
        </pre>
      );
    }

    if (block.startsWith("### ")) {
      return <h3 key={position}>{block.slice(4)}</h3>;
    }

    if (block.startsWith("## ")) {
      return <h2 key={position}>{block.slice(3)}</h2>;
    }

    if (block.startsWith("> ")) {
      return (
        <blockquote
          key={position}
          className="my-4 rounded-r-lg border-l-2 border-accent/60 bg-surface-2/60 px-4 py-3 text-[13px] italic text-muted"
        >
          {block.replace(/^>\s?/gm, "")}
        </blockquote>
      );
    }

    if (/^[-*]\s/m.test(block)) {
      const items = block
        .split("\n")
        .map((line) => line.replace(/^[-*]\s+/, "").trim())
        .filter(Boolean);

      return (
        <ul key={position}>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    }

    return <p key={position}>{block}</p>;
  });
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const data = await getPost(slug);
  if (!data) notFound();

  const { post, related } = data;

  return (
    <SiteShell>
      <article className="container-page">
        <Link
          href="/#blog"
          className="mono inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-muted transition-colors hover:text-accent"
        >
          <Icon name="ArrowLeft" className="h-3.5 w-3.5" />
          All posts
        </Link>

        <header className="mt-6 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-faint">
            <span className="mono uppercase tracking-[0.16em] text-accent">
              {post.category || "Note"}
            </span>
            <span aria-hidden>·</span>
            <span>{formatDate(post.publishedAt)}</span>
            {post.readingTime ? (
              <>
                <span aria-hidden>·</span>
                <span>{post.readingTime}</span>
              </>
            ) : null}
          </div>

          <h1 className="mt-3 text-3xl font-semibold leading-tight text-ink sm:text-[2.5rem]">
            {post.title}
          </h1>

          {post.excerpt ? (
            <p className="mt-4 text-sm leading-relaxed text-muted sm:text-[0.95rem]">
              {post.excerpt}
            </p>
          ) : null}

          {post.tags.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-line px-2 py-0.5 text-[10.5px] text-faint"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
        </header>

        {post.coverImageUrl ? (
          <Image
            src={post.coverImageUrl}
            alt={post.title}
            width={1440}
            height={810}
            priority
            sizes="92vw"
            className="mt-8 w-full rounded-2xl border border-line object-cover"
          />
        ) : null}

        <div className="prose-portfolio mt-10 max-w-3xl">{renderContent(post.content)}</div>

        {related.length > 0 ? (
          <section className="mt-16 max-w-3xl border-t border-line pt-10">
            <h2 className="text-lg font-semibold text-ink">Keep reading</h2>
            <div className="mt-5 space-y-2.5">
              {related.map((item) => (
                <Link
                  key={item._id}
                  href={`/blog/${item.slug}`}
                  className="group flex items-center justify-between gap-4 rounded-xl border border-line bg-surface/40 px-4 py-3 transition-colors hover:border-line-strong"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[13.5px] font-medium text-ink transition-colors group-hover:text-accent">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-faint">
                      {formatDate(item.publishedAt)}
                    </span>
                  </span>
                  <Icon
                    name="ArrowRight"
                    className="h-4 w-4 shrink-0 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
                  />
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </SiteShell>
  );
}
