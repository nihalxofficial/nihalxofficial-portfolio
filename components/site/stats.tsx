import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { SectionMeta, Statistic } from "@/lib/types";

/** Numbers Speak — a single strip of metric cards. */
export function Stats({
  statistics,
  section,
  index,
}: {
  statistics: Statistic[];
  section?: SectionMeta;
  index: number;
}) {
  if (statistics.length === 0) return null;

  return (
    <section id="stats" className="relative">
      <div className="container-page">
        <Reveal>
          <SectionHeading
            index={index}
            label={section?.label || "Numbers Speak"}
            title={section?.heading || "Numbers Speak"}
            description={section?.description || "A few stats from my journey so far."}
          />
        </Reveal>

        <Reveal delay={80}>
          <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3 lg:grid-cols-5">
            {statistics.map((stat) => (
              <div
                key={stat._id}
                className="group relative bg-surface/80 px-5 py-6 transition-colors hover:bg-surface-2"
              >
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px scale-x-0 grad-accent transition-transform duration-300 group-hover:scale-x-100"
                />
                <span className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-accent/10 text-accent">
                  <Icon name={stat.icon} className="h-4 w-4" />
                </span>
                <p className="mt-4 text-2xl font-semibold leading-none text-gradient sm:text-[1.7rem]">
                  {stat.value}
                </p>
                <p className="mt-1.5 text-xs font-medium text-ink">{stat.label}</p>
                {stat.description ? (
                  <p className="mt-1 text-[11px] leading-snug text-faint">{stat.description}</p>
                ) : null}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
