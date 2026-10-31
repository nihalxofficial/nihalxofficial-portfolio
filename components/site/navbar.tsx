"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Icon } from "@/components/ui/icon";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import type { NavigationItem, SiteBranding } from "@/lib/types";
import { cn, initials } from "@/lib/utils";

/**
 * Fallback icons for rows created before the field existed, so the header pill
 * never shows a generic sparkle next to "Projects".
 */
const ICON_BY_TARGET: Record<string, string> = {
  hero: "Home",
  about: "User",
  skills: "Wrench",
  services: "Layers",
  projects: "FolderKanban",
  showcase: "Rocket",
  journey: "Briefcase",
  experience: "Briefcase",
  education: "GraduationCap",
  certifications: "Award",
  testimonials: "Quote",
  blog: "Newspaper",
  contact: "Mail",
};

function iconFor(item: NavigationItem): string {
  if (item.icon) return item.icon;
  const target = item.href.replace(/^#/, "").split("/")[0] || "hero";
  return ICON_BY_TARGET[target] ?? "ArrowRight";
}

/**
 * Sticky header in the reference style: brand mark on the left, a floating pill
 * of icon links in the middle, theme toggle and a glowing "Hire Me" pill right.
 * The active section is tracked with an IntersectionObserver.
 */
export function Navbar({
  navigation,
  siteName,
  branding,
}: {
  navigation: NavigationItem[];
  siteName: string;
  branding?: SiteBranding | null;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  const hasLogo = Boolean(branding?.navLogoLight || branding?.navLogoDark);
  const wordmark = branding?.wordmark?.trim() || siteName;
  const [markHead, markTail] = splitWordmark(wordmark);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = navigation
      .map((item) => item.href)
      .filter((href) => href.startsWith("#"))
      .map((href) => document.getElementById(href.slice(1)))
      .filter((element): element is HTMLElement => Boolean(element));

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(`#${visible.target.id}`);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.2, 0.6] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [navigation]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-[60] transition-all duration-300",
        scrolled
          ? "border-b border-line bg-[color-mix(in_oklab,var(--background)_80%,transparent)] backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <nav className="container-page flex h-16 items-center justify-between gap-4 md:h-[74px]">
        {/* Brand */}
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2.5"
          onClick={() => setOpen(false)}
          aria-label={wordmark}
        >
          <BrandLogo
            branding={branding}
            variant="nav"
            fallback={initials(siteName)}
            alt={wordmark}
            className="shadow-[0_0_22px_var(--accent-glow)] transition-transform group-hover:scale-[1.05]"
          />
          {hasLogo ? null : (
            <span className="hidden text-[15px] font-bold tracking-tight text-ink xl:flex">
              {markHead}
              {markTail ? <span className="text-gradient">{markTail}</span> : null}
            </span>
          )}
        </Link>

        {/* Floating pill — desktop */}
        <div className="hidden items-center gap-0.5 rounded-full border border-line bg-surface/70 px-1.5 py-1.5 backdrop-blur-xl lg:flex">
          {navigation.map((item) => {
            const isActive = active === item.href;
            return (
              <Link
                key={item._id}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-all",
                  isActive
                    ? "grad-accent text-accent-ink shadow-[0_0_18px_-4px_var(--accent-glow)]"
                    : "text-muted hover:bg-surface-2 hover:text-ink",
                )}
              >
                <Icon name={iconFor(item)} className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <Link
            href="#contact"
            className="group hidden items-center gap-1.5 rounded-full border border-accent/50 bg-accent/10 px-4 py-2 text-[12.5px] font-semibold text-accent shadow-[0_0_22px_-6px_var(--accent-glow)] transition-all hover:bg-accent/20 hover:shadow-[0_0_26px_-4px_var(--accent-glow)] sm:inline-flex"
          >
            Hire Me
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-line text-ink lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile sheet */}
      <div
        className={cn(
          "overflow-hidden border-t border-line bg-page/95 backdrop-blur-xl transition-[max-height,opacity] duration-300 lg:hidden",
          open ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="container-page flex flex-col gap-1 py-4">
          {navigation.map((item) => {
            const isActive = active === item.href;
            return (
              <Link
                key={item._id}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors",
                  isActive
                    ? "bg-accent/10 text-accent"
                    : "text-muted hover:bg-surface-2 hover:text-ink",
                )}
              >
                <Icon name={iconFor(item)} className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          <Link
            href="#contact"
            onClick={() => setOpen(false)}
            className="mt-2 rounded-xl grad-accent px-4 py-3 text-center text-sm font-semibold text-accent-ink"
          >
            Hire Me →
          </Link>
        </div>
      </div>
    </header>
  );
}

/**
 * Two-tone wordmark ("nihal" + "xofficial") mirroring the two-tone name in the
 * hero. Handles with a space or a short mark are left untouched.
 */
function splitWordmark(value: string): [string, string | null] {
  const trimmed = value.trim();
  if (trimmed.includes(" ") || trimmed.length < 6) return [trimmed, null];
  return [trimmed.slice(0, 5), trimmed.slice(5)];
}
