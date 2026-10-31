import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { SectionMeta, SkillGroup } from "@/lib/types";
import { cn } from "@/lib/utils";

const LEVEL_LABEL: Record<string, string> = {
  learning: "Learning",
  familiar: "Familiar",
  advanced: "Advanced",
  expert: "Expert",
};

/**
 * Skills — one card per category, tiles sized so a wide group (Tech Stack)
 * sits beside a narrow one (Other Tools) exactly as in the reference.
 */
export function Skills({
  groups,
  section,
  index,
}: {
  groups: SkillGroup[];
  section?: SectionMeta;
  index: number;
}) {
  if (groups.length === 0) return null;

  return (
    <section id="skills" className="relative section-pad">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px rule-grad" />

      <div className="container-page">
        <Reveal>
          <SectionHeading
            index={index}
            label={section?.label || "Skills & Tools"}
            title={section?.heading || "Skills & Technologies"}
            description={section?.description || "Tools I use to build modern web applications."}
          />
        </Reveal>

        <div
          className={cn(
            "mt-10 grid gap-5",
            groups.length > 1 ? "lg:grid-cols-[1.62fr_1fr]" : "grid-cols-1",
          )}
        >
          {groups.map((group, groupIndex) => (
            <Reveal key={group.category} delay={groupIndex * 90}>
              <div className="panel h-full p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <span className="h-1.5 w-1.5 rounded-full grad-accent" />
                    {group.category}
                  </h3>
                  <span className="mono text-[10px] uppercase tracking-[0.18em] text-faint">
                    {group.skills.length} items
                  </span>
                </div>

                <div className="mt-4 h-px w-full rule-grad opacity-60" />

                <div
                  className={cn(
                    "mt-4 grid gap-2",
                    groupIndex === 0 ? "grid-cols-3 sm:grid-cols-4 xl:grid-cols-6" : "grid-cols-3",
                  )}
                >
                  {group.skills.map((skill) => (
                    <div
                      key={skill.id}
                      title={`${skill.name} — ${LEVEL_LABEL[skill.proficiency] ?? skill.proficiency}`}
                      className="group flex flex-col items-center gap-2 rounded-xl border border-transparent bg-surface-2/50 px-2 py-3 text-center transition-all hover:-translate-y-0.5 hover:border-line hover:bg-surface-2"
                    >
                      <Icon
                        name={skill.icon}
                        className="h-6 w-6 transition-transform group-hover:scale-110"
                        style={{ color: skill.brandColor || "var(--accent)" }}
                      />
                      <span className="text-[11px] font-medium leading-tight text-muted group-hover:text-ink">
                        {skill.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
