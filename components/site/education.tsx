import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import type { Certification, Education as EducationEntry } from "@/lib/types";

/**
 * Education column — degree cards with key subjects, then any certifications.
 *
 * Rendered inside the shared Journey/Education section, so it carries no
 * heading of its own; the line-art cap is decoration behind the last card.
 */
export function EducationCards({
  education,
  certifications,
}: {
  education: EducationEntry[];
  certifications: Certification[];
}) {
  return (
    <div className="mt-8 space-y-4">
      {education.map((entry, position) => (
        <Reveal key={entry._id} delay={position * 70}>
          <article className="panel panel-hover relative h-full overflow-hidden p-5">
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
              <div className="mt-4 border-t border-line pt-4">
                <p className="mono text-[10px] uppercase tracking-[0.18em] text-faint">
                  Key Subjects
                </p>
                <ul className="mt-2.5 grid gap-1.5 sm:grid-cols-2">
                  {entry.highlights.map((subject) => (
                    <li key={subject} className="flex items-start gap-2 text-[12.5px] text-muted">
                      <span className="mt-[1px] text-accent">▸</span>
                      <span>{subject}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <Icon
              name="GraduationCap"
              aria-hidden
              className="pointer-events-none absolute -bottom-4 -right-3 h-20 w-20 text-accent/[0.07]"
            />
          </article>
        </Reveal>
      ))}

      {certifications.length > 0 ? (
        <Reveal delay={education.length * 70}>
          <div className="panel-alt p-5">
            <p className="mono text-[10px] uppercase tracking-[0.18em] text-faint">
              Certifications
            </p>
            <ul className="mt-3 space-y-2.5">
              {certifications.map((item) => (
                <li key={item._id}>
                  <a
                    href={item.credentialUrl || undefined}
                    target={item.credentialUrl ? "_blank" : undefined}
                    rel={item.credentialUrl ? "noopener noreferrer" : undefined}
                    className="group flex items-start gap-3"
                  >
                    <span
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line bg-accent/10 text-accent"
                      style={item.accentColor ? { color: item.accentColor } : undefined}
                    >
                      <Icon name={item.icon || "Award"} className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[13px] font-medium leading-snug text-ink transition-colors group-hover:text-accent">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-[11.5px] text-faint">
                        {[item.issuer, item.year].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      ) : null}
    </div>
  );
}
