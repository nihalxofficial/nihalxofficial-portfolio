"use client";
import SectionHeader from "@/components/ui/SectionHeader";
import { SERVICES } from "@/data/portfolio";
import { useLenisReveal } from "@/hooks/useLenisReveal";

// Per-card animated wrapper
function ServiceCard({ service, index }: { service: { title: string; icon: string; desc: string }; index: number }) {
  const ref = useLenisReveal<HTMLDivElement>({
    distance: 40,
    viewportFraction: 0.35,
    staggerIndex: index,
  });

  return (
    <div
      ref={ref}
      className="service-card will-change-transform"
      style={{ opacity: 0 }}
    >
      <div className="icon-box w-[52px] h-[52px] rounded-[14px] flex items-center justify-center text-[1.3rem] mb-5">
        <i className={service.icon} />
      </div>
      <h3
        className="font-syne text-[1.1rem] font-bold mb-[10px]"
        style={{ color: "var(--text-primary)" }}
      >
        {service.title}
      </h3>
      <p
        className="text-[0.9rem] leading-[1.65]"
        style={{ color: "var(--text-secondary)" }}
      >
        {service.desc}
      </p>
    </div>
  );
}

export default function Services() {
  return (
    <section
      id="services"
      className="py-[100px]"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <SectionHeader
          icon="fas fa-cog"
          tag="Services"
          title="What I Can Do For You"
          subtitle="I offer a full range of frontend-focused services to help bring your digital vision to life."
        />

        <div className="services-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map((service, i) => (
            <ServiceCard key={service.title} service={service} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
