"use client";

import { motion, type Variants } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import type { Skill } from "@/lib/types";
import { cn } from "@/lib/utils";

const LEVEL_LABEL: Record<string, string> = {
  learning: "Learning",
  familiar: "Familiar",
  advanced: "Advanced",
  expert: "Expert",
};

/** Four dots stand for the four proficiency levels stored on each skill. */
const LEVEL_DOTS: Record<string, number> = {
  learning: 1,
  familiar: 2,
  advanced: 3,
  expert: 4,
};

const grid: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.035, delayChildren: 0.05 } },
};

const tile: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

function levelOf(skill: Skill): number {
  return LEVEL_DOTS[skill.proficiency] ?? 0;
}

function Dots({ skill, className }: { skill: Skill; className?: string }) {
  const filled = levelOf(skill);

  return (
    <span className={cn("flex items-center gap-1", className)} aria-hidden>
      {[1, 2, 3, 4].map((step) => (
        <span
          key={step}
          className={cn(
            "h-1 w-1 rounded-full",
            step <= filled ? "grad-accent" : "bg-line-strong opacity-60",
          )}
        />
      ))}
    </span>
  );
}

/**
 * One skill group. The wide group renders as glowing tiles, the narrow one as
 * icon rows — both stagger in when the section reaches the viewport.
 */
export function SkillGrid({
  skills,
  layout,
  columns,
}: {
  skills: Skill[];
  layout: "tiles" | "rows";
  columns: string;
}) {
  if (skills.length === 0) return null;

  return (
    <motion.div
      variants={grid}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className={cn("mt-4 grid gap-2", layout === "tiles" ? columns : "grid-cols-1")}
    >
      {skills.map((skill) => (
        <motion.div
          key={skill.id}
          variants={tile}
          title={`${skill.name} — ${LEVEL_LABEL[skill.proficiency] ?? skill.proficiency}`}
          className={cn(
            "group relative overflow-hidden rounded-xl border border-line/60 bg-surface-2/50 transition-colors hover:border-accent/45 hover:bg-surface-2",
            layout === "tiles"
              ? "flex flex-col items-center gap-2 px-2 py-3 text-center"
              : "flex items-center gap-3 px-3 py-2.5",
          )}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(65% 60% at 50% 45%, color-mix(in oklab, var(--accent) 20%, transparent), transparent 72%)",
            }}
          />

          <Icon
            name={skill.icon}
            className={cn(
              "relative transition-transform duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_10px_var(--accent-glow)]",
              layout === "tiles" ? "h-6 w-6" : "h-5 w-5 shrink-0",
            )}
            style={{ color: skill.brandColor || "var(--accent)" }}
          />

          <span
            className={cn(
              "relative font-medium leading-tight text-muted transition-colors group-hover:text-ink",
              layout === "tiles" ? "text-[11px]" : "text-[12.5px]",
            )}
          >
            {skill.name}
          </span>

          <Dots skill={skill} className={layout === "tiles" ? "relative" : "relative ml-auto"} />
        </motion.div>
      ))}
    </motion.div>
  );
}
