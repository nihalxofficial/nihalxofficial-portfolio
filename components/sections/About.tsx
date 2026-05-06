"use client";
import SectionHeader from "@/components/ui/SectionHeader";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import Image from "next/image";
import aboutImg from "@/assets/md-nihal-uddin-removebg-preview.png"
import Magnetic from "@/components/ui/Magnetic";

interface AboutProps {
  onDownload: () => void;
}

export default function About({ onDownload }: AboutProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(() => {

    // 2. Avatar scrub (from left)
    gsap.from(".about-avatar-wrapper", {
      scrollTrigger: {
        trigger: ".about-avatar-wrapper",
        start: "top 90%",
        end: "top 50%",
        scrub: 1,
      },
      x: -100,
      opacity: 0,
      scale: 0.8,
    });

    // 3. Text items scrub (from right)
    const textElements = gsap.utils.toArray(".about-text-item");
    textElements.forEach((el) => {
      gsap.from(el as Element, {
        scrollTrigger: {
          trigger: el as Element,
          start: "top 95%",
          end: "top 65%",
          scrub: 1,
        },
        x: 100,
        opacity: 0,
      });
    });
  }, { scope: ref });

  return (
    <section id="about" className="py-[100px] section-secondary" ref={ref}>
      <div className="max-w-[1200px] mx-auto px-6">
        <SectionHeader
          icon="fas fa-user"
          tag="About"
          title={<>Passionate Developer.<br />Creative Problem Solver.</>}
          subtitle="A bit about my journey, skills and what drives me to build amazing digital experiences."
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-[72px] items-center">
          {/* Avatar */}
          <div className="relative max-w-[320px] mx-auto lg:mx-0 about-avatar-wrapper will-change-transform">
            <div className="about-avatar">
              <Image 
              src={aboutImg}
              alt="aboutImg"></Image>
            </div>
            <div
              className="absolute -bottom-5 -right-5 gradient-bg text-white p-4 rounded-2xl text-center"
              style={{ boxShadow: "0 8px 24px var(--accent-glow)" }}
            >
              <div className="font-syne text-[2rem] font-extrabold leading-none">3+</div>
              <div className="text-[0.72rem] opacity-90 mt-[2px]">Years Experience</div>
            </div>
          </div>

          {/* Text */}
          <div>
            <div className="about-text-item border-l-[6px] border-[var(--accent)] bg-[var(--accent-glow)] py-5 pr-5 pl-7 rounded-2xl mb-7 will-change-transform">
              <p className="leading-[1.75] mb-4 text-[0.9rem]" style={{ color: "var(--text-secondary)" }}>
                I’m a Full Stack Developer who started coding with curiosity of how things work — and haven’t slowed down since. I turn ideas into fast, scalable and user-focused applications, specializing in Dashboards, E-commerce and SaaS products.
              </p>
              <p className="leading-[1.75] mb-4 text-[0.9rem]" style={{ color: "var(--text-secondary)" }}>
                I move seamlessly between frontend and backend, building complete experiences—not just interfaces. Whether working solo or in a team, I adapt quickly and ship with purpose.
              </p>
              <p className="leading-[1.75] text-[0.9rem]" style={{ color: "var(--text-secondary)" }}>
                When not coding, I explore new technologies, contribute to open-source or enjoying a good cup of coffee.
              </p>
            </div>

            <ul className="about-text-item list-none grid grid-cols-1 sm:grid-cols-2 gap-3 my-7 p-0 will-change-transform">
              {[
                ["3+ years", "professional developer"],
                ["20+ projects", "for clients worldwide"],
                ["React & Next.js", "Expert in"],
                ["UI/UX principles", "Strong"],
                ["Backend", "Strong"],
                ["Open-source", "contributor"],
              ].map(([strong, rest], i) => (
                <li
                  key={i}
                  className="flex items-center gap-[10px] text-[0.9rem] font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <span style={{ color: "var(--accent)", flexShrink: 0 }}>▹</span>
                  <strong style={{ color: "var(--text-primary)" }}>{strong}</strong>&nbsp;{rest}
                </li>
              ))}
            </ul>

            <div className="about-text-item will-change-transform">
              <Magnetic>
                <button onClick={onDownload} className="btn-primary-custom mt-2">
                  <i className="fas fa-download" /> Download Resume
                </button>
              </Magnetic>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
