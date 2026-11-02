"use client";

import {
  Command,
  Palette,
  Search,
  Send,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { ACCENTS } from "@/components/site/accent-context";
import type { NavigationItem, SiteBranding, SiteSettings } from "@/lib/types";
import { initials } from "@/lib/utils";

/** Breadcrumb file name for each section href key */
const FILE_BY_KEY: Record<string, string> = {
  hero:        "index.tsx",
  about:       "about.md",
  stats:       "stats.json",
  services:    "services.ts",
  skills:      "skills.json",
  projects:    "projects/",
  showcase:    "showcase.tsx",
  journey:     "git.log",
  education:   "education.md",
  testimonials:"testimonials.tsx",
  blog:        "blog.mdx",
  contact:     "contact.sh",
};

function sectionKey(href: string) {
  return href.replace(/^#/, "").split("/")[0] || "hero";
}

interface TopBarProps {
  navigation: NavigationItem[];
  siteName: string;
  branding?: SiteBranding | null;
  activeSection: string;
  accentId: string;
  setAccentId: (id: string) => void;
  openPalette: () => void;
  onHireMeClick: () => void;
}

export function TopBar({
  navigation,
  siteName,
  branding,
  activeSection,
  accentId,
  setAccentId,
  openPalette,
  onHireMeClick,
}: TopBarProps) {
  const mark = branding?.mark?.trim() || initials(siteName);

  // Resolve the breadcrumb file for current active section
  const key = sectionKey(activeSection);
  const file = FILE_BY_KEY[key] ?? "index.tsx";

  const hasCustomLogo = Boolean(branding?.navLogoLight || branding?.navLogoDark);

  return (
    // bg-[#03050f]/60 — matches reference bg-ink/60 (reference --color-ink = #03050f = page bg)
    <header className="relative z-30 h-16 shrink-0 flex items-center gap-3 px-3 sm:px-5 border-b border-white/5 bg-[#03050f]/60 backdrop-blur-xl">
      {/* Brand / logo */}
      <button
        onClick={() => {
          const el = document.getElementById("hero");
          if (el) el.scrollIntoView({ behavior: "smooth" });
          else document.getElementById("stage")?.scrollTo({ top: 0, behavior: "smooth" });
        }}
        className="flex items-center gap-3 cursor-pointer group"
      >
        {hasCustomLogo ? (
          <BrandLogo
            branding={branding}
            variant="nav"
            fallback={mark}
            alt={siteName}
            className="shrink-0"
          />
        ) : (
          <span className="w-11 h-10 rounded-lg grid place-items-center font-black italic text-lg text-grad ring-acc bg-[#070c30] glow-sm group-hover:glow transition">
            {mark}
          </span>
        )}
        <span className="text-left leading-tight hidden sm:block">
          <span className="block font-display font-bold text-sm">{siteName}</span>
          <span className="block text-[11px] text-slate-400 font-mono">Full Stack Developer</span>
        </span>
      </button>

      {/* Breadcrumb path */}
      <div className="hidden lg:flex items-center gap-1 ml-6 font-mono text-xs text-slate-400">
        <span className="text-acc">~</span>/
        <span>portfolio</span>/
        <span key={key} className="rise text-white px-1.5 py-0.5 rounded bg-acc/10 border border-acc/30">
          {file}
        </span>
        <span className="caret text-acc">▌</span>
      </div>

      {/* Right-side controls */}
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        {/* Search / command */}
        <button
          onClick={openPalette}
          className="hidden md:flex items-center gap-2 hud !rounded-lg pl-3 pr-2 py-2 text-xs text-slate-400 hover:text-white cursor-pointer w-56"
        >
          <Search size={14} />
          Search or jump to…
          <span className="ml-auto flex items-center gap-0.5 font-mono text-[10px] border border-white/15 rounded px-1.5 py-0.5">
            <Command size={10} />K
          </span>
        </button>
        <button
          onClick={openPalette}
          className="md:hidden hud !rounded-lg p-2.5 cursor-pointer"
          aria-label="Search"
        >
          <Search size={16} />
        </button>

        {/* Accent color picker */}
        <div className="hidden sm:flex items-center gap-1.5 hud !rounded-full px-2.5 py-2" title="Accent color">
          <Palette size={13} className="text-slate-400 mr-1" />
          {ACCENTS.map((a) => (
            <button
              key={a.id}
              onClick={() => setAccentId(a.id)}
              aria-label={a.name}
              title={a.name}
              className={`w-4 h-4 rounded-full cursor-pointer transition ${
                accentId === a.id
                  ? "scale-125 ring-2 ring-white/80"
                  : "opacity-70 hover:opacity-100"
              }`}
              style={{ background: `linear-gradient(135deg, ${a.a}, ${a.b})` }}
            />
          ))}
        </div>

        {/* Let's Talk CTA */}
        <button
          onClick={onHireMeClick}
          className="btn-primary rounded-lg px-4 py-2.5 text-sm flex items-center gap-2 cursor-pointer"
        >
          <span className="hidden sm:inline">Let&apos;s Talk</span>
          <Send size={14} />
        </button>
      </div>
    </header>
  );
}
