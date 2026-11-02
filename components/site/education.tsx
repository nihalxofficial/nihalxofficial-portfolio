import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import type { Education as EducationEntry } from "@/lib/types";

/** Education column — HUD card per qualification. */
export function EducationCards({ education }: { education: EducationEntry[] }) {
  return (
    <div className="mt-6 flex h-full flex-col gap-4">
      {education.map((entry, position) => (
        <Reveal key={entry._id} className="flex flex-1" delay={position * 70}>
          <article className="hud hud-hover relative flex h-full flex-col overflow-hidden p-5 transition w-full">
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-acc/10 ring-acc text-acc">
                <Icon name={entry.icon || "GraduationCap"} className="h-5 w-5" />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="text-[15px] font-semibold leading-snug">{entry.degree}</h3>
                  {entry.period && (
                    <span className="font-mono rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] uppercase tracking-widest text-slate-500">
                      {entry.period}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-[13px] text-acc">{entry.institution}</p>
                {entry.field && (
                  <p className="mt-0.5 text-[12px] text-slate-500">{entry.field}</p>
                )}
              </div>
            </div>

            {entry.description && (
              <p className="mt-4 text-[13px] leading-relaxed text-slate-400">{entry.description}</p>
            )}

            {entry.highlights.length > 0 && (
              <>
                <span aria-hidden className="flex-1" />
                <div className="mt-4 border-t border-white/5 pt-4">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                    Key Subjects
                  </p>
                  <ul className="mt-2.5 grid gap-1.5 sm:grid-cols-2">
                    {entry.highlights.map((subject) => (
                      <li key={subject} className="flex items-start gap-2 text-[12.5px] text-slate-400">
                        <span className="mt-[1px] text-acc shrink-0">▸</span>
                        <span>{subject}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            <Icon
              name="GraduationCap"
              aria-hidden
              className="pointer-events-none absolute -bottom-4 -right-3 h-20 w-20 text-acc/[0.06]"
            />
          </article>
        </Reveal>
      ))}
    </div>
  );
}
