import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { AboutEditor, type CodeFile, type Token } from "@/components/site/about-editor";
import type { About as AboutContent, SectionMeta } from "@/lib/types";

/** Token helpers keep the compiled source below readable. */
const k = (text: string): Token => ({ text, kind: "key" });
const ty = (text: string): Token => ({ text, kind: "type" });
const pr = (text: string): Token => ({ text, kind: "prop" });
const st = (text: string): Token => ({ text, kind: "str" });
const pu = (text: string): Token => ({ text, kind: "punc" });
const cm = (text: string): Token => ({ text, kind: "com" });
const pl = (text: string): Token => ({ text });

/**
 * Turns the About document into two source files: a typed object with the
 * profile facts and a JSON list with the highlight rows.
 */
function toSourceFiles(about: AboutContent): CodeFile[] {
  const card = about.codeCard ?? {};
  const files: CodeFile[] = [];

  const entries: Array<[string, string | string[]]> = [
    ["name", card.name ?? ""],
    ["role", card.role ?? ""],
    ["location", card.location ?? ""],
    ["education", card.education ?? ""],
    ["experience", card.experience ?? ""],
    ["passion", card.passion ?? []],
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

  // A "passion" tab: each dashboard passion word expanded into a short line
  // about coding, learning new things, building and growing.
  const passions = (card.passion ?? []).filter(Boolean);
  if (passions.length > 0) {
    const PHRASES: Record<string, string> = {
      code: "writing clean, readable software",
      coding: "writing clean, readable software",
      learn: "learning something new every day",
      learning: "picking up new tools and ideas",
      build: "turning ideas into real products",
      building: "shipping things people actually use",
      grow: "getting a little better each time",
      problem: "solving problems that actually matter",
      design: "sweating the small UI details",
      teach: "mentoring others and sharing what I know",
      read: "reading docs, code and good writing",
      music: "a good soundtrack while I focus",
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
    // A second, complementary view: the dashboard highlight rows rendered as a
    // typed `contact` record (email, location, status, work mode …) instead of
    // a raw JSON array, so the panel reads as details rather than data.
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

  return (
    <section id="about" className="relative section-pad">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-16">
          <div>
            <Reveal>
              <SectionHeading
                index={index}
                label={section?.label || about.label || "About Me"}
                title={section?.heading || about.heading || "A little about me"}
              />
            </Reveal>

            <Reveal delay={80}>
              <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted sm:text-[0.95rem]">
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
                      className="group flex items-start gap-3 rounded-xl border border-line bg-surface/40 px-3.5 py-3 transition-colors hover:border-accent/45 hover:bg-accent/[0.04]"
                    >
                      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-accent/10 text-accent transition-transform group-hover:scale-110">
                        <Icon name={item.icon} className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0">
                        <span className="mono block text-[10px] uppercase tracking-[0.16em] text-faint">
                          {item.label}
                        </span>
                        <span className="mt-0.5 block text-[13px] leading-snug text-ink">
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
                <p className="script mt-8 -rotate-2 text-2xl text-accent sm:text-[1.7rem]">
                  {about.signature}
                </p>
              </Reveal>
            ) : null}
          </div>

          <Reveal delay={120} className="relative">
            <div
              aria-hidden
              className="absolute -inset-5 -z-10 rounded-[2rem] glow-soft opacity-70"
            />
            <AboutEditor files={files} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
