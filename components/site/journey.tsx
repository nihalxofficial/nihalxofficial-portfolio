"use client";

import { useRef } from "react";
import { motion, useScroll } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import type { Experience } from "@/lib/types";
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

/**
 * Experience timeline column.
 *
 * Rows stay unframed like the reference: the rail carries the structure, so a
 * card around every entry would only add weight. The rail fills as the visitor
 * scrolls it into view, which is what `useScroll` on the list container is for.
 */
export function JourneyTimeline({ experience }: { experience: Experience[] }) {
  const listRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 75%", "end 55%"],
  });

  return (
    <div className="relative mt-8 pl-6 sm:pl-7">
      {/* Track, then the scroll-linked fill on top of it. */}
      <span aria-hidden className="absolute left-[6px] top-2 bottom-2 w-px bg-line" />
      <motion.span
        aria-hidden
        style={{ scaleY: scrollYProgress }}
        className="absolute left-[6px] top-2 bottom-2 w-px origin-top bg-gradient-to-b from-accent via-accent/70 to-accent/25"
      />

      <ol ref={listRef} className="space-y-6">
        {experience.map((entry, position) => {
          const status = STATUS[entry.status] ?? STATUS.completed;
          const range = period(entry);

          return (
            <li key={entry._id} className="relative">
              <span
                aria-hidden
                className="absolute -left-6 top-1 grid h-3.5 w-3.5 place-items-center rounded-full border border-accent/50 bg-page sm:-left-7"
              >
                <span className="h-1.5 w-1.5 rounded-full grad-accent" />
              </span>

              <Reveal delay={position * 70}>
                <div className="group">
                  <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
                    <h3 className="text-[14.5px] font-semibold leading-snug text-ink">
                      {entry.role}
                    </h3>
                    <span
                      className={cn(
                        "mono shrink-0 rounded-full border px-2.5 py-0.5 text-[9.5px] uppercase tracking-[0.14em]",
                        status.className,
                      )}
                    >
                      {status.label}
                    </span>
                  </div>

                  <p className="mt-1 text-[13px] text-accent">{entry.organization}</p>

                  {range || entry.location ? (
                    <p className="mono mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10.5px] text-faint">
                      {range ? <span>{range}</span> : null}
                      {range && entry.location ? <span className="text-line">•</span> : null}
                      {entry.location ? (
                        <span className="inline-flex items-center gap-1">
                          <Icon name="MapPin" className="h-2.5 w-2.5" />
                          {entry.location}
                        </span>
                      ) : null}
                    </p>
                  ) : null}

                  {entry.description ? (
                    <p className="mt-2 max-w-prose text-[12.5px] leading-relaxed text-muted">
                      {entry.description}
                    </p>
                  ) : null}

                  {entry.responsibilities.length > 0 ? (
                    <ul className="mt-2 space-y-1">
                      {entry.responsibilities.map((item) => (
                        <li key={item} className="flex gap-2 text-[12.5px] leading-snug text-muted">
                          <span className="mt-[1px] text-accent">▹</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {entry.technologies.length > 0 ? (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {entry.technologies.map((tech) => (
                        <span key={tech} className="chip">
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
  );
}
