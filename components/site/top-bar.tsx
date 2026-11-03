"use client";

import {
  Command,
  Dna,
  Palette,
  Search,
  Send,
} from "lucide-react";
import { useLenis } from "@/components/providers/smooth-scroll";
import { BrandLogo } from "@/components/ui/brand-logo";
import { NbLogo } from "@/components/ui/nb-logo";
import { ACCENTS } from "@/components/site/accent-context";
import type { BackgroundMode } from "@/components/site/site-background";
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
  bgMode?: BackgroundMode;
  setBgMode?: (mode: BackgroundMode) => void;
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
  bgMode = "dna",
  setBgMode,
}: TopBarProps) {
  const { scrollTo } = useLenis();
  const cycleBg = () => {
    if (!setBgMode) return;
    const next: BackgroundMode = bgMode === "dna" ? "rain" : bgMode === "rain" ? "none" : "dna";
    setBgMode(next);
  };
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
          scrollTo(0, { duration: 1.25 });
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
          <NbLogo size={42} className="glow-sm group-hover:glow" />
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

        {/* Dynamic Background Effect selector (DNA / Rain / Off) */}
        {setBgMode && (
          <button
            onClick={cycleBg}
            title={`Background: ${
              bgMode === "dna"
                ? "DNA Neural Mesh (Default)"
                : bgMode === "rain"
                ? "Matrix Code Rain"
                : "Minimal Grid"
            }`}
            className="flex items-center gap-1 sm:gap-1.5 hud !rounded-full px-2 sm:px-2.5 py-1.5 font-mono text-[10px] sm:text-[11px] text-slate-300 hover:text-acc hover:border-acc/40 transition cursor-pointer shrink-0"
          >
            <Dna size={13} className="text-acc" />
            <span className="font-bold uppercase tracking-wider text-[9.5px] sm:text-[10px]">
              {bgMode === "dna" ? "DNA" : bgMode === "rain" ? "Rain" : "Grid"}
            </span>
          </button>
        )}

        {/* Accent color picker */}
        <div className="flex items-center gap-1 sm:gap-1.5 hud !rounded-full px-1.5 sm:px-2.5 py-1 sm:py-2 shrink-0" title="Accent color">
          <Palette size={12} className="text-slate-400 mr-0.5 sm:mr-1 hidden xs:block" />
          {ACCENTS.map((a) => (
            <button
              key={a.id}
              onClick={() => setAccentId(a.id)}
              aria-label={a.name}
              title={a.name}
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full cursor-pointer transition ${
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
          className="btn-primary rounded-lg px-2.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0"
        >
          <span className="hidden sm:inline">Let&apos;s Talk</span>
          <Send size={13} />
        </button>
      </div>
    </header>
  );
}
