"use client";
import SectionHeader from "@/components/ui/SectionHeader";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { SERVICES } from "@/data/portfolio";

export default function Services() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.from(".service-card-stagger", {
      scrollTrigger: {
        trigger: ".services-grid",
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
      id="services"
      className="py-[100px]"
      style={{ background: "var(--bg-primary)" }}
      ref={ref}
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <SectionHeader
          icon="fas fa-cog"
          tag="Services"
          title="What I Can Do For You"
          subtitle="I offer a full range of frontend-focused services to help bring your digital vision to life."
        />

        <div className="services-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map((service) => (
            <div 
              key={service.title} 
              className="service-card service-card-stagger will-change-transform"
            >
              <div
                className="icon-box w-[52px] h-[52px] rounded-[14px] flex items-center justify-center text-[1.3rem] mb-5"
              >
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
          ))}
        </div>
      </div>
    </section>
  );
}
