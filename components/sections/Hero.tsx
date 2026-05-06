"use client";

import { useEffect, useRef } from "react";
import { useTypewriter } from "@/hooks/useTypewriter";
import { TYPEWRITER_ROLES, SOCIAL_LINKS } from "@/data/portfolio";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import heroImg from "@/assets/md-nihal-uddin-github.png"
import Magnetic from "@/components/ui/Magnetic";
import { Pacifico } from "next/font/google";

const pacifico = Pacifico({ subsets: ["latin"], weight: "400" });

function smoothScroll(href: string) {
  const el = document.querySelector(href);
  if (el) window.scrollTo({ top: (el as HTMLElement).offsetTop - 68, behavior: "smooth" });
}

export default function Hero() {
  const typedText = useTypewriter(TYPEWRITER_ROLES);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    el.style.opacity = "1";
  }, []);

  useGSAP(() => {
    // 1. Initial Entrance
    gsap.from(".hero-stagger", {
      y: 40,
      opacity: 0,
      stagger: 0.15,
      duration: 0.8,
      ease: "power3.out",
    });
    
    gsap.from(".hero-avatar-anim", {
      x: 40,
      opacity: 0,
      duration: 1,
      delay: 0.2,
      ease: "power3.out",
    });

    // 2. Continuous Parallax & Fade out on Scroll (The "Parallel" Effect)
    gsap.to(".hero-grid-bg", {
      yPercent: 30,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: 1,
      },
    });

    gsap.to(".hero-text-wrapper", {
      y: 100, // Parallax down
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: 1,
      },
    });

    gsap.to(".hero-avatar-parallax", {
      y: 150, // Parallax down faster than text
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: 1,
      },
    });
  }, { scope: heroRef });

  return (
    <section
      id="home"
      ref={heroRef}
      className="min-h-screen flex items-center pt-[68px] relative overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "var(--hero-grad)" }}
      />
      {/* Grid bg */}
      <div className="hero-grid-bg" />

      <div className="max-w-[1200px] mx-auto px-6 py-20 flex items-center gap-[60px] relative z-[1] w-full flex-col lg:flex-row">
        {/* Text */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left hero-text-wrapper will-change-transform">
          {/* Available badge */}
          <div
            className="hero-stagger inline-flex items-center gap-2 tag-pill border px-4 py-[6px] rounded-full text-[0.82rem] font-medium mb-7"
            style={{ borderColor: "var(--border-accent)" }}
          >
            <span
              className="w-[7px] h-[7px] rounded-full animate-pulse2"
              style={{ background: "var(--accent-2)" }}
            />
            Available for work
          </div>

          {/* Name */}
          <h1 className="hero-stagger font-syne text-[clamp(2.4rem,5vw,3rem)] font-extrabold leading-[1.1] mb-5">
            Hi, I&apos;m{" "} <br />
            <span className="gradient-text">Md. Nihal Uddin</span>
          </h1>

          {/* Typewriter */}
          <div className="hero-stagger text-[1.3rem] mb-6 min-h-[40px] flex items-center flex-wrap"
            style={{ color: "var(--text-secondary)" }}>
            <span className="mr-[6px]">I specialize in</span>
            <span
              className={`text-[1.5rem] tracking-wide ${pacifico.className}`}
              style={{ color: "var(--accent)" }}
            >
              {typedText}
            </span>
            <span
              className="inline-block w-[2px] h-[1.3rem] animate-blink ml-1"
              style={{ background: "var(--accent-2)" }}
            />
          </div>

          {/* Description */}
          <p
            className="hero-stagger leading-[1.7] max-w-[520px] mb-10 text-[1.05rem]"
            style={{ color: "var(--text-secondary)" }}
          >
            I engineer scalable, high-performance web applications using modern technologies such as Next.js, Node.js, MongoDB and TypeScript—delivering responsive, user-focused digital experiences with precision and consistency.
          </p>

          {/* CTA buttons */}
          <div className="hero-stagger flex gap-[14px] flex-wrap justify-center lg:justify-start">
            <Magnetic>
              <a
                href="#projects"
                onClick={(e) => { e.preventDefault(); smoothScroll("#projects"); }}
                className="btn-primary-custom"
              >
                <i className="fas fa-code" /> View Projects
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href="#contact"
                onClick={(e) => { e.preventDefault(); smoothScroll("#contact"); }}
                className="btn-outline-custom"
              >
                <i className="fas fa-paper-plane" /> Contact Me
              </a>
            </Magnetic>
          </div>

          {/* Socials */}
          <div
            className="hero-stagger flex gap-5 mt-12 pt-10 justify-center lg:justify-start flex-wrap"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            {SOCIAL_LINKS.map((s) => (
              <Magnetic key={s.label}>
                <a 
                  href={s.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-[var(--card-bg)] border border-[var(--border)] text-[1.2rem] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)] hover:bg-[var(--accent-glow)] transition-all duration-300 shadow-sm hover:shadow-[0_0_15px_var(--accent-glow)]"
                  aria-label={s.label}
                >
                  <i className={s.icon} />
                </a>
              </Magnetic>
            ))}
          </div>
        </div>

        {/* Avatar */}
        <div className="hero-avatar-anim flex justify-center items-center order-first lg:order-last">
          <div className="relative inline-block hero-avatar-parallax will-change-transform">
            <div className="hero-avatar">
              {/* <i className="fas fa-user-tie" /> */}
              <Image
              src={heroImg}
              alt="heroImg"
              ></Image>
            </div>
            <div
              className="floating-badge animate-float"
              style={{ bottom: -16, left: -20 }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: "#22c55e" }}
              />
              Open to work
            </div>
            <div
              className="floating-badge animate-float-delay"
              style={{ top: -16, right: -20 }}
            >
              <i
                className="fas fa-star"
                style={{ color: "#f59e0b", fontSize: 12 }}
              />
              Top Rated Dev
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
