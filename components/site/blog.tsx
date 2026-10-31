import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { BlogPost, SectionMeta } from "@/lib/types";
import { formatDate } from "@/lib/utils";

/** Writing — published notes, newest first. */
export function Blog({
  posts,
  section,
  index,
}: {
  posts: BlogPost[];
  section?: SectionMeta;
  index: number;
}) {
  if (posts.length === 0) return null;

  return (
    <section id="blog" className="relative section-pad">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px rule-grad" />

      <div className="container-page">
        <Reveal>
          <SectionHeading
            index={index}
            label={section?.label || "Blog"}
            title={section?.heading || "Writing"}
            description={
              section?.description || "Notes on the things I break, fix and learn while building."
            }
          />
        </Reveal>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, position) => (
            <Reveal key={post._id} delay={position * 60}>
              <article className="panel panel-hover group flex h-full flex-col overflow-hidden">
                <Link
                  href={`/blog/${post.slug}`}
                  className="relative block overflow-hidden border-b border-line bg-surface-2"
                >
                  {post.coverImageUrl ? (
                    <Image
                      src={post.coverImageUrl}
                      alt={post.title}
                      width={900}
                      height={520}
                      sizes="(max-width: 768px) 92vw, 30vw"
                      className="aspect-[16/9] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="grid aspect-[16/9] w-full place-items-center bg-surface-2">
                      <Icon name="Newspaper" className="h-8 w-8 text-accent/30" />
                    </div>
                  )}
                </Link>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-2 text-[10.5px] text-faint">
                    <span className="mono uppercase tracking-[0.14em] text-accent/90">
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

                  <h3 className="mt-2 text-[15px] font-semibold leading-snug text-ink transition-colors group-hover:text-accent">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>

                  <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-muted">
                    {post.excerpt}
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-5">
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md border border-line px-2 py-0.5 text-[10.5px] text-faint"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <Link
                      href={`/blog/${post.slug}`}
                      className="mono inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-muted transition-colors hover:text-accent"
                    >
                      Read
                      <Icon name="ArrowRight" className="h-3.5 w-3.5" />
                    </Link>
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
