"use client";

import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import type { SectionMeta, Testimonial } from "@/lib/types";
import { initials } from "@/lib/utils";

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    _id: "test-1",
    name: "Tanvir Ahmed",
    role: "Engineering Lead @ bdsoft.org",
    message:
      "Nihal is an exceptionally sharp frontend engineer with a keen eye for design and performance. His ability to translate complex Figma specs into modular, production-ready React code is stellar.",
    rating: 5,
    avatarUrl: "",
    order: 1,
    isVisible: true,
  },
  {
    _id: "test-2",
    name: "Engr. Rakibul Hasan",
    role: "Senior Mentor @ FPI Computer Club",
    message:
      "A passionate developer who constantly pushes his technical boundaries. Nihal's work on full-stack web applications, clean architecture, and mentorship has been truly impressive.",
    rating: 5,
    avatarUrl: "",
    order: 2,
    isVisible: true,
  },
  {
    _id: "test-3",
    name: "Sabbir Hossain",
    role: "Full-Stack Project Collaborator",
    message:
      "Collaborating with Nihal was effortless. He delivers clean, type-safe TypeScript code with great speed, futuristic HUD aesthetics, and dependable API integrations.",
    rating: 5,
    avatarUrl: "",
    order: 3,
    isVisible: true,
  },
];

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
  const list = testimonials.length > 0 ? testimonials : DEFAULT_TESTIMONIALS;

  return (
    <section id="testimonials" className="relative py-12">
      <div className="mb-8">
        <p className="eyebrow mb-2 font-mono text-xs text-acc">
          {"// testimonials · client & peer endorsements"}
        </p>
        <h2 className="text-3xl font-bold">
          {section?.heading?.split(" ").slice(0, -2).join(" ") || "What People"}{" "}
          <span className="text-grad">
            {section?.heading?.split(" ").slice(-2).join(" ") || "Say"}
          </span>
        </h2>
        {section?.description && (
          <p className="mt-2 text-sm leading-relaxed text-slate-400 max-w-xl">{section.description}</p>
        )}
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {list.map((item, position) => (
          <Reveal key={item._id} delay={position * 70}>
            <figure className="hud hud-hover h-full p-5 flex flex-col justify-between">
              <div>
                {/* Opening quote mark */}
                <div className="text-acc/40 text-4xl font-serif leading-none select-none">"</div>

                <blockquote className="mt-2 text-[13px] leading-relaxed text-slate-300">
                  {item.message}
                </blockquote>
              </div>

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
    </section>
  );
}
