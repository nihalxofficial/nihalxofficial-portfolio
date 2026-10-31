"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import type { NavigationItem, SiteBranding } from "@/lib/types";
import { cn, initials } from "@/lib/utils";

/**
 * Sticky header: transparent over the hero, then a blurred gradient bar.
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = navigation
      .map((item) => item.href)
      .filter((href) => href.startsWith("#"))
      .map((href) => href.slice(1));

    const sections = ids
      .map((id) => document.getElementById(id))
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
          ? "border-b border-line bg-[color-mix(in_oklab,var(--background)_82%,transparent)] backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <nav className="container-page flex h-16 items-center justify-between gap-6 md:h-[72px]">
        <Link href="/" className="group flex items-center gap-3" onClick={() => setOpen(false)}>
          <BrandLogo
            branding={branding}
            variant="nav"
            fallback={initials(siteName)}
            alt={siteName}
            className="transition-transform group-hover:scale-[1.02]"
          />
          {hasLogo ? null : (
            <span className="hidden flex-col leading-none sm:flex">
              <span className="text-sm font-semibold text-ink">{siteName}</span>
              <span className="mono mt-1 text-[10px] uppercase tracking-[0.18em] text-faint">
                full-stack developer
              </span>
            </span>
          )}
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navigation.map((item) => {
            const isActive = active === item.href;
            return (
              <Link
                key={item._id}
                href={item.href}
                className={cn(
                  "relative rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive ? "text-accent" : "text-muted hover:text-ink",
                )}
              >
                {item.label}
                <span
                  className={cn(
                    "absolute inset-x-3 -bottom-0.5 h-px grad-accent transition-opacity",
                    isActive ? "opacity-100" : "opacity-0",
                  )}
                />
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="#contact"
            className="hidden rounded-lg grad-accent px-4 py-2.5 text-sm font-semibold text-accent-ink shadow-[0_6px_24px_-8px_var(--accent-glow)] transition-transform hover:-translate-y-0.5 sm:inline-flex"
          >
            Hire me
          </Link>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-line text-ink md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile sheet */}
      <div
        className={cn(
          "overflow-hidden border-t border-line bg-page/95 backdrop-blur-xl transition-[max-height,opacity] duration-300 md:hidden",
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="container-page flex flex-col gap-1 py-4">
          {navigation.map((item) => (
            <Link
              key={item._id}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="#contact"
            onClick={() => setOpen(false)}
            className="mt-2 rounded-lg grad-accent px-4 py-3 text-center text-sm font-semibold text-accent-ink"
          >
            Hire me
          </Link>
        </div>
      </div>
    </header>
  );
}
