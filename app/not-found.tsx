"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Magnetic from "@/components/ui/Magnetic";

export default function NotFound() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(".not-found-anim", {
      y: 30,
      opacity: 0,
      stagger: 0.1,
      duration: 0.8,
      ease: "power3.out",
    });
  }, { scope: containerRef });

  return (
    <div 
      ref={containerRef}
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Background gradients */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "var(--hero-grad)" }}
      />
      <div className="hero-grid-bg" />

      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <div 
          className="not-found-anim font-syne font-extrabold text-[8rem] md:text-[12rem] leading-none mb-4"
          style={{ 
            background: "linear-gradient(to right, var(--accent), var(--accent-2))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          404
        </div>
        
        <h1 
          className="not-found-anim font-syne text-2xl md:text-4xl font-bold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Page Not Found
        </h1>
        
        <p 
          className="not-found-anim max-w-[500px] mb-10 text-[1.05rem] leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Oops! It seems you've wandered into the digital void. The page you are looking for has either moved or doesn't exist.
        </p>
        
        <div className="not-found-anim">
          <Magnetic>
            <Link href="/" className="btn-primary-custom px-8 py-3 text-[0.95rem]">
              <i className="fas fa-home mr-2" /> Back to Home
            </Link>
          </Magnetic>
        </div>
      </div>
    </div>
  );
}
