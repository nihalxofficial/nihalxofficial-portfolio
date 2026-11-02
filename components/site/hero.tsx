"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import { RotatingTypewriter } from "@/components/ui/rotating-typewriter";
import { TerminalText } from "@/components/ui/terminal-text";
import { WindowBar } from "@/components/ui/panel-chrome";
import { Typewriter } from "@/components/ui/typewriter";
import { tokenizeCommand, tokenizeOutput } from "@/lib/terminal";
import type { Hero as HeroContent, SiteSettings } from "@/lib/types";

/** Entrance choreography: the copy rises in, the portrait follows. */
const stack: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const slideIn: Variants = {
  hidden: { opacity: 0, x: 26, y: 14 },
  show: { opacity: 1, x: 0, y: 0, transition: { duration: 0.6, ease: "easeOut", delay: 0.15 } },
};

/**
 * Hero: greeting, name, role and calls to action on the left; the portrait in a
 * monitor-style frame with a typing `whoami` session and the handwritten
 * tagline on the right — all of it from the Hero document.
 */
export function Hero({
  hero,
  settings,
}: {
  hero: HeroContent;
  settings: SiteSettings | null;
}) {
  // Same dashboard links as the contact section and footer; rows without a URL
  // are still drafts, so they stay hidden.
  const socials = (settings?.socialLinks ?? []).filter((link) => link.url);
  const command = hero.terminal?.command || "whoami";
  const terminalLines = (hero.terminal?.lines ?? []).slice(0, 5);
  const rotatorLines = (hero.rotator?.lines ?? []).filter((line) => line.trim());
  // The role line *is* the typewriter: cycle the dashboard rotator, and fall
  // back to the static role when no phrases have been entered yet.
  const roleLines =
    rotatorLines.length > 0 ? rotatorLines : [hero.role].filter((line) => line?.trim());
  const secondaryHref = hero.secondaryCta?.href || "#contact";
  const secondaryExternal = /^https?:\/\//i.test(secondaryHref);

  return (
    <section id="hero" className="relative overflow-hidden pb-20 pt-28 sm:pt-32 lg:pb-28 lg:pt-36">
      {/* Backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 grid-backdrop radial-fade opacity-70" />
        <div className="absolute left-1/2 top-0 h-[520px] w-[820px] -translate-x-1/2 glow-soft opacity-80" />
        <div className="absolute -right-32 top-40 h-[380px] w-[380px] rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute inset-0 noise opacity-40" />
      </div>

      <div className="container-page grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        <motion.div variants={stack} initial="hidden" animate="show">
          <motion.p variants={rise} className="eyebrow flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            {hero.greeting || "Hi, I'm"}
          </motion.p>

          <motion.h1
            variants={rise}
            className="mt-4 text-[2.6rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-[4.1rem]"
          >
            {hero.name}{" "}
            {hero.highlightedName ? (
              <span className="text-gradient">{hero.highlightedName}</span>
            ) : null}
          </motion.h1>

          <motion.div
            variants={rise}
            className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1"
          >
            <span className="rule-grad h-px w-10" />
            <p className="text-lg font-medium sm:text-xl">
              <RotatingTypewriter lines={roleLines} className="text-accent" />
            </p>
          </motion.div>

          <motion.p
            variants={rise}
            className="mt-5 max-w-xl text-sm leading-relaxed text-muted sm:text-base"
          >
            {hero.description}
          </motion.p>

          <motion.div variants={rise} className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={hero.primaryCta?.href || "#projects"}
              className="group inline-flex items-center gap-2 rounded-lg grad-accent px-6 py-3 text-sm font-semibold text-accent-ink shadow-[0_10px_30px_-12px_var(--accent-glow)] transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
            >
              {hero.primaryCta?.label || "View my work"}
              <Icon
                name="ArrowUpRight"
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>

            <a
              href={secondaryHref}
              target={secondaryExternal ? "_blank" : undefined}
              download={secondaryExternal ? undefined : true}
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-lg border border-line-strong px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent active:scale-[0.98]"
            >
              {hero.secondaryCta?.label || "Download CV"}
              <Icon
                name="Download"
                className="h-4 w-4 transition-transform group-hover:translate-y-0.5"
              />
            </a>
          </motion.div>

          <motion.div
            variants={rise}
            className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3"
          >
            {socials.length > 0 ? (
              <div className="flex items-center gap-2">
                {socials.map((social) => (
                  <a
                    key={`${social.platform}-${social.url}`}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.platform}
                    title={social.platform}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface/50 text-muted transition-all hover:-translate-y-0.5 hover:border-accent/60 hover:text-accent hover:shadow-[0_0_22px_-8px_var(--accent-glow)]"
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
          </motion.div>
        </motion.div>

        {/* Portrait + live session */}
        <motion.div
          variants={slideIn}
          initial="hidden"
          animate="show"
          className="relative mx-auto w-full max-w-sm lg:max-w-md"
        >
          <div aria-hidden className="absolute -inset-8 -z-10 rounded-[3rem] glow-soft" />

          <div className="border-grad rounded-[1.7rem] p-px">
            <div className="relative overflow-hidden rounded-[1.62rem] bg-surface-2">
              <div aria-hidden className="absolute inset-0 grid-backdrop opacity-40" />

              <div className="absolute inset-x-0 top-0 z-10 flex items-center gap-1.5 px-4 py-3">
                <span className="h-2 w-2 rounded-full bg-danger/70" />
                <span className="h-2 w-2 rounded-full bg-warning/70" />
                <span className="h-2 w-2 rounded-full bg-success/70" />
                <span className="mono ml-auto text-[10px] uppercase tracking-[0.2em] text-faint">
                  ~/profile
                </span>
              </div>

              {hero.portraitUrl ? (
                <Image
                  src={hero.portraitUrl}
                  alt={hero.name}
                  width={900}
                  height={1000}
                  priority
                  sizes="(max-width: 1024px) 90vw, 440px"
                  className="relative aspect-[4/5] w-full object-cover object-top"
                />
              ) : (
                <div className="grid aspect-[4/5] w-full place-items-center">
                  <Icon name="Terminal" className="h-16 w-16 text-accent/40" />
                </div>
              )}

              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[color-mix(in_oklab,var(--background)_92%,transparent)] to-transparent"
              />
              <div
                aria-hidden
                className="scanline pointer-events-none absolute inset-0 opacity-40"
              />
            </div>
          </div>

          {hero.tagline ? (
            <motion.p
              initial={{ opacity: 0, rotate: -14, y: -6 }}
              animate={{ opacity: 1, rotate: -6, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="script absolute -top-4 right-1 text-2xl leading-none text-accent sm:text-3xl lg:-right-6 lg:-top-6"
            >
              {hero.tagline}
            </motion.p>
          ) : null}

          {/* Terminal card: in flow on mobile, overlapping the frame from sm up */}
          <div className="code-window relative z-10 mt-4 w-full sm:absolute sm:-bottom-10 sm:-left-6 sm:mt-0 sm:w-[min(21rem,88%)] lg:-left-12">
            <WindowBar title={`${command} · session`} />
            <div className="px-4 py-3.5">
              <p className="mono text-[11px]">
                <span className="text-accent">$</span>{" "}
                <TerminalText tokens={tokenizeCommand(command)} className="text-ink" />
              </p>
              <div className="mt-1.5">
                <Typewriter lines={terminalLines} tokenize={tokenizeOutput} className="text-muted" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="pointer-events-none absolute bottom-5 left-1/2 hidden -translate-x-1/2 lg:block"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="mono text-[10px] uppercase tracking-[0.24em] text-faint">scroll</span>
          <motion.span
            animate={{ y: [0, 9, 0], opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="block h-6 w-px bg-accent/60"
          />
        </div>
      </motion.div>
    </section>
  );
}
