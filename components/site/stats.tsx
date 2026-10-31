import { Icon } from "@/components/ui/icon";
import { WindowBar } from "@/components/ui/panel-chrome";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatValue } from "@/components/site/stat-value";
import type { SectionMeta, Statistic } from "@/lib/types";

/** Values without digits (`∞`, `Ongoing`) get their own card treatment. */
function isCountable(value: string): boolean {
  return /\d/.test(value);
}

/** Numbers Speak — metric cards that tick up on entry, plus the goals source. */
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

  const goals = section?.items ?? [];

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

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.62fr_1fr] lg:items-start">
          <Reveal delay={80}>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {statistics.map((stat) => {
                const countable = isCountable(stat.value);
                return (
                  <div
                    key={stat._id}
                    className="group relative overflow-hidden rounded-xl border border-line bg-surface/70 p-5 transition-colors hover:border-accent/40 hover:bg-surface"
                  >
                    <span
                      aria-hidden
                      className="absolute inset-x-0 top-0 h-px scale-x-0 grad-accent transition-transform duration-300 group-hover:scale-x-100"
                    />
                    {countable ? null : (
                      <span aria-hidden className="absolute inset-0 dot-rail opacity-40" />
                    )}

                    <div className="relative flex items-start justify-between gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-accent/10 text-accent transition-transform duration-300 group-hover:-translate-y-0.5">
                        <Icon name={stat.icon} className="h-4 w-4" />
                      </span>
                      <span className="mono text-[9.5px] uppercase tracking-[0.18em] text-faint">
                        {countable ? "count" : "live"}
                      </span>
                    </div>

                    <p className="relative mt-4 text-[1.9rem] font-bold leading-none text-gradient">
                      <StatValue value={stat.value} />
                    </p>
                    <p className="relative mt-2 text-[13px] font-medium text-ink">{stat.label}</p>
                    {stat.description ? (
                      <p className="relative mt-1 text-[11px] leading-snug text-faint">
                        {stat.description}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </Reveal>

          {goals.length > 0 ? (
            <Reveal delay={140}>
              <div className="code-window relative overflow-hidden">
                <WindowBar title="goals.ts" />
                <div className="mono relative px-4 py-4 text-[11.5px] leading-[1.9]">
                  <p className="text-muted">
                    <span className="tk-key">const</span>
                    <span> goals</span>
                    <span className="tk-punc"> = [</span>
                  </p>
                  {goals.map((goal, position) => (
                    <p key={goal} className="pl-4 text-muted">
                      <span className="tk-str">&quot;{goal}&quot;</span>
                      <span className="tk-punc">{position < goals.length - 1 ? "," : ""}</span>
                    </p>
                  ))}
                  <p className="tk-punc">];</p>
                  <p className="mt-3 flex items-center gap-1.5 tk-com">
                    {"// still a work in progress"}
                    <Icon name="Heart" className="h-3 w-3 text-danger" />
                  </p>
                </div>
              </div>
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}
