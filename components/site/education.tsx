import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Certification, Education as EducationEntry, SectionMeta } from "@/lib/types";

/** Education — degree cards with key subjects, then any certifications. */
export function Education({
  education,
  certifications,
  section,
  certificationsSection,
  index,
}: {
  education: EducationEntry[];
  certifications: Certification[];
  section?: SectionMeta;
  certificationsSection?: SectionMeta;
  index: number;
}) {
  const showCertifications =
    certifications.length > 0 && (certificationsSection?.isVisible ?? true);

  if (education.length === 0 && !showCertifications) return null;

  return (
    <section id="education" className="relative section-pad">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px rule-grad" />

      <div className="container-page">
        <Reveal>
          <SectionHeading
            index={index}
            label={section?.label || "Education"}
            title={section?.heading || "Academic Background"}
            description={
              section?.description ||
              "The formal side of the journey — everything else I picked up by building."
            }
          />
        </Reveal>

        {education.length > 0 ? (
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
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
                    <p className="mt-4 text-[13px] leading-relaxed text-muted">
                      {entry.description}
                    </p>
                  ) : null}

                  {entry.highlights.length > 0 ? (
                    <div className="mt-4 border-t border-line pt-4">
                      <p className="mono text-[10px] uppercase tracking-[0.18em] text-faint">
                        Key Subjects
                      </p>
                      <ul className="mt-2.5 flex flex-wrap gap-1.5">
                        {entry.highlights.map((subject) => (
                          <li
                            key={subject}
                            className="rounded-md border border-line bg-surface-2/60 px-2 py-0.5 text-[11px] text-muted"
                          >
                            {subject}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </article>
              </Reveal>
            ))}
          </div>
        ) : null}

        {showCertifications ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {certifications.map((item, position) => (
              <Reveal key={item._id} delay={position * 60}>
                <a
                  href={item.credentialUrl || undefined}
                  target={item.credentialUrl ? "_blank" : undefined}
                  rel={item.credentialUrl ? "noopener noreferrer" : undefined}
                  className="panel-alt group flex h-full items-start gap-3 p-4 transition-colors hover:border-line-strong"
                >
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-accent/10 text-accent"
                    style={item.accentColor ? { color: item.accentColor } : undefined}
                  >
                    <Icon name={item.icon || "Award"} className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-medium leading-snug text-ink">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-[11.5px] text-faint">
                      {[item.issuer, item.year].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
