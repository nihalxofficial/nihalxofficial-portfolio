import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import type { SectionMeta, Testimonial } from "@/lib/types";
import { initials } from "@/lib/utils";

/** Testimonials — HUD dark quote cards. */
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
        {/* View header */}
        <Reveal>
          <div className="mb-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-acc/70">
              // testimonials
            </p>
            <h2 className="mt-1 text-[1.7rem] font-bold leading-[1.15] tracking-tight text-white sm:text-[2rem]">
              {section?.heading?.split(" ").slice(0, -2).join(" ") || "What People"}{" "}
              <span className="text-grad">
                {section?.heading?.split(" ").slice(-2).join(" ") || "Say"}
              </span>
            </h2>
            {section?.description && (
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{section.description}</p>
            )}
          </div>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item, position) => (
            <Reveal key={item._id} delay={position * 70}>
              <figure className="hud hud-hover h-full p-5">
                {/* Opening quote mark */}
                <div className="text-acc/40 text-4xl font-serif leading-none select-none">"</div>

                <blockquote className="mt-2 text-[13px] leading-relaxed text-slate-300">
                  {item.message}
                </blockquote>

                <figcaption className="mt-5 flex items-center gap-3 border-t border-white/5 pt-4">
                  {item.avatarUrl ? (
                    <Image
                      src={item.avatarUrl}
                      alt={item.name}
                      width={40}
                      height={40}
                      className="h-9 w-9 rounded-full border border-acc/20 object-cover"
                    />
                  ) : (
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-grad text-[11px] font-bold text-[#03050f]">
                      {initials(item.name)}
                    </span>
                  )}

                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-semibold text-white">
                      {item.name}
                    </span>
                    <span className="block truncate text-[11.5px] text-slate-500">{item.role}</span>
                  </span>

                  {item.rating > 0 && (
                    <span className="ml-auto flex items-center gap-0.5">
                      {Array.from({ length: Math.min(5, item.rating) }).map((_, star) => (
                        <Icon
                          key={star}
                          name="Star"
                          className="h-3 w-3 fill-current text-yellow-400"
                        />
                      ))}
                    </span>
                  )}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
