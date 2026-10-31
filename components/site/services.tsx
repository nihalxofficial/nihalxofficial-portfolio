import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { SectionMeta, Service } from "@/lib/types";

/** Services — what I do, one card per discipline. */
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
        <Reveal>
          <SectionHeading
            index={index}
            label={section?.label || "What I Do"}
            title={section?.heading || "Services I offer"}
            description={
              section?.description ||
              "From the first schema to the final deploy — I build and ship the whole thing."
            }
          />
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, position) => (
            <Reveal key={service._id} delay={position * 60}>
              <div className="panel panel-hover group relative h-full overflow-hidden p-5">
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-px scale-x-0 grad-accent transition-transform duration-500 group-hover:scale-x-100"
                />

                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-accent/10 text-accent transition-colors group-hover:border-line-strong">
                    <Icon name={service.icon} className="h-5 w-5" />
                  </span>
                  <span className="mono text-[10px] tracking-[0.2em] text-faint">
                    {String(position + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3 className="mt-5 text-[15px] font-semibold text-ink">{service.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">{service.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
