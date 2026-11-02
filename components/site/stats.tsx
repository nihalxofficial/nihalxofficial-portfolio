import { Icon } from "@/components/ui/icon";
import { StatValue } from "@/components/site/stat-value";
import type { SectionMeta, Statistic } from "@/lib/types";

/** Stats — HUD card grid matching reference OS dark design */
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
    <section id="stats" className="relative py-12">
      {/* Section tag */}
      <p className="eyebrow mb-2 font-mono text-xs text-acc">
        {"// stats"}
      </p>
      <h2 className="text-3xl font-bold mb-8">
        {section?.heading ? (
          <>
            {section.heading.split(" ").slice(0, -1).join(" ")}{" "}
            <span className="text-grad">{section.heading.split(" ").slice(-1)[0]}</span>
          </>
        ) : (
          <>Numbers <span className="text-grad">Speak</span></>
        )}
      </h2>

      {/* HUD inline stats bar */}
      <div className="hud px-2 sm:px-4 py-4 grid grid-cols-2 md:grid-cols-4 gap-y-4 md:divide-x divide-white/10 mb-8">
        {statistics.slice(0, 4).map((stat) => (
          <div key={stat._id} className="flex items-center gap-3 px-4 sm:px-7">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-acc/10 text-acc">
              <Icon name={stat.icon} className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <div className="font-display text-xl font-bold text-grad">
                <StatValue value={stat.value} />
              </div>
              <div className="text-[11px] text-slate-400">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Remaining stats + goals */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statistics.slice(4).map((stat) => (
          <div
            key={stat._id}
            className="hud hud-hover group p-5 transition"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-acc/10 ring-acc text-acc group-hover:glow transition">
                <Icon name={stat.icon} className="h-4 w-4" />
              </span>
              <span className="mono text-[9.5px] uppercase tracking-widest text-slate-600">
                metric
              </span>
            </div>
            <p className="mt-4 text-[1.9rem] font-bold leading-none text-grad">
              <StatValue value={stat.value} />
            </p>
            <p className="mt-2 text-[13px] font-medium">{stat.label}</p>
            {stat.description && (
              <p className="mt-1 text-[11px] leading-snug text-slate-500">
                {stat.description}
              </p>
            )}
          </div>
        ))}

        {/* Goals card */}
        {goals.length > 0 && (
          <div className="hud p-5">
            <p className="mono text-xs text-slate-500 mb-3">{"// goals.ts"}</p>
            <div className="space-y-2">
              {goals.map((goal) => (
                <div key={goal} className="flex items-center gap-2 text-sm text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-acc shrink-0" />
                  {goal}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
