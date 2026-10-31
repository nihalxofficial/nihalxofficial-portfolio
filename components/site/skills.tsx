import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { SkillGrid } from "@/components/site/skill-grid";
import type { SectionMeta, SkillGroup } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Skills — one card per category. The group with the most entries becomes the
 * wide tile grid (Tech Stack), the rest sit beside it as compact rows
 * (Other Tools), exactly as in the reference.
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

  // The API returns groups alphabetically; the reference leads with the big
  // one, so the largest group always takes the wide tile column on the left.
  const ordered = [...groups].sort((a, b) => b.skills.length - a.skills.length);

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
          {ordered.map((group, groupIndex) => (
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

                <SkillGrid
                  skills={group.skills}
                  layout={groupIndex === 0 ? "tiles" : "rows"}
                  columns="grid-cols-3 sm:grid-cols-4 xl:grid-cols-6"
                />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
