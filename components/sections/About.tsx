"use client";
import SectionHeader from "@/components/ui/SectionHeader";
import { useState } from "react";
import Image from "next/image";
import aboutImg from "@/assets/bijoy.png"
import Magnetic from "@/components/ui/Magnetic";
import { useLenisReveal } from "@/hooks/useLenisReveal";

interface AboutProps {
  onDownload: (success: boolean) => void;
}

// Individual animated wrappers driven by Lenis scroll tick
function LenisRevealEl({
  children,
  distance = 40,
  viewportFraction = 0.3,
  staggerIndex = 0,
  direction = "up",
  className = "",
  style,
}: {
  children: React.ReactNode;
  distance?: number;
  viewportFraction?: number;
  staggerIndex?: number;
  direction?: "up" | "left" | "right";
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useLenisReveal<HTMLDivElement>({ distance, viewportFraction, staggerIndex, direction });
  return (
    <div
      ref={ref}
      className={`will-change-transform ${className}`}
      style={{ opacity: 0, ...style }}
    >
      {children}
    </div>
  );
}

export default function About({ onDownload }: AboutProps) {
  const [downloading, setDownloading] = useState(false);
  const avatarRef = useLenisReveal<HTMLDivElement>({ distance: 60, viewportFraction: 0.35, direction: "up" });
  const text1Ref  = useLenisReveal<HTMLDivElement>({ distance: 40, viewportFraction: 0.3, staggerIndex: 0 });
  const text2Ref  = useLenisReveal<HTMLUListElement>({ distance: 40, viewportFraction: 0.3, staggerIndex: 1 });
  const text3Ref  = useLenisReveal<HTMLDivElement>({ distance: 40, viewportFraction: 0.3, staggerIndex: 2 });

  async function handleDownload() {
    if (downloading) return;
    setDownloading(true);
    try {
      const res = await fetch("/Nihal_Full_Stack_Developer_Resume.pdf");
      if (!res.ok) throw new Error("Not found");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Nihal_Full_Stack_Developer_Resume.pdf";
      a.click();
      URL.revokeObjectURL(url);
      onDownload(true);
    } catch {
      onDownload(false);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <section id="about" className="py-[100px] section-secondary">
      <div className="max-w-[1200px] mx-auto px-6">
        <SectionHeader
          icon="fas fa-user"
          tag="About"
          title={<>Passionate Developer.<br />Creative Problem Solver.</>}
          subtitle="A bit about my journey, skills and what drives me to build amazing digital experiences."
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-[72px] items-center">
          {/* Avatar */}
          <div
            ref={avatarRef}
            className="relative max-w-[320px] mx-auto lg:mx-0 will-change-transform"
            style={{ opacity: 0 }}
          >
            <div className="about-avatar">
              <Image src={aboutImg} alt="aboutImg"></Image>
            </div>
          </div>

          {/* Text */}
          <div>
            {/* Paragraph block */}
            <div
              ref={text1Ref}
              className="mb-7 will-change-transform"
              style={{ opacity: 0 }}
            >
              <p className="leading-[1.75] mb-4 text-[0.9rem]" style={{ color: "var(--text-secondary)" }}>
                I'm a Full Stack Developer who started coding with curiosity of how things work — and haven't slowed down since. I turn ideas into fast, scalable and user-focused applications, specializing in Dashboards, E-commerce and SaaS products.
              </p>
              <p className="leading-[1.75] mb-4 text-[0.9rem]" style={{ color: "var(--text-secondary)" }}>
                I move seamlessly between frontend and backend, building complete experiences—not just interfaces. Whether working solo or in a team, I adapt quickly and ship with purpose.
              </p>
              <p className="leading-[1.75] text-[0.9rem]" style={{ color: "var(--text-secondary)" }}>
                When not coding, I explore new technologies, contribute to open-source or enjoying a good cup of coffee.
              </p>
            </div>

            {/* Bullet list */}
            <ul
              ref={text2Ref}
              className="list-none grid grid-cols-1 sm:grid-cols-2 gap-3 my-7 p-0 will-change-transform"
              style={{ opacity: 0 }}
            >
              {[
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

            {/* Button */}
            <div
              ref={text3Ref}
              className="will-change-transform"
              style={{ opacity: 0 }}
            >
              <Magnetic>
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="btn-primary-custom mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {downloading ? (
                    <>
                      <i className="fas fa-spinner fa-spin" /> Downloading…
                    </>
                  ) : (
                    <>
                      <i className="fas fa-download" /> Download Resume
                    </>
                  )}
                </button>
              </Magnetic>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
