"use client";
import Link from "next/link";
import { BrandLogo } from "@/components/ui/brand-logo";
import { NbLogo } from "@/components/ui/nb-logo";
import { Icon } from "@/components/ui/icon";
import type { NavigationItem, SiteSettings } from "@/lib/types";
import { initials } from "@/lib/utils";

const DEFAULT_STACK = ["Next.js", "Node.js", "MongoDB", "Tailwind CSS", "Framer Motion"];

const DEFAULT_COPY = {
  tagline: "Full-Stack Developer",
  navigationHeading: "Navigate",
  elsewhereHeading: "Elsewhere",
  resumeLabel: "Résumé / CV",
  ctaLabel: "Start a project",
  copyright: "© {year} {name} — all rights reserved",
  builtWith: "Built with",
  description:
    "Building fast, accessible products with a clean, typed codebase from database to interface.",
};

export function Footer({
  settings,
  navigation,
  year,
}: {
  settings: SiteSettings | null;
  navigation: NavigationItem[];
  year: number;
}) {
  const name     = settings?.siteName ?? "Md. Nihal Uddin Bijoy";
  const socials  = (settings?.socialLinks ?? []).filter((link) => link.url);
  const branding = settings?.branding;
  const hasLogo  = Boolean(branding?.footerLogoLight || branding?.footerLogoDark);
  const mark     = branding?.mark?.trim() || initials(name);

  const footer = settings?.footer;
  const copy = {
    tagline: footer?.tagline || DEFAULT_COPY.tagline,
    navigationHeading: footer?.navigationHeading || DEFAULT_COPY.navigationHeading,
    elsewhereHeading: footer?.elsewhereHeading || DEFAULT_COPY.elsewhereHeading,
    resumeLabel: footer?.resumeLabel || DEFAULT_COPY.resumeLabel,
    ctaLabel: footer?.ctaLabel || DEFAULT_COPY.ctaLabel,
    builtWith: footer?.builtWith || DEFAULT_COPY.builtWith,
  };
  const description = footer?.description || settings?.metaDescription || DEFAULT_COPY.description;
  const copyright = (footer?.copyright || DEFAULT_COPY.copyright)
    .replaceAll("{year}", String(year))
    .replaceAll("{name}", name);
  const stack = footer?.stack?.length ? footer.stack : DEFAULT_STACK;

  return (
    <footer className="relative mt-16 border-t border-white/5 pb-24 md:pb-8">
      {/* Top accent line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-acc/40 to-transparent" />

      <div className="py-12 grid grid-cols-2 gap-x-6 gap-y-10 sm:gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        {/* Brand column */}
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-3">
            {hasLogo ? (
              <BrandLogo branding={branding} variant="footer" fallback={mark} alt={name} />
            ) : (
              <>
                <NbLogo size={38} className="glow-sm" />
                <div>
                  <p className="text-sm font-semibold">{name}</p>
                  <p className="font-mono text-[11px] uppercase tracking-widest text-slate-500">
                    {copy.tagline}
                  </p>
                </div>
              </>
            )}
          </div>

          <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-400">
            {description}
          </p>

          {socials.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {socials.map((social) => (
                <a
                  key={`${social.platform}-${social.url}`}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.platform}
                  title={social.platform}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/4 text-slate-400 transition-all hover:-translate-y-0.5 hover:border-acc/60 hover:text-acc"
                >
                  <Icon name={social.icon || social.platform} className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Navigate column */}
        <div className="col-span-1">
          <p className="font-mono text-[10px] uppercase tracking-widest text-acc mb-4">{copy.navigationHeading}</p>
          <ul className="space-y-2.5">
            {navigation.map((item) => (
              <li key={item._id}>
                <a
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    const id = item.href.replace(/^#/, "");
                    const el = document.getElementById(id);
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                    else document.getElementById("stage")?.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="text-sm text-slate-400 hover:text-acc transition-colors"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact column */}
        <div className="col-span-1">
          <p className="font-mono text-[10px] uppercase tracking-widest text-acc mb-4">{copy.elsewhereHeading}</p>
          <ul className="space-y-2.5">
            {settings?.contact?.email && (
              <li>
                <a
                  href={`mailto:${settings.contact.email}`}
                  className="text-sm text-slate-400 hover:text-acc transition-colors"
                >
                  {settings.contact.email}
                </a>
              </li>
            )}
            {settings?.resumeUrl && (
              <li>
                <a
                  href={settings.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-400 hover:text-acc transition-colors"
                >
                  {copy.resumeLabel}
                </a>
              </li>
            )}
            <li>
              <a
                href="#contact"
                onClick={(e) => { e.preventDefault(); document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }); }}
                className="text-sm text-slate-400 hover:text-acc transition-colors"
              >
                {copy.ctaLabel}
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex flex-col gap-4 border-t border-white/5 pt-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
        <p className="font-mono">{copyright}</p>
        <p className="font-mono flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>{copy.builtWith}</span>
          <span className="text-red-500">♥</span>
          <span>&</span>
          {stack.map((item, index) => (
            <span key={item} className="flex items-center gap-2">
              <span className="text-acc/70">{item}</span>
              {index < stack.length - 1 && <span className="text-slate-700">/</span>}
            </span>
          ))}
        </p>
      </div>
    </footer>
  );
}
