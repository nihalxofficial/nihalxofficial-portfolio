"use client";

import { useState } from "react";
import type { SectionMeta, SkillGroup, Skill } from "@/lib/types";

/** Map proficiency → segment count out of 10 */
function proficiencyToSegs(p: Skill["proficiency"]): number {
  switch (p) {
    case "expert":   return 9;
    case "advanced": return 7;
    case "familiar": return 5;
    case "learning": return 3;
    default:         return 3;
  }
}

function proficiencyLabel(p: Skill["proficiency"]): string {
  switch (p) {
    case "expert":   return "Expert";
    case "advanced": return "Advanced";
    case "familiar": return "Proficient";
    case "learning": return "Learning";
    default:         return p;
  }
}

function SegBar({ filled, total = 10 }: { filled: number; total?: number }) {
  return (
    <div className="seg">
      {Array.from({ length: total }).map((_, i) => (
        <i key={i} className={i < filled ? "on" : ""} />
      ))}
    </div>
  );
}

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

  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [hovered, setHovered] = useState<Skill | null>(null);

  const allSkills = groups.flatMap((g) => g.skills);
  const filteredSkills =
    selectedCat === "all"
      ? allSkills
      : groups.find((g) => g.category === selectedCat)?.skills ?? [];

  const displaySkill = hovered;

  return (
    <section id="skills" className="relative py-12">
      {/* ViewHeader */}
      <p className="eyebrow mb-2 font-mono text-xs text-acc">{"// my skills"}</p>
      <h2 className="text-3xl font-bold mb-2">
        Tech <span className="text-grad">Stack</span>
      </h2>
      {section?.description && (
        <p className="text-sm text-slate-400 mb-8 max-w-xl">{section.description}</p>
      )}

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          className={`chip${selectedCat === "all" ? " on" : ""}`}
          onClick={() => setSelectedCat("all")}
        >
          All ({allSkills.length})
        </button>
        {groups.map((g) => (
          <button
            key={g.category}
            className={`chip${selectedCat === g.category ? " on" : ""}`}
            onClick={() => setSelectedCat(g.category)}
          >
            {g.category} ({g.skills.length})
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Skill tiles grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredSkills.map((skill) => {
            const segs = proficiencyToSegs(skill.proficiency);
            return (
              <div
                key={skill.id}
                onMouseEnter={() => setHovered(skill)}
                onMouseLeave={() => setHovered(null)}
                className="hud hud-hover p-4 cursor-default transition"
              >
                {/* Icon / brand mark */}
                <div
                  className="w-10 h-10 rounded-lg grid place-items-center text-lg font-bold mb-3"
                  style={{ color: skill.brandColor || "var(--acc)", background: `${skill.brandColor || "var(--acc)"}18`, border: `1px solid ${skill.brandColor || "var(--acc)"}44` }}
                >
                  {skill.icon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={skill.icon} alt={skill.name} className="w-5 h-5 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : (
                    <span className="font-mono text-[11px]">
                      {skill.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="text-sm font-semibold mb-1 truncate">{skill.name}</div>
                <SegBar filled={segs} />
                <div className="mt-1 font-mono text-[10px] text-slate-500">
                  {proficiencyLabel(skill.proficiency)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Skill detail panel */}
        <div className="hud p-5 sticky top-4">
          {displaySkill ? (
            <>
              <div
                className="w-14 h-14 rounded-xl grid place-items-center text-2xl font-bold mb-4 mx-auto"
                style={{ color: displaySkill.brandColor || "var(--acc)", background: `${displaySkill.brandColor || "var(--acc)"}18`, border: `2px solid ${displaySkill.brandColor || "var(--acc)"}` }}
              >
                {displaySkill.icon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={displaySkill.icon} alt="" className="w-8 h-8 object-contain" />
                ) : (
                  <span className="font-mono text-sm">{displaySkill.name.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <h3 className="text-center font-bold text-lg mb-1">{displaySkill.name}</h3>
              <p className="text-center text-xs text-slate-400 mb-4">
                {proficiencyLabel(displaySkill.proficiency)}
              </p>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-mono text-[11px] text-slate-400">Proficiency</span>
                    <span className="font-mono text-[11px] text-acc">
                      {proficiencyToSegs(displaySkill.proficiency) * 10}%
                    </span>
                  </div>
                  <SegBar filled={proficiencyToSegs(displaySkill.proficiency)} />
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-3 text-acc/30">{"<>"}</div>
              <p className="font-mono text-xs text-slate-500">hover a skill</p>
              <p className="text-[10px] text-slate-600 mt-1">to see details</p>
            </div>
          )}

          {/* Category summary */}
          <div className="mt-6 border-t border-white/5 pt-4 space-y-2">
            {groups.map((g) => (
              <div key={g.category} className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">{g.category}</span>
                <span className="font-mono text-acc">{g.skills.length}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
