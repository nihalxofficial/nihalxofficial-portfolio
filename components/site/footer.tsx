import Link from "next/link";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Icon } from "@/components/ui/icon";
import type { NavigationItem, SiteSettings } from "@/lib/types";
import { initials } from "@/lib/utils";

const STACK = ["Next.js", "Node.js", "MongoDB", "Tailwind CSS", "HeroUI", "Gemini"];

export function Footer({
  settings,
  navigation,
  year,
}: {
  settings: SiteSettings | null;
  navigation: NavigationItem[];
  year: number;
}) {
  const name = settings?.siteName ?? "Md. Nihal Uddin Bijoy";
  const socials = settings?.socialLinks ?? [];
  const branding = settings?.branding;
  const hasLogo = Boolean(branding?.footerLogoLight || branding?.footerLogoDark);

  return (
    <footer className="relative mt-8 border-t border-line">
      <div className="pointer-events-none absolute inset-x-0 -top-px mx-auto h-px w-2/3 rule-grad" />

      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <BrandLogo
                branding={branding}
                variant="footer"
                fallback={initials(name)}
                alt={name}
              />
              {hasLogo ? null : (
                <div>
                  <p className="text-sm font-semibold text-ink">{name}</p>
                  <p className="mono text-[11px] uppercase tracking-[0.16em] text-faint">
                    Full-Stack Developer
                  </p>
                </div>
              )}
            </div>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
              {settings?.metaDescription ||
                "Building fast, accessible products with a clean, typed codebase from database to interface."}
            </p>

            {socials.length > 0 ? (
              <div className="mt-6 flex flex-wrap gap-2">
                {socials.map((social) => (
                  <a
                    key={`${social.platform}-${social.url}`}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.platform}
                    className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface/60 text-muted transition-all hover:-translate-y-0.5 hover:border-line-strong hover:text-accent"
                  >
                    <Icon name={social.icon || social.platform} className="h-4 w-4" />
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <p className="eyebrow">Navigate</p>
            <ul className="mt-4 space-y-2.5">
              {navigation.map((item) => (
                <li key={item._id}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted transition-colors hover:text-accent"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow">Elsewhere</p>
            <ul className="mt-4 space-y-2.5">
              {settings?.contact?.email ? (
                <li>
                  <a
                    href={`mailto:${settings.contact.email}`}
                    className="text-sm text-muted transition-colors hover:text-accent"
                  >
                    {settings.contact.email}
                  </a>
                </li>
              ) : null}
              {settings?.resumeUrl ? (
                <li>
                  <a
                    href={settings.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted transition-colors hover:text-accent"
                  >
                    Résumé
                  </a>
                </li>
              ) : null}
              <li>
                <Link href="/#contact" className="text-sm text-muted transition-colors hover:text-accent">
                  Start a project
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-line pt-6 text-xs text-faint md:flex-row md:items-center md:justify-between">
          <p className="mono">
            © {year} {name} — all rights reserved
          </p>
          <p className="mono flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-muted">Built with</span>
            {STACK.map((item, index) => (
              <span key={item} className="flex items-center gap-2">
                <span className="text-accent/80">{item}</span>
                {index < STACK.length - 1 ? <span className="text-faint/60">/</span> : null}
              </span>
            ))}
          </p>
        </div>
      </div>
    </footer>
  );
}
