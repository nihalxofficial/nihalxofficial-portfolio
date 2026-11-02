"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowRight, Download } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import type { Hero as HeroContent, SiteSettings, NavigationItem } from "@/lib/types";

/** Typewriter that cycles through an array of role strings */
function RoleTypewriter({ lines }: { lines: string[] }) {
  const [idx, setIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [phase, setPhase] = useState<"typing" | "pausing" | "deleting">("typing");

  useEffect(() => {
    if (lines.length === 0) return;
    const current = lines[idx % lines.length];

    if (phase === "typing") {
      if (displayed.length < current.length) {
        const t = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 60);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setPhase("pausing"), 1800);
      return () => clearTimeout(t);
    }
    if (phase === "pausing") {
      const t = setTimeout(() => setPhase("deleting"), 400);
      return () => clearTimeout(t);
    }
    if (phase === "deleting") {
      if (displayed.length > 0) {
        const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 35);
        return () => clearTimeout(t);
      }
      setIdx((i) => i + 1);
      setPhase("typing");
    }
  }, [lines, idx, displayed, phase]);

  if (lines.length === 0) return null;
  return (
    <>
      <span className="text-emerald-300">{displayed}</span>
      <span className="caret text-acc">_</span>
    </>
  );
}

function scrollToHref(href: string) {
  const id = href.replace(/^#/, "");
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
  else document.getElementById("stage")?.scrollTo({ top: 0, behavior: "smooth" });
}

export function Hero({
  hero,
  settings,
  navigation,
}: {
  hero: HeroContent;
  settings: SiteSettings | null;
  navigation?: NavigationItem[];
}) {
  const socials = (settings?.socialLinks ?? []).filter((s) => s.url);
  const rawRoleLines =
    hero.rotator?.lines?.filter((l) => l.trim()).length
      ? hero.rotator!.lines
      : [hero.role].filter(Boolean);

  const roleLines = rawRoleLines.flatMap((line) => {
    if (line.includes(" & ") && line.toLowerCase().includes("problem solver")) {
      return line.split(" & ").map((s) => s.trim());
    }
    return [line];
  });

  const secondaryHref = hero.secondaryCta?.href || "#contact";
  const secondaryExternal = /^https?:\/\//i.test(secondaryHref);

  const rawPrimaryHref = hero.primaryCta?.href || "#showcase";
  const primaryHref = rawPrimaryHref === "#projects" ? "#showcase" : rawPrimaryHref;

  const nav = navigation ?? [];

  return (
    <section id="hero" className="relative pt-6 pb-12">
      <div className="relative grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] xl:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12 items-center">
        {/* Left: copy (on mobile displays second, on desktop displays first) */}
        <div className="order-2 lg:order-1 pt-2">
          {/* Availability pill */}
          <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-300 hud !rounded-full px-4 py-1.5 !border-emerald-400/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {hero.availability?.isAvailable
              ? (hero.availability.label || "available for work")
              : hero.greeting || "Hi, I'm"
            }
          </div>

          {/* Name */}
          <h1 className="mt-5 font-display font-bold leading-[1.02] text-5xl sm:text-6xl 2xl:text-7xl">
            {hero.greeting && !hero.availability?.isAvailable && (
              <>{hero.greeting}<br /></>
            )}
            <span
              className="glitch text-grad"
              data-text={`${hero.name}${hero.highlightedName ? " " + hero.highlightedName : ""}`}
            >
              {hero.name}
              {hero.highlightedName ? (
                <> <span className="text-grad">{hero.highlightedName}</span></>
              ) : null}
            </span>
            <span className="caret text-acc font-light">|</span>
          </h1>

          {/* Role typewriter */}
          <div className="mt-4 text-xl sm:text-3xl font-bold font-mono min-h-[2.4rem]">
            <span className="text-acc">&lt;</span>{" "}
            <RoleTypewriter lines={roleLines} />
            {" "}<span className="text-acc">/&gt;</span>
          </div>

          {/* Description */}
          <p className="mt-5 pl-4 border-l-2 border-acc max-w-md text-slate-200 text-[15px] leading-relaxed">
            {hero.description}
            <span className="block text-slate-400 text-sm mt-2 font-mono">
              {/* Tip hint */}
              {`// press `}
              <kbd className="px-1.5 py-0.5 rounded border border-white/20 text-acc">⌘K</kbd>
              {` or 1–${nav.length} to navigate`}
            </span>
          </p>

          {/* CTAs */}
          <div className="mt-7 flex flex-wrap gap-4">
            <a
              href={primaryHref}
              onClick={(e) => {
                if (!primaryHref.startsWith("http")) {
                  e.preventDefault();
                  scrollToHref(primaryHref);
                }
              }}
              className="btn-primary rounded-full px-7 py-3 flex items-center gap-2 text-sm font-semibold"
            >
              {hero.primaryCta?.label || "Explore My Work"} <ArrowRight size={16} />
            </a>
            <a
              href={secondaryHref}
              target={secondaryExternal ? "_blank" : undefined}
              download={!secondaryExternal}
              rel="noopener noreferrer"
              className="btn-ghost rounded-full px-7 py-3 font-semibold flex items-center gap-2 text-sm"
            >
              {hero.secondaryCta?.label || "Download CV"} <Download size={16} />
            </a>
          </div>

          {/* Socials */}
          {socials.length > 0 && (
            <div className="mt-6 flex items-center gap-2">
              {socials.map((social) => (
                <a
                  key={`${social.platform}-${social.url}`}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.platform}
                  title={social.platform}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/4 text-slate-400 transition-all hover:-translate-y-0.5 hover:border-acc/60 hover:text-acc hover:glow-sm"
                >
                  <Icon name={social.icon || social.platform} className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Right: portrait frame (on mobile displays first, balanced compact height) */}
        <div className="order-1 lg:order-2 w-full max-w-[320px] sm:max-w-[380px] lg:max-w-[420px] mx-auto lg:ml-auto">
          <div className="hud overflow-hidden">
            {/* Window chrome */}
            <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/5 bg-white/3">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
              <span className="mono ml-auto text-[10px] text-slate-500">~/profile</span>
            </div>

            {hero.portraitUrl ? (
              <div className="relative aspect-square sm:aspect-[4/4.2] w-full overflow-hidden">
                <Image
                  src={hero.portraitUrl}
                  alt={hero.name}
                  fill
                  priority
                  sizes="(max-width: 640px) 320px, (max-width: 1024px) 380px, 420px"
                  className="object-cover object-top"
                />
                {/* Scanline effect */}
                <div className="scanline" />
                {/* Bottom fade */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#03050f] to-transparent" />
              </div>
            ) : (
              <div className="grid aspect-square sm:aspect-[4/4.2] w-full place-items-center">
                <span className="text-6xl text-acc/30">{"</>"}</span>
              </div>
            )}
          </div>

          {/* Tagline */}
          {hero.tagline && (
            <p className="mt-2 text-center lg:text-right font-mono text-xs sm:text-sm text-slate-400 italic">
              &ldquo;{hero.tagline}&rdquo;
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
