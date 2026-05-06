"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function Preloader() {
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sessionStorage.getItem("preloader_played")) {
      setIsLoading(false);
      return;
    }

    document.body.style.overflow = "hidden";

    const tl = gsap.timeline({
      onComplete: () => {
        setIsLoading(false);
        sessionStorage.setItem("preloader_played", "true");
        document.body.style.overflow = "";
      },
    });

    // 1. Giant BG Text Fade & Scale
    tl.from(".giant-bg-text", {
      scale: 0.8,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    });

    // 2. Subtitle Slide Up
    tl.from(textRef.current, {
      y: 30,
      opacity: 0,
      duration: 0.5,
      ease: "power3.out",
    }, "-=0.6");

    // 3. Progress Bar & Percentage
    const counter = { val: 0 };
    
    // Animate up to 100% fast
    tl.to(counter, {
      val: 100,
      duration: 0.8,
      ease: "power2.inOut",
      onUpdate: () => {
        if (counterRef.current) {
          counterRef.current.innerText = Math.round(counter.val) + "%";
        }
      },
    }, "-=0.3");

    tl.to(barRef.current, {
      scaleX: 1,
      duration: 0.8,
      ease: "power2.inOut",
    }, "<");

    // 4. Visual pause at 100% so it's readable
    tl.to({}, { duration: 0.2 });

    // 5. Loader Exit
    tl.to(containerRef.current, {
      y: "-100%",
      duration: 1.2,
      ease: "power4.inOut",
    });

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!isLoading) return null;

  const introText = "Welcome to my portfolio 👋".split(" ");

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[99999] bg-[#030303] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Giant Background Text */}
      <div className="giant-bg-text absolute opacity-5 whitespace-nowrap text-[20vw] font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 pointer-events-none select-none">
        PORTFOLIO
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Massive Percentage Counter */}
        <div 
          ref={counterRef} 
          className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-600 via-blue-400 to-cyan-400 drop-shadow-[0_0_30px_rgba(59,130,246,0.4)] mb-2"
        >
          0%
        </div>

        {/* Subtitle */}
        <div className="overflow-hidden h-12 mb-8 flex items-center justify-center">
          <span 
            ref={textRef} 
            className="text-lg md:text-2xl font-bold tracking-[0.3em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-400 to-cyan-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
          >
            Welcome to my portfolio
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-64 md:w-96 h-[2px] bg-white/5 rounded-full overflow-hidden relative">
          <div 
            ref={barRef} 
            className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-blue-600 via-blue-400 to-cyan-400 shadow-[0_0_20px_rgba(59,130,246,0.8)] origin-left"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
      </div>
    </div>
  );
}
