"use client";
import SectionHeader from "@/components/ui/SectionHeader";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { TESTIMONIALS } from "@/data/portfolio";

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-1 mb-4 relative z-[1]">
      {Array.from({ length: 5 }).map((_, i) => {
        const full = i < Math.floor(count);
        const half = !full && i < count;
        return (
          <i
            key={i}
            className={`${half ? "fas fa-star-half-alt" : "fas fa-star"} text-[0.85rem]`}
            style={{ color: "#f59e0b", opacity: full || half ? 1 : 0.3 }}
          />
        );
      })}
    </div>
  );
}

export default function Testimonials() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.from(".testimonial-card-stagger", {
      scrollTrigger: {
        trigger: ".testimonials-grid",
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
    <section
      id="testimonials"
      className="py-[100px]"
      style={{ background: "var(--bg-primary)" }}
      ref={ref}
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <SectionHeader
          icon="fas fa-quote-left"
          tag="Testimonials"
          title="What Clients Say"
          subtitle="Kind words from people I've had the pleasure of working with."
        />

        <div className="testimonials-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="testimonial-card testimonial-card-stagger will-change-transform">
              <Stars count={t.stars} />

              <p
                className="text-[0.9rem] leading-[1.72] mb-6 relative z-[1]"
                style={{ color: "var(--text-secondary)" }}
              >
                {t.text}
              </p>

              <div className="flex items-center gap-3">
                <div
                  className="testimonial-avatar"
                  style={t.avatarGrad ? { background: t.avatarGrad } : undefined}
                >
                  {t.initials}
                </div>
                <div>
                  <p
                    className="font-syne font-bold text-[0.9rem]"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {t.name}
                  </p>
                  <p className="text-[0.78rem]" style={{ color: "var(--text-muted)" }}>
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
