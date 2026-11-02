import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import type { SectionMeta, Service } from "@/lib/types";

/** Services — HUD dark card grid, one card per discipline. */
export function Services({
  services,
  section,
  index,
}: {
  services: Service[];
  section?: SectionMeta;
  index: number;
}) {
  if (services.length === 0) return null;

  return (
    <section id="services" className="relative section-pad">
      <div className="container-page">
        {/* View header */}
        <Reveal>
          <div className="mb-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-acc/70">
              // services
            </p>
            <h2 className="mt-1 text-[1.7rem] font-bold leading-[1.15] tracking-tight text-white sm:text-[2rem]">
              {section?.heading?.split(" ").slice(0, -1).join(" ") || "What I"}{" "}
              <span className="text-grad">
                {section?.heading?.split(" ").slice(-1)[0] || "Offer"}
              </span>
            </h2>
            {section?.description && (
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{section.description}</p>
            )}
          </div>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, position) => (
            <Reveal key={service._id} delay={position * 60}>
              <div className="hud hud-hover group relative h-full overflow-hidden p-5">
                {/* Top accent line on hover */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-px scale-x-0 bg-grad transition-transform duration-500 group-hover:scale-x-100"
                />

                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl border border-acc/20 bg-acc/10 text-acc transition-colors group-hover:border-acc/40">
                    <Icon name={service.icon} className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.2em] text-slate-600">
                    {String(position + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3 className="mt-5 text-[15px] font-semibold text-white">{service.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-400">{service.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
