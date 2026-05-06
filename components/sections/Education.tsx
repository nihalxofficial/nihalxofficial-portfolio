"use client";
import SectionHeader from "@/components/ui/SectionHeader";
import { useRef } from "react";
import { EDUCATION, CERTIFICATIONS } from "@/data/portfolio";
import { useLenis } from "lenis/react";

const AnimatedEduCard = ({ edu, index }: { edu: any; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);

  useLenis(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Progress starts when element enters bottom of screen (windowHeight), completes at 70% of screen
    const progress = Math.min(Math.max((windowHeight - rect.top) / (windowHeight * 0.3), 0), 1);
    
    // Slide in from left (-100px to 0)
    const x = -100 * (1 - progress);
    ref.current.style.transform = `translateX(${x}px)`;
    ref.current.style.opacity = progress.toString();
  });

  return (
    <div ref={ref} className="flex gap-5 opacity-0 -translate-x-[100px] will-change-transform">
      <div className="edu-dot">
        <i className={edu.icon} />
      </div>
      <div className="flex-1 pb-2">
        <div className="flex items-start justify-between flex-wrap gap-2 mb-1">
          <h4
            className="font-syne font-bold text-[1rem]"
            style={{ color: "var(--text-primary)" }}
          >
            {edu.degree}
          </h4>
          <span className="tag-pill text-[0.72rem] px-3 py-[3px] rounded-full font-semibold">
            {edu.period}
          </span>
        </div>
        <p
          className="text-[0.88rem] font-semibold mb-1"
          style={{ color: "var(--accent)" }}
        >
          {edu.school}
        </p>
        <p
          className="text-[0.875rem] leading-[1.65] border-l-[6px] border-[var(--accent)] bg-[var(--accent-glow)] py-3 pr-4 pl-5 rounded-xl mt-2"
          style={{ color: "var(--text-secondary)" }}
        >
          {edu.desc}
        </p>
      </div>
    </div>
  );
};

const AnimatedCertCard = ({ cert }: { cert: any }) => {
  const ref = useRef<HTMLDivElement>(null);

  useLenis(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    const progress = Math.min(Math.max((windowHeight - rect.top) / (windowHeight * 0.3), 0), 1);
    
    // Slide in from right (100px to 0)
    const x = 100 * (1 - progress);
    ref.current.style.transform = `translateX(${x}px)`;
    ref.current.style.opacity = progress.toString();
  });

  return (
    <div ref={ref} className="cert-card opacity-0 translate-x-[100px] will-change-transform">
      <div
        className="cert-icon"
        style={cert.iconColor ? { color: cert.iconColor } : undefined}
      >
        <i className={cert.icon} />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p
            className="font-syne font-bold text-[0.95rem]"
            style={{ color: "var(--text-primary)" }}
          >
            {cert.title}
          </p>
          <span
            className="text-[0.72rem] font-semibold"
            style={{ color: "var(--accent)" }}
          >
            {cert.year}
          </span>
        </div>
        <p className="text-[0.8rem] mt-[2px]" style={{ color: "var(--text-muted)" }}>
          {cert.issuer}
        </p>
      </div>
      <i
        className="fas fa-external-link-alt text-[0.8rem] flex-shrink-0"
        style={{ color: "var(--text-muted)" }}
      />
    </div>
  );
};

const AnimatedTimelineLine = () => {
  const ref = useRef<HTMLDivElement>(null);

  useLenis(() => {
    if (!ref.current) return;
    const parent = ref.current.parentElement;
    if (!parent) return;
    
    const rect = parent.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Progress for the line: starts when top of timeline hits bottom of screen + some offset, ends when bottom hits center
    const progress = Math.min(Math.max((windowHeight - rect.top - 100) / (rect.height), 0), 1);
    
    ref.current.style.transform = `scaleY(${progress})`;
  });

  return (
    <div 
      ref={ref}
      className="absolute left-[23px] top-0 bottom-0 w-[2px] opacity-30 origin-top will-change-transform scale-y-0"
      style={{ background: "linear-gradient(180deg,var(--accent),var(--accent-2),transparent)" }}
    />
  );
};

export default function Education() {
  return (
    <section id="education" className="py-[100px] section-secondary">
      <div className="max-w-[1200px] mx-auto px-6">
        <SectionHeader
          icon="fas fa-graduation-cap"
          tag="Education & Certs"
          title={<>Academic Background &<br />Certifications</>}
          subtitle="My formal education and professional certifications that back the work you see above."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Education Timeline */}
          <div>
            <h3
              className="font-syne text-[1.1rem] font-bold mb-8 flex items-center gap-3"
              style={{ color: "var(--text-primary)" }}
            >
              <span className="icon-box w-9 h-9 rounded-lg flex items-center justify-center text-[0.95rem]">
                <i className="fas fa-university" />
              </span>
              Education
            </h3>

            <div className="flex flex-col gap-8 relative">
              <AnimatedTimelineLine />

              {EDUCATION.map((edu, index) => (
                <AnimatedEduCard key={edu.degree} edu={edu} index={index} />
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div>
            <h3
              className="font-syne text-[1.1rem] font-bold mb-8 flex items-center gap-3"
              style={{ color: "var(--text-primary)" }}
            >
              <span className="icon-box w-9 h-9 rounded-lg flex items-center justify-center text-[0.95rem]">
                <i className="fas fa-certificate" />
              </span>
              Certifications
            </h3>

            <div className="flex flex-col gap-4">
              {CERTIFICATIONS.map((cert) => (
                <AnimatedCertCard key={cert.title} cert={cert} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
