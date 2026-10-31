import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Experience, SectionMeta } from "@/lib/types";
import { cn, formatMonth } from "@/lib/utils";

const STATUS: Record<string, { label: string; className: string }> = {
  current: { label: "Current", className: "border-success/40 bg-success/10 text-success" },
  ongoing: { label: "Ongoing", className: "border-accent/40 bg-accent/10 text-accent" },
  upcoming: { label: "Upcoming", className: "border-warning/40 bg-warning/10 text-warning" },
  completed: { label: "Completed", className: "border-line bg-surface-2 text-faint" },
};

function period(entry: Experience): string {
  const start = formatMonth(entry.startDate) || entry.startDate;
  const end = entry.isCurrent ? "Present" : formatMonth(entry.endDate) || entry.endDate;
  if (!start && !end) return "";
  return [start, end].filter(Boolean).join(" — ");
}

/** Journey — vertical timeline of roles, internships and milestones. */
export function Journey({
  experience,
  section,
  index,
}: {
  experience: Experience[];
  section?: SectionMeta;
  index: number;
}) {
  if (experience.length === 0) return null;

  return (
    <section id="journey" className="relative section-pad">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px rule-grad" />

      <div className="container-page">
        <Reveal>
          <SectionHeading
            index={index}
            label={section?.label || "Experience"}
            title={section?.heading || "My Journey"}
            description={
              section?.description ||
              "Where I have worked, what I shipped there and what I am working on now."
            }
          />
        </Reveal>

        <div className="relative mt-10 pl-6 sm:pl-8">
          {/* Rail */}
          <span
            aria-hidden
            className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-accent/60 via-line to-transparent sm:left-[11px]"
          />

          <ol className="space-y-5">
            {experience.map((entry, position) => {
              const status = STATUS[entry.status] ?? STATUS.completed;
              const range = period(entry);

              return (
                <li key={entry._id} className="relative">
                  <span
                    aria-hidden
                    className="absolute -left-6 top-5 grid h-3.5 w-3.5 place-items-center rounded-full border border-accent/50 bg-page sm:-left-8"
                  >
                    <span className="h-1.5 w-1.5 rounded-full grad-accent" />
                  </span>

                  <Reveal delay={position * 70}>
                    <div className="panel panel-hover p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-[15px] font-semibold text-ink">{entry.role}</h3>
                          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-accent">
                            <span className="inline-flex items-center gap-1.5">
                              <Icon name="Building" className="h-3.5 w-3.5" />
                              {entry.organization}
                            </span>
                            {entry.location ? (
                              <span className="inline-flex items-center gap-1.5 text-faint">
                                <Icon name="MapPin" className="h-3 w-3" />
                                {entry.location}
                              </span>
                            ) : null}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-1.5">
                          <span
                            className={cn(
                              "mono rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.16em]",
                              status.className,
                            )}
                          >
                            {status.label}
                          </span>
                          {range ? (
                            <span className="mono text-[10.5px] text-faint">{range}</span>
                          ) : null}
                        </div>
                      </div>

                      {entry.description ? (
                        <p className="mt-3 text-[13px] leading-relaxed text-muted">
                          {entry.description}
                        </p>
                      ) : null}

                      {entry.responsibilities.length > 0 ? (
                        <ul className="mt-3 space-y-1.5">
                          {entry.responsibilities.map((item) => (
                            <li key={item} className="flex gap-2 text-[12.5px] text-muted">
                              <span className="mt-[3px] text-accent">▹</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}

                      {entry.technologies.length > 0 ? (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {entry.technologies.map((tech) => (
                            <span
                              key={tech}
                              className="rounded-md border border-line bg-accent/5 px-2 py-0.5 text-[10.5px] text-accent/90"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
