"use client";
import SectionHeader from "@/components/ui/SectionHeader";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { SKILL_CATEGORIES } from "@/data/portfolio";

export default function Skills() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.from(".skill-card-stagger", {
      scrollTrigger: {
        trigger: ".skills-grid",
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
    <section id="skills" className="py-[100px] section-secondary" ref={ref}>
      <div className="max-w-[1200px] mx-auto px-6">
        <SectionHeader
          icon="fas fa-layer-group"
          tag="Skills"
          title="My Technical Stack"
          subtitle="Technologies I work with daily, and the proficiency level I've reached through years of practice."
        />

        <div className="skills-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SKILL_CATEGORIES.map((cat) => (
            <div 
              key={cat.title} 
              className="skill-card skill-card-stagger will-change-transform"
            >
              <div className="flex items-center gap-[14px] mb-6">
                <div className="icon-box w-12 h-12 rounded-xl flex items-center justify-center text-[1.2rem]">
                  <i className={cat.icon} />
                </div>
                <h3
                  className="font-syne text-[1.05rem] font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {cat.title}
                </h3>
              </div>

              <ul className="list-none p-0 m-0">
                {cat.skills.map((skill, idx) => (
                  <li
                    key={skill.name}
                    className={`flex justify-between items-center py-[10px] text-[0.9rem] ${
                      idx < cat.skills.length - 1 ? "skill-list-row" : ""
                    }`}
                    style={{
                      color: idx === cat.skills.length - 1 ? "var(--text-secondary)" : undefined,
                    }}
                  >
                    {skill.name}
                    <span className={`skill-level ${skill.level}`}>
                      {skill.level.charAt(0).toUpperCase() + skill.level.slice(1)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
