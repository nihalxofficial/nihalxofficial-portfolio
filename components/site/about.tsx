import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { About as AboutContent, SectionMeta } from "@/lib/types";

/** About: narrative on the left, a syntax-coloured "profile object" on the right. */
export function About({
  about,
  section,
  index,
}: {
  about: AboutContent;
  section?: SectionMeta;
  index: number;
}) {
  const card = about.codeCard ?? {};
  const passion = card.passion ?? [];

  // Rendered as a JSON-ish object: keys in sky, values in cyan.
  const entries = [
    ["name", card.name],
    ["role", card.role],
    ["location", card.location],
    ["education", card.education],
    ["experience", card.experience],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

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
                      className="flex items-start gap-3 rounded-xl border border-line bg-surface/40 px-3.5 py-3"
                    >
                      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-accent/10 text-accent">
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
          </div>

          <Reveal delay={120} className="relative">
            <div aria-hidden className="absolute -inset-5 -z-10 rounded-[2rem] glow-soft opacity-70" />

            <div className="overflow-hidden rounded-2xl border border-line bg-surface/70 backdrop-blur">
              <div className="flex items-center gap-1.5 border-b border-line px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
                <span className="mono ml-auto text-[10px] uppercase tracking-[0.18em] text-faint">
                  profile.ts
                </span>
              </div>

              <pre className="mono overflow-x-auto p-5 text-[12px] leading-[1.9] text-muted">
                {entries.map(([key, value]) => (
                  <span key={key}>
                    {"\n  "}
                    <span className="text-sky-400">&quot;{key}&quot;</span>
                    <span className="text-faint">: </span>
                    <span className="text-accent">&quot;{value}&quot;</span>
                    <span className="text-faint">,</span>
                  </span>
                ))}
                {passion.length > 0 ? (
                  <>
                    {"\n  "}
                    <span className="text-sky-400">&quot;passion&quot;</span>
                    <span className="text-faint">: [</span>
                    {passion.map((item, position) => (
                      <span key={item}>
                        <span className="text-accent">&quot;{item}&quot;</span>
                        {position < passion.length - 1 ? <span className="text-faint">, </span> : null}
                      </span>
                    ))}
                    <span className="text-faint">]</span>
                  </>
                ) : null}
                {"\n"}
                <span className="text-faint">{"}"}</span>
              </pre>
            </div>

            {about.signature ? (
              <p className="absolute -bottom-8 right-2 -rotate-3 font-[cursive] text-lg text-accent/80">
                {about.signature}
              </p>
            ) : null}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
