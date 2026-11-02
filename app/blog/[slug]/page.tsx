import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
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
        <pre key={position} className="font-mono text-[12px] overflow-x-auto rounded-xl border border-white/8 bg-[#060b14] p-4 text-acc/80">
          <code>{body.trim()}</code>
        </pre>
      );
    }

    if (block.startsWith("### ")) {
      return <h3 key={position} className="text-[1.1rem] font-semibold text-white mt-6 mb-2">{block.slice(4)}</h3>;
    }

    if (block.startsWith("## ")) {
      return <h2 key={position} className="text-[1.3rem] font-bold text-white mt-8 mb-3">{block.slice(3)}</h2>;
    }

    if (block.startsWith("> ")) {
      return (
        <blockquote
          key={position}
          className="my-4 rounded-r-lg border-l-2 border-acc/60 bg-acc/5 px-4 py-3 text-[13px] italic text-slate-300"
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
        <ul key={position} className="my-4 space-y-1.5 pl-4">
          {items.map((item) => (
            <li key={item} className="list-disc text-[13px] text-slate-300">{item}</li>
          ))}
        </ul>
      );
    }

    return <p key={position} className="text-[13.5px] leading-relaxed text-slate-300">{block}</p>;
  });
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const data = await getPost(slug);
  if (!data) notFound();

  const { post, related } = data;

  return (
    <SiteShell>
      <article className="container-page py-8">
        {/* Back link */}
        <Link
          href="/#blog"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400 transition-colors hover:text-acc"
        >
          <ArrowLeft size={13} />
          All posts
        </Link>

        {/* Header */}
        <header className="mt-6 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
            <span className="font-mono uppercase tracking-[0.16em] text-acc">
              {post.category || "Note"}
            </span>
            <span aria-hidden>·</span>
            <span>{formatDate(post.publishedAt)}</span>
            {post.readingTime && (
              <>
                <span aria-hidden>·</span>
                <span>{post.readingTime}</span>
              </>
            )}
          </div>

          <h1 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-[2.5rem]">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mt-4 text-sm leading-relaxed text-slate-400 sm:text-[0.95rem]">
              {post.excerpt}
            </p>
          )}

          {post.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-white/10 px-2 py-0.5 font-mono text-[10.5px] text-slate-500"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {post.coverImageUrl && (
          <Image
            src={post.coverImageUrl}
            alt={post.title}
            width={1440}
            height={810}
            priority
            sizes="92vw"
            className="mt-8 w-full rounded-2xl border border-white/8 object-cover"
          />
        )}

        {/* Content */}
        <div className="prose-portfolio mt-10 max-w-3xl space-y-4">
          {renderContent(post.content)}
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <section className="mt-16 max-w-3xl border-t border-white/5 pt-10">
            <h2 className="text-lg font-semibold text-white">Keep reading</h2>
            <div className="mt-5 space-y-2.5">
              {related.map((item) => (
                <Link
                  key={item._id}
                  href={`/blog/${item.slug}`}
                  className="group flex items-center justify-between gap-4 rounded-xl border border-white/8 bg-white/3 px-4 py-3 transition-colors hover:border-acc/30"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[13.5px] font-medium text-white transition-colors group-hover:text-acc">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-slate-500">
                      {formatDate(item.publishedAt)}
                    </span>
                  </span>
                  <ArrowRight size={15} className="shrink-0 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:text-acc" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </SiteShell>
  );
}
