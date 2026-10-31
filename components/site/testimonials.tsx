import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { SectionMeta, Testimonial } from "@/lib/types";
import { initials } from "@/lib/utils";

/** Testimonials — quotes from people I have shipped with. */
export function Testimonials({
  testimonials,
  section,
  index,
}: {
  testimonials: Testimonial[];
  section?: SectionMeta;
  index: number;
}) {
  if (testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="relative section-pad">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px rule-grad" />

      <div className="container-page">
        <Reveal>
          <SectionHeading
            index={index}
            label={section?.label || "Testimonials"}
            title={section?.heading || "What people say"}
            description={section?.description}
          />
        </Reveal>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item, position) => (
            <Reveal key={item._id} delay={position * 70}>
              <figure className="panel panel-hover h-full p-5">
                <Icon name="Quote" className="h-5 w-5 text-accent/50" />

                <blockquote className="mt-3 text-[13px] leading-relaxed text-muted">
                  {item.message}
                </blockquote>

                <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                  {item.avatarUrl ? (
                    <Image
                      src={item.avatarUrl}
                      alt={item.name}
                      width={40}
                      height={40}
                      className="h-9 w-9 rounded-full border border-line object-cover"
                    />
                  ) : (
                    <span className="grid h-9 w-9 place-items-center rounded-full grad-accent text-[11px] font-bold text-accent-ink">
                      {initials(item.name)}
                    </span>
                  )}

                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-medium text-ink">
                      {item.name}
                    </span>
                    <span className="block truncate text-[11.5px] text-faint">{item.role}</span>
                  </span>

                  {item.rating > 0 ? (
                    <span className="ml-auto flex items-center gap-0.5">
                      {Array.from({ length: Math.min(5, item.rating) }).map((_, star) => (
                        <Icon
                          key={star}
                          name="Star"
                          className="h-3 w-3 fill-current text-warning"
                        />
                      ))}
                    </span>
                  ) : null}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
