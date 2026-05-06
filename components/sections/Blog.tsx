"use client";
import SectionHeader from "@/components/ui/SectionHeader";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { BLOG_POSTS } from "@/data/portfolio";

export default function Blog() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.from(".blog-card-stagger", {
      scrollTrigger: {
        trigger: ".blog-grid",
        start: "top 90%",
        end: "top 40%",
        scrub: 1,
      },
      y: 40,
      opacity: 0,
      stagger: 0.1,
    });
  }, { scope: ref });

  return (
    <section id="blog" className="py-[100px] section-secondary" ref={ref}>
      <div className="max-w-[1200px] mx-auto px-6">
        <SectionHeader
          icon="fas fa-pen-nib"
          tag="Blog"
          title="Latest Articles"
          subtitle="Sharing what I learn — React patterns, performance tips, and career advice for developers."
        />

        <div className="blog-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {BLOG_POSTS.map((post) => (
            <div key={post.title} className="blog-card blog-card-stagger will-change-transform">
              {/* Thumbnail */}
              <div className="blog-thumb">
                <div className={`blog-thumb-bg ${post.thumbClass}`} />
                <i
                  className={`${post.thumbIcon} relative z-[1] text-[2.2rem] text-white/90`}
                  style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.4))" }}
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="tag-pill text-[0.72rem] px-3 py-[3px] rounded-full font-semibold">
                    {post.tag}
                  </span>
                  <span className="text-[0.75rem]" style={{ color: "var(--text-muted)" }}>
                    {post.date} · {post.readTime}
                  </span>
                </div>

                <h3
                  className="font-syne font-bold text-[1rem] leading-[1.35] mb-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  {post.title}
                </h3>

                <p
                  className="text-[0.875rem] leading-[1.65] mb-4"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {post.excerpt}
                </p>

                <a
                  href="#"
                  className="inline-flex items-center gap-2 font-semibold text-[0.875rem] transition-all duration-200"
                  style={{ color: "var(--accent)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.gap = "12px";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.gap = "8px";
                  }}
                >
                  Read Article <i className="fas fa-arrow-right text-[0.75rem]" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
