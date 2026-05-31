"use client";
import SectionHeader from "@/components/ui/SectionHeader";
import { TESTIMONIALS } from "@/data/portfolio";
import { useLenisReveal } from "@/hooks/useLenisReveal";

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

function TestimonialCard({ t, index }: { t: any; index: number }) {
  const cardRef = useLenisReveal<HTMLDivElement>({
    distance: 40,
    viewportFraction: 0.35,
    staggerIndex: index,
  });

  return (
    <div ref={cardRef} className="testimonial-card will-change-transform" style={{ opacity: 0 }}>
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
  );
}

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="py-[100px]"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <SectionHeader
          icon="fas fa-quote-left"
          tag="Testimonials"
          title="What Clients Say"
          subtitle="Kind words from people I've had the pleasure of working with."
        />

        <div className="testimonials-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={t.name} t={t} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
