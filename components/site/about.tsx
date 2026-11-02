"use client";

import { useState } from "react";
import { Gauge, Puzzle, Rocket, ShieldCheck } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { AboutEditor, type CodeFile, type Token } from "@/components/site/about-editor";
import type { About as AboutContent, SectionMeta } from "@/lib/types";

/** Token helpers keep the compiled source below readable. */
const k  = (text: string): Token => ({ text, kind: "key" });
const ty = (text: string): Token => ({ text, kind: "type" });
const pr = (text: string): Token => ({ text, kind: "prop" });
const st = (text: string): Token => ({ text, kind: "str" });
const pu = (text: string): Token => ({ text, kind: "punc" });
const cm = (text: string): Token => ({ text, kind: "com" });
const pl = (text: string): Token => ({ text });

/** Core principles — static reference data (visual design constant) */
const PRINCIPLES = [
  { icon: Puzzle,      t: "Clean Architecture", d: "Modular, testable code that's a joy to extend." },
  { icon: Gauge,       t: "Blazing Performance", d: "Lean bundles, lazy loading and smart caching." },
  { icon: ShieldCheck, t: "Secure by Default",  d: "Validated inputs, safe auth, no shortcuts." },
  { icon: Rocket,      t: "Ship & Iterate",     d: "Small releases, fast feedback, constant polish." },
] as const;

/** Default hobby chips shown when about.codeCard.passion is empty. */
const DEFAULT_HOBBIES = [
  "🎧 Lo-fi coder", "🎮 Gaming", "🚀 Space nerd",
  "📚 Tech books", "☕ Coffee-driven", "🌙 Night owl", "🧩 Puzzle solver",
];

/**
 * Turns the About document into two source files: a typed object with the
 * profile facts and a JSON list with the highlight rows.
 */
function toSourceFiles(about: AboutContent): CodeFile[] {
  const card = about.codeCard ?? {};
  const files: CodeFile[] = [];

  const entries: Array<[string, string | string[]]> = [
    ["name",       card.name ?? ""],
    ["role",       card.role ?? ""],
    ["location",   card.location ?? ""],
    ["education",  card.education ?? ""],
    ["experience", card.experience ?? ""],
    ["passion",    card.passion ?? []],
  ].filter((entry): entry is [string, string | string[]] => Boolean(entry[1]));

  if (entries.length > 0) {
    const lines: Token[][] = [
      [cm("// Compiled from the About entry in the dashboard.")],
      [],
      [k("const"), pl(" developer"), pu(": "), ty("Profile"), pl(" "), pu("= {")],
    ];

    for (const [key, value] of entries) {
      if (Array.isArray(value)) {
        lines.push([
          pl("  "),
          pr(key),
          pu(": ["),
          ...value.flatMap((item, position) => [
            st(`"${item}"`),
            ...(position < value.length - 1 ? [pu(", ")] : []),
          ]),
          pu("],"),
        ]);
      } else {
        lines.push([pl("  "), pr(key), pu(": "), st(`"${value}"`), pu(",")]);
      }
    }

    lines.push([pu("};")], [], [k("export"), pl(" default"), pl(" developer"), pu(";")]);
    files.push({ name: "whoami.ts", lang: "TypeScript", lines });
  }

  const passions = (card.passion ?? []).filter(Boolean);
  if (passions.length > 0) {
    const PHRASES: Record<string, string> = {
      code:     "writing clean, readable software",
      coding:   "writing clean, readable software",
      learn:    "learning something new every day",
      learning: "picking up new tools and ideas",
      build:    "turning ideas into real products",
      building: "shipping things people actually use",
      grow:     "getting a little better each time",
      problem:  "solving problems that actually matter",
      design:   "sweating the small UI details",
      teach:    "mentoring others and sharing what I know",
      read:     "reading docs, code and good writing",
      music:    "a good soundtrack while I focus",
    };

    const lines: Token[][] = [
      [cm("// What keeps me at the keyboard.")],
      [],
      [k("const"), pl(" passions"), pu(" = {")],
    ];

    passions.forEach((item, position) => {
      const key =
        item.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") ||
        `thing_${position}`;
      const note = PHRASES[key] ?? item.toLowerCase();
      const last = position === passions.length - 1;
      lines.push([pl("  "), pr(key), pu(": "), st(`"${note}"`), pu(last ? "" : ",")]);
    });

    lines.push([pu("};")]);
    files.push({ name: "passion.ts", lang: "TypeScript", lines });
  }

  if (about.highlights.length > 0) {
    const lines: Token[][] = [
      [cm("// Reachable — anywhere the work is.")],
      [],
      [k("export const"), pl(" contact"), pu(": "), ty("Record"), pu("<"), ty("string"), pu(", "), ty("string"), pu("> = {")],
    ];

    about.highlights.forEach((item, position) => {
      const key = item.label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || `field_${position}`;
      const last = position === about.highlights.length - 1;
      lines.push([
        pl("  "),
        pr(key),
        pu(": "),
        st(`"${item.value}"`),
        pu(last ? "" : ","),
      ]);
    });

    lines.push([pu("};")]);
    files.push({ name: "contact.ts", lang: "TypeScript", lines });
  }

  return files;
}

/** About: narrative on the left, a tabbed code editor of the same facts on the right. */
export function About({
  about,
  section,
  index,
}: {
  about: AboutContent;
  section?: SectionMeta;
  index: number;
}) {
  const files = toSourceFiles(about);
  // Hobby chips: use passions from DB, fall back to reference defaults
  const hobbies = (about.codeCard?.passion ?? []).filter(Boolean);
  const displayHobbies = hobbies.length > 0 ? hobbies : DEFAULT_HOBBIES;

  return (
    <section id="about" className="relative py-12">
      <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-16">
        <div>
          {/* ViewHeader */}
          <Reveal>
            <p className="eyebrow mb-2 font-mono text-xs text-acc">{"// about me"}</p>
            <h2 className="text-3xl font-bold mb-2">
              {section?.heading ? (
                <>
                  {section.heading.split(" ").slice(0, -1).join(" ")}{" "}
                  <span className="text-grad">{section.heading.split(" ").slice(-1)[0]}</span>
                </>
              ) : (
                <>Who <span className="text-grad">Am I?</span></>
              )}
            </h2>
          </Reveal>

          <Reveal delay={80}>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-300 sm:text-[0.95rem] pl-4 border-l-2 border-acc/30">
              {about.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
          </Reveal>

          {about.highlights.length > 0 ? (
            <Reveal delay={140}>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {about.highlights.map((item) => (
                  <li
                    key={item.label}
                    className="hud hud-hover group flex items-start gap-3 px-3.5 py-3 transition"
                  >
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-acc/10 text-acc transition-transform group-hover:scale-110">
                      <Icon name={item.icon} className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0">
                      <span className="mono block text-[10px] uppercase tracking-widest text-slate-500">
                        {item.label}
                      </span>
                      <span className="mt-0.5 block text-[13px] leading-snug">
                        {item.value}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ) : null}

          {about.signature ? (
            <Reveal delay={200}>
              <p className="script mt-8 -rotate-2 text-2xl text-acc sm:text-[1.7rem]">
                {about.signature}
              </p>
            </Reveal>
          ) : null}
        </div>

        <Reveal delay={120} className="relative">
          <div
            aria-hidden
            className="absolute -inset-5 -z-10 rounded-[2rem] opacity-40"
            style={{
              background:
                "radial-gradient(ellipse at center, color-mix(in srgb, var(--acc) 14%, transparent), transparent 70%)",
            }}
          />
          <AboutEditor files={files} />
        </Reveal>
      </div>

      {/* Core principles — matches reference exactly */}
      <Reveal delay={160}>
        <div className="mt-12">
          <div className="font-mono text-xs text-acc tracking-widest uppercase mb-4">{"// core principles"}</div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {PRINCIPLES.map((p, i) => (
              <div
                key={p.t}
                className="hud hud-hover p-5 rise"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <p.icon size={26} className="text-acc" />
                <div className="mt-3 font-display font-bold">{p.t}</div>
                <div className="text-sm text-slate-400 mt-1">{p.d}</div>
              </div>
            ))}
          </div>

          {/* Hobby / passion chips */}
          <div className="mt-6 flex flex-wrap gap-2">
            {displayHobbies.map((c) => (
              <span key={c} className="chip !cursor-default">{c}</span>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
