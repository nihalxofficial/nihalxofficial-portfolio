"use client";
import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface SectionHeaderProps {
  icon: string;
  tag: string;
  title: React.ReactNode;
  subtitle: string;
}

export default function SectionHeader({ icon, tag, title, subtitle }: SectionHeaderProps) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(container.current, {
      scrollTrigger: {
        trigger: container.current,
        start: "top 90%",
        end: "top 60%",
        scrub: 1,
      },
      y: 40,
      opacity: 0,
      ease: "power2.out",
    });
  }, { scope: container });

  return (
    <div ref={container} className="mb-16 will-change-transform opacity-100">
      <div
        className="inline-flex items-center gap-2 tag-pill border px-[14px] py-[5px] rounded-full text-[0.8rem] font-semibold uppercase tracking-[0.1em] mb-4"
        style={{ borderColor: "var(--border-accent)", color: "var(--accent)" }}
      >
        <i className={icon} /> {tag}
      </div>
      <h2
        className="font-syne font-extrabold mb-4 leading-[1.15]"
        style={{
          fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
          color: "var(--text-primary)",
        }}
      >
        {title}
      </h2>
      <p
        className="text-[1.05rem] leading-[1.65] max-w-[540px]"
        style={{ color: "var(--text-secondary)" }}
      >
        {subtitle}
      </p>
    </div>
  );
}
