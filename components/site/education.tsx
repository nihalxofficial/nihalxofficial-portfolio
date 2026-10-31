import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import type { Education as EducationEntry } from "@/lib/types";

/**
 * Education column — one card per qualification.
 *
 * Rendered inside the shared Journey/Education section, so it carries no
 * heading of its own; the line-art cap is decoration behind the last card.
 * The column stretches to meet the timeline beside it, which keeps the two
 * halves of the section the same length: `flex-1` on the cards absorbs the
 * spare height and the key-subjects block pins to the bottom.
 */
export function EducationCards({ education }: { education: EducationEntry[] }) {
  return (
    <div className="mt-8 flex h-full flex-col gap-4">
      {education.map((entry, position) => (
        <Reveal key={entry._id} className="flex flex-1" delay={position * 70}>
          <article className="panel panel-hover relative flex h-full flex-col overflow-hidden p-5">
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-line bg-accent/10 text-accent">
                <Icon name={entry.icon || "GraduationCap"} className="h-5 w-5" />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="text-[15px] font-semibold leading-snug text-ink">
                    {entry.degree}
                  </h3>
                  {entry.period ? (
                    <span className="mono rounded-full border border-line bg-surface-2 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.14em] text-faint">
                      {entry.period}
                    </span>
                  ) : null}
                </div>

                <p className="mt-1.5 text-[13px] text-accent">{entry.institution}</p>
                {entry.field ? (
                  <p className="mt-0.5 text-[12px] text-faint">{entry.field}</p>
                ) : null}
              </div>
            </div>

            {entry.description ? (
              <p className="mt-4 text-[13px] leading-relaxed text-muted">{entry.description}</p>
            ) : null}

            {entry.highlights.length > 0 ? (
              <>
                {/* Absorbs whatever height the stretched card has, so the subjects
                    sit at the bottom without losing their gap when it doesn't. */}
                <span aria-hidden className="flex-1" />
                <div className="mt-4 border-t border-line pt-4">
                  <p className="mono text-[10px] uppercase tracking-[0.18em] text-faint">
                    Key Subjects
                  </p>
                  <ul className="mt-2.5 grid gap-1.5 sm:grid-cols-2">
                    {entry.highlights.map((subject) => (
                      <li
                        key={subject}
                        className="flex items-start gap-2 text-[12.5px] text-muted"
                      >
                        <span className="mt-[1px] text-accent">▸</span>
                        <span>{subject}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : null}

            <Icon
              name="GraduationCap"
              aria-hidden
              className="pointer-events-none absolute -bottom-4 -right-3 h-20 w-20 text-accent/[0.07]"
            />
          </article>
        </Reveal>
      ))}
    </div>
  );
}
