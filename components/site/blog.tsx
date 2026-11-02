"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Calendar, Clock, Heart, Search } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import type { BlogPost, SectionMeta } from "@/lib/types";
import { formatDate } from "@/lib/utils";

/* ─── Code-snippet cover backgrounds ──────────────────────────────────── */
const COVER_CODE = [
  ["const app = next();", "export default async fn", "await fetch(url, {", "  cache: 'force-cache'", "});", "return <Page />"],
  ["@theme {", "  --color-brand:", "    #00e5ff;", "}", ".btn { @apply px-4 }", "color-mix(in srgb)"],
  ["func main() {", '  mux := http.New', '  mux.Handle("GET"', "  log.Fatal(", "    http.Listen)", "}"],
  ["type State<T> =", "  | { status: 'ok' }", "  | { status: 'err' }", "satisfies Config;", "as const;", "infer U"],
  ["FROM node:22 AS b", "RUN npm ci", "RUN npm build", "FROM nginx:alpine", "COPY --from=b", "EXPOSE 80"],
];
const HUES: [string, string][] = [
  ["#00e5ff", "#1e3a8a"], ["#38bdf8", "#4c1d95"], ["#00add8", "#064e3b"],
  ["#3178c6", "#581c87"], ["#2496ed", "#0f172a"],
];

function Cover({ i, className = "" }: { i: number; className?: string }) {
  const safeIdx = Math.max(0, Math.abs(i || 0));
  const [a, b] = HUES[safeIdx % HUES.length];
  return (
    <div
      className={`relative overflow-hidden font-mono text-[10px] leading-4 p-3 ${className}`}
      style={{ background: `linear-gradient(135deg, ${b}, #050a24 70%)` }}
    >
      <div
        className="absolute -right-6 -top-6 w-28 h-28 rounded-full blur-2xl opacity-60"
        style={{ background: a }}
      />
      {COVER_CODE[safeIdx % COVER_CODE.length].map((l, k) => (
        <div key={k} className="relative truncate" style={{ color: a, opacity: 1 - k * 0.11 }}>
          <span className="text-white/25 mr-2">{k + 1}</span>{l}
        </div>
      ))}
    </div>
  );
}

function ImageCover({ post, i, className = "" }: { post: BlogPost; i: number; className?: string }) {
  return post.coverImageUrl ? (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={post.coverImageUrl}
        alt={post.title}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        sizes="(max-width: 768px) 92vw, 50vw"
      />
    </div>
  ) : (
    <Cover i={i} className={className} />
  );
}

const DEFAULT_POSTS: BlogPost[] = [
  {
    _id: "post-1",
    title: "Next.js 16: What's New & Architecture Patterns",
    slug: "nextjs-16",
    excerpt: "Explore the powerful features in Next.js 16, server-first caching, and how to build high-performance production apps.",
    content: "Next.js 16 pushes the boundaries of server-first web development with explicit caching and Turbopack.",
    coverImageUrl: "",
    tags: ["Next.js", "React", "Turbopack"],
    category: "Next.js",
    readingTime: "5 min read",
    isPublished: true,
    publishedAt: "2025-10-28",
  },
  {
    _id: "post-2",
    title: "Mastering Tailwind CSS v4 & CSS-First Theming",
    slug: "tailwind-v4",
    excerpt: "A practical deep-dive into Tailwind v4's new engine, CSS-first design tokens, and runtime accent color variables.",
    content: "Tailwind v4 drops the JavaScript configuration in favor of plain CSS variables and native performance.",
    coverImageUrl: "",
    tags: ["CSS", "Tailwind", "Design Systems"],
    category: "CSS",
    readingTime: "7 min read",
    isPublished: true,
    publishedAt: "2025-09-14",
  },
  {
    _id: "post-3",
    title: "Building Scalable REST APIs with Go & Fiber",
    slug: "go-rest",
    excerpt: "From zero to production-ready microservices using idiomatic Go, standard library routers, and clean interfaces.",
    content: "Go standard library is powerful enough to ship a clean REST API with minimal overhead and high concurrency.",
    coverImageUrl: "",
    tags: ["Go", "Backend", "APIs"],
    category: "Backend",
    readingTime: "8 min read",
    isPublished: true,
    publishedAt: "2025-08-02",
  },
  {
    _id: "post-4",
    title: "TypeScript Patterns I Use Daily in Production",
    slug: "ts-patterns",
    excerpt: "Discriminated unions, satisfies operator, branded types and architecture tricks that eliminate entire classes of bugs.",
    content: "Good types make illegal states unrepresentable. These are the patterns that pay dividends every single week.",
    coverImageUrl: "",
    tags: ["TypeScript", "Architecture", "DX"],
    category: "TypeScript",
    readingTime: "6 min read",
    isPublished: true,
    publishedAt: "2025-07-11",
  },
];

/** Writing — published articles in HUD card style with category filter + search. */
export function Blog({
  posts,
  section,
  index,
}: {
  posts: BlogPost[];
  section?: SectionMeta;
  index: number;
}) {
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");

  const allPosts = posts.length > 0 ? posts : DEFAULT_POSTS;

  const cats = ["All", ...Array.from(new Set(allPosts.map((p) => p.category).filter(Boolean)))];
  const filtered = allPosts.filter(
    (p) =>
      (cat === "All" || p.category === cat) &&
      (p.title + (p.excerpt ?? "")).toLowerCase().includes(q.toLowerCase())
  );

  const [first, ...rest] = filtered;
  const firstIdx = first ? Math.max(0, allPosts.indexOf(first)) : 0;

  return (
    <section id="blog" className="relative py-12">
      {/* ViewHeader */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <p className="eyebrow mb-2 font-mono text-xs text-acc">{"// latest blog"}</p>
          <h2 className="text-3xl font-bold">
            Read My <span className="text-grad">Articles</span>
          </h2>
          {section?.description && (
            <p className="text-sm text-slate-400 mt-1 max-w-xl">{section.description}</p>
          )}
        </div>
        {/* Search */}
        <div className="flex items-center gap-2 hud !rounded-lg px-3 py-2 w-full sm:w-64">
          <Search size={14} className="text-slate-500 shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="search articles…"
            className="bg-transparent outline-none text-sm w-full placeholder:text-slate-600"
          />
        </div>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`chip ${cat === c ? "on" : ""}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Featured first post */}
      {first && (
        <Reveal>
          <article className="hud hud-hover overflow-hidden mb-5 rise group">
            <Link href={`/blog/${first.slug}`} className="grid md:grid-cols-[1.1fr_1fr] w-full text-left">
              <ImageCover post={first} i={firstIdx} className="min-h-[220px] md:min-h-[280px]" />
              <div className="p-6 sm:p-8 flex flex-col justify-center">
                <span className="font-mono text-[11px] text-acc uppercase tracking-widest">
                  ★ featured · {first.category || "Article"}
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold mt-2 group-hover:text-acc transition">
                  {first.title}
                </h2>
                {first.excerpt && (
                  <p className="text-slate-400 mt-3 line-clamp-3">{first.excerpt}</p>
                )}
                <div className="mt-5 flex gap-4 font-mono text-xs text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />{formatDate(first.publishedAt)}
                  </span>
                  {first.readingTime && (
                    <span className="flex items-center gap-1">
                      <Clock size={12} />{first.readingTime}
                    </span>
                  )}
                </div>
                <span className="mt-6 inline-flex items-center gap-2 text-acc text-sm font-semibold">
                  Read article <ArrowRight size={15} className="group-hover:translate-x-1 transition" />
                </span>
              </div>
            </Link>
          </article>
        </Reveal>
      )}

      {/* Grid of remaining posts */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {rest.map((post, position) => {
          const pi = Math.max(0, allPosts.indexOf(post));
          return (
            <Reveal key={post._id} delay={position * 60}>
              <article
                className="hud hud-hover group flex h-full flex-col overflow-hidden transition hover:-translate-y-1"
                style={{ animationDelay: `${position * 70}ms` }}
              >
                <Link href={`/blog/${post.slug}`} className="relative block overflow-hidden" aria-label={post.title}>
                  <ImageCover post={post} i={pi} className="h-32 w-full" />
                </Link>

                <div className="flex flex-1 flex-col p-4">
                  <span className="font-mono text-[10px] text-acc uppercase tracking-widest">{post.category || "Note"}</span>
                  <h3 className="font-display font-bold text-lg mt-1 group-hover:text-acc transition line-clamp-2">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>
                  {post.excerpt && (
                    <p className="text-sm text-slate-400 mt-2 line-clamp-2">{post.excerpt}</p>
                  )}
                  <div className="mt-4 flex gap-4 font-mono text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />{formatDate(post.publishedAt)}
                    </span>
                    {post.readingTime && (
                      <span className="flex items-center gap-1">
                        <Clock size={11} />{post.readingTime}
                      </span>
                    )}
                  </div>
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
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-20 font-mono text-slate-500">
          $ grep -r &quot;{q}&quot; ./blog → no articles found
        </div>
      )}
    </section>
  );
}
