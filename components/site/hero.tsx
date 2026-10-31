import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import type { Hero as HeroContent, SiteSettings } from "@/lib/types";
import { Reveal } from "@/components/ui/reveal";

/**
 * Hero: name, role and two calls to action on the left; portrait plus a
 * "whoami" terminal card on the right, over the gradient grid backdrop.
 */
export function Hero({
  hero,
  settings,
}: {
  hero: HeroContent;
  settings: SiteSettings | null;
}) {
  const socials = settings?.socialLinks ?? [];

  return (
    <section id="hero" className="relative overflow-hidden pb-16 pt-28 sm:pt-32 lg:pb-24 lg:pt-36">
      {/* Backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 grid-backdrop radial-fade opacity-70" />
        <div className="absolute left-1/2 top-0 h-[520px] w-[820px] -translate-x-1/2 glow-soft opacity-80" />
        <div className="absolute -right-32 top-40 h-[380px] w-[380px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="container-page grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <div>
          <Reveal>
            <p className="mono flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-accent">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              {hero.greeting || "Hi, I'm"}
            </p>
          </Reveal>

          <Reveal delay={60}>
            <h1 className="mt-4 text-[2.6rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-[4.2rem]">
              {hero.name}{" "}
              {hero.highlightedName ? (
                <span className="text-gradient">{hero.highlightedName}</span>
              ) : null}
            </h1>
          </Reveal>

          <Reveal delay={120}>
            <p className="mt-4 text-lg font-medium text-accent sm:text-xl">{hero.role}</p>
          </Reveal>

          <Reveal delay={180}>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
              {hero.description}
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={hero.primaryCta?.href || "#projects"}
                className="group inline-flex items-center gap-2 rounded-lg grad-accent px-6 py-3 text-sm font-semibold text-accent-ink shadow-[0_10px_30px_-12px_var(--accent-glow)] transition-transform hover:-translate-y-0.5"
              >
                {hero.primaryCta?.label || "View my work"}
                <Icon name="ArrowUpRight" className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>

              <a
                href={hero.secondaryCta?.href || "/Nihal_Full_Stack_Developer_Resume.pdf"}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-lg border border-line-strong px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
              >
                {hero.secondaryCta?.label || "Download CV"}
                <Icon name="Download" className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
              </a>
            </div>
          </Reveal>

          <Reveal delay={300}>
            <div className="mt-9 flex flex-wrap items-center gap-5">
              {socials.length > 0 ? (
                <div className="flex items-center gap-2">
                  {socials.map((social) => (
                    <a
                      key={social.url}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.platform}
                      className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface/50 text-muted transition-all hover:-translate-y-0.5 hover:border-line-strong hover:text-accent"
                    >
                      <Icon name={social.icon || social.platform} className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              ) : null}

              {hero.availability?.isAvailable ? (
                <span className="inline-flex items-center gap-2 text-xs text-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_10px] shadow-success/60" />
                  {hero.availability.label}
                </span>
              ) : null}
            </div>
          </Reveal>
        </div>

        {/* Portrait + terminal */}
        <Reveal delay={200} className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="relative">
            <div aria-hidden className="absolute -inset-6 -z-10 rounded-[2rem] glow-soft" />

            <div className="relative overflow-hidden rounded-[1.4rem] border border-line bg-surface">
              <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-danger/70" />
                  <span className="h-2 w-2 rounded-full bg-warning/70" />
                  <span className="h-2 w-2 rounded-full bg-success/70" />
                </div>
                <span className="mono text-[10px] uppercase tracking-[0.2em] text-faint">
                  ~/profile
                </span>
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-page via-page/20 to-transparent" />

              {hero.portraitUrl ? (
                <Image
                  src={hero.portraitUrl}
                  alt={hero.name}
                  width={760}
                  height={900}
                  priority
                  sizes="(max-width: 1024px) 90vw, 460px"
                  className="aspect-[4/5] w-full object-cover object-top"
                />
              ) : (
                <div className="grid aspect-[4/5] w-full place-items-center bg-surface-2">
                  <Icon name="Terminal" className="h-16 w-16 text-accent/40" />
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="rounded-xl border border-line bg-[color-mix(in_oklab,var(--background)_86%,transparent)] p-3.5 backdrop-blur-md">
                  <p className="mono text-[11px] text-faint">
                    <span className="text-accent">$</span> {hero.terminal?.command || "whoami"}
                  </p>
                  <div className="mt-1.5 space-y-0.5">
                    {(hero.terminal?.lines ?? []).slice(0, 4).map((line) => (
                      <p key={line} className="mono text-[11px] text-muted">
                        <span className="text-accent/60">→</span> {line}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
