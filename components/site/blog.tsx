import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import type { BlogPost, SectionMeta } from "@/lib/types";
import { formatDate } from "@/lib/utils";

/** Generate a code-snippet "cover" background for posts without a cover image */
function CodeCover({ title, category }: { title: string; category?: string }) {
  const snippets = [
    `const ${category?.toLowerCase().replace(/[^a-z]/g, "_") || "post"} = {\n  title: "${title.slice(0, 20)}…",\n  by: "Nihal Uddin",\n};`,
    `// ${title.slice(0, 30)}\nexport default function () {\n  return <Article />;\n}`,
    `function read() {\n  /* ${category || "Blog"} */\n  return insights;\n}`,
  ];
  const snippet = snippets[Math.abs(title.charCodeAt(0)) % snippets.length];
  const colors  = ["from-acc/20 to-acc2/20", "from-emerald-400/15 to-acc/15", "from-acc2/20 to-pink-500/15"];
  const color   = colors[Math.abs(title.charCodeAt(1) || 0) % colors.length];

  return (
    <div className={`aspect-[16/9] w-full grid place-items-center bg-gradient-to-br ${color} border-b border-white/5`}>
      <pre className="font-mono text-[9px] text-acc/70 text-left px-4 leading-relaxed select-none">
        {snippet}
      </pre>
    </div>
  );
}

/** Writing — published articles in HUD card style. */
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
    <section id="blog" className="relative py-12">
      {/* ViewHeader */}
      <p className="eyebrow mb-2 font-mono text-xs text-acc">{"// latest blog"}</p>
      <h2 className="text-3xl font-bold mb-2">
        Read My <span className="text-grad">Articles</span>
      </h2>
      {section?.description && (
        <p className="text-sm text-slate-400 mb-8 max-w-xl">{section.description}</p>
      )}

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, position) => (
          <Reveal key={post._id} delay={position * 60}>
            <article className="hud hud-hover group flex h-full flex-col overflow-hidden transition hover:-translate-y-1">
              {/* Cover */}
              <Link
                href={`/blog/${post.slug}`}
                className="relative block overflow-hidden"
                aria-label={post.title}
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
                  <CodeCover title={post.title} category={post.category} />
                )}
              </Link>

              {/* Body */}
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-2 text-[10.5px]">
                  <span className="font-mono uppercase tracking-widest text-acc/90">
                    {post.category || "Note"}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-500">{formatDate(post.publishedAt)}</span>
                  {post.readingTime && (
                    <>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-500">{post.readingTime}</span>
                    </>
                  )}
                </div>

                <h3 className="mt-2 text-[15px] font-semibold leading-snug transition-colors group-hover:text-acc">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>

                {post.excerpt && (
                  <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-slate-400">
                    {post.excerpt}
                  </p>
                )}

                <div className="mt-auto flex items-center justify-between gap-2 pt-4 border-t border-white/5 mt-4">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="font-mono inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-slate-400 hover:text-acc transition-colors"
                  >
                    Read more <ArrowRight size={12} />
                  </Link>
                  <BookOpen size={14} className="text-slate-600" />
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
