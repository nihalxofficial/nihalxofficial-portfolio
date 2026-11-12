"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, Orbit, Search, ArrowUpRight } from "lucide-react";
import { AnimatedProgressBar, AnimatedNumber } from "@/components/ui/animated-progress";
import { Icon } from "@/components/ui/icon";
import type { Project, SectionMeta, SkillGroup, Skill } from "@/lib/types";

/* ── Common Tech Brand Aliases ────────────────────────────────────────── */
const BRAND_ALIASES: Record<string, string> = {
  "next.js": "SiNextdotjs",
  "nextjs": "SiNextdotjs",
  "next": "SiNextdotjs",
  "react": "SiReact",
  "react.js": "SiReact",
  "reactjs": "SiReact",
  "typescript": "SiTypescript",
  "ts": "SiTypescript",
  "javascript": "SiJavascript",
  "js": "SiJavascript",
  "node.js": "SiNodedotjs",
  "nodejs": "SiNodedotjs",
  "node": "SiNodedotjs",
  "express": "SiExpress",
  "express.js": "SiExpress",
  "expressjs": "SiExpress",
  "mongodb": "SiMongodb",
  "mongo": "SiMongodb",
  "postgresql": "SiPostgresql",
  "postgres": "SiPostgresql",
  "prisma": "SiPrisma",
  "tailwind": "SiTailwindcss",
  "tailwindcss": "SiTailwindcss",
  "tailwind css": "SiTailwindcss",
  "docker": "SiDocker",
  "docker hub": "SiDocker",
  "git": "SiGit",
  "github": "SiGithub",
  "figma": "SiFigma",
  "vercel": "SiVercel",
  "render": "SiRender",
  "redis": "SiRedis",
  "linux": "SiLinux",
  "postman": "SiPostman",
  "go": "SiGo",
  "golang": "SiGo",
  "socket.io": "SiSocketdotio",
  "socketio": "SiSocketdotio",
  "heroui": "SiHeroui",
  "neon": "SiNeon",
};

/**
 * Universal Skill / Tech Icon component
 * Resolves both image URLs and react-icons Simple Icons (e.g. SiReact, SiNextdotjs)
 */
export function SkillIcon({
  icon,
  name,
  className = "w-5 h-5",
  size = 20,
}: {
  icon?: string;
  name: string;
  className?: string;
  size?: number;
}) {
  const isUrl = Boolean(
    icon &&
      (icon.startsWith("http://") ||
        icon.startsWith("https://") ||
        icon.startsWith("/") ||
        icon.startsWith("data:"))
  );

  if (isUrl && icon) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={icon}
        alt={name}
        className={`${className} object-contain`}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    );
  }

  // Resolve from explicit icon name or from brand name alias
  const normalizedKey = name.toLowerCase().trim();
  const strippedKey = normalizedKey.replace(/[^a-z0-9]/g, "");
  const iconName =
    icon || BRAND_ALIASES[normalizedKey] || BRAND_ALIASES[strippedKey];

  if (iconName) {
    return (
      <Icon
        name={iconName}
        className={className}
        size={size}
        fallback={() => (
          <span className="font-mono text-xs font-bold uppercase leading-none">
            {name.slice(0, 2)}
          </span>
        )}
      />
    );
  }

  return (
    <span className="font-mono text-xs font-bold uppercase leading-none">
      {name.slice(0, 2)}
    </span>
  );
}

/* ── Proficiency helpers ─────────────────────────────────────────────── */
function proficiencyToLevel(p: Skill["proficiency"]): number {
  switch (p) {
    case "expert":   return 90;
    case "advanced": return 70;
    case "familiar": return 55;
    case "learning": return 30;
    default:         return 30;
  }
}
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

/* ── Clean Smooth Progress Bar ────────────────────────────────────────── */
function CleanProgressBar({
  level,
  brandColor,
}: {
  level: number;
  brandColor?: string;
}) {
  return (
    <div className="mt-3.5 w-full">
      <AnimatedProgressBar
        value={level}
        color={brandColor}
        className="h-[5px]"
      />
    </div>
  );
}

/* ── Radar chart ──────────────────────────────────────────────────────── */
function Radar({ data }: { data: { label: string; v: number }[] }) {
  const R = 100;
  const n = data.length;
  if (n < 3) return null;

  const pt = (i: number, v: number): [number, number] => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return [Math.cos(a) * R * (v / 100), Math.sin(a) * R * (v / 100)];
  };

  const polyStr = (v: number | ((i: number) => number)) =>
    data.map((_, i) => pt(i, typeof v === "number" ? v : v(i)).map((x) => x.toFixed(1)).join(",")).join(" ");

  return (
    <svg viewBox="-150 -125 300 250" className="w-full max-w-[280px] mx-auto">
      {[25, 50, 75, 100].map((r) => (
        <polygon key={r} points={polyStr(r)} fill="none" stroke="currentColor" className="text-white/10" />
      ))}
      {data.map((_, i) => {
        const [x, y] = pt(i, 100);
        return <line key={i} x1="0" y1="0" x2={x} y2={y} stroke="currentColor" className="text-white/10" />;
      })}
      <g className="grow">
        <polygon
          points={polyStr((i) => data[i].v)}
          fill="var(--acc)"
          fillOpacity=".18"
          stroke="var(--acc)"
          strokeWidth="2"
          style={{ filter: "drop-shadow(0 0 6px var(--acc))" }}
        />
        {data.map((d, i) => {
          const [x, y] = pt(i, d.v);
          return <circle key={d.label} cx={x} cy={y} r="3.5" fill="var(--acc)" />;
        })}
      </g>
      {data.map((d, i) => {
        const [x, y] = pt(i, 122);
        return (
          <text
            key={d.label}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-slate-300"
            style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}
          >
            {d.label}{" "}
            <tspan style={{ fill: "var(--acc)" }}>{d.v}</tspan>
          </text>
        );
      })}
    </svg>
  );
}

/* ── Orbit view ───────────────────────────────────────────────────────── */
function OrbitView({
  skills,
  selected,
  onPick,
}: {
  skills: Skill[];
  selected: Skill;
  onPick: (s: Skill) => void;
}) {
  const [hovered, setHovered] = useState<Skill | null>(null);
  const sorted = [...skills].sort((a, b) => {
    // Next.js always core
    if (a.name.toLowerCase().includes("next")) return -1;
    if (b.name.toLowerCase().includes("next")) return 1;
    return proficiencyToLevel(b.proficiency) - proficiencyToLevel(a.proficiency);
  });
  const rings = [
    { r: 15, d: 36, list: sorted.slice(0, 5) },
    { r: 28, d: 60, list: sorted.slice(5, 13) },
    { r: 41, d: 90, list: sorted.slice(13) },
  ];
  const show = hovered ?? selected;

  return (
    <div
      className="orbit relative w-full max-w-[520px] mx-auto aspect-square"
      style={{ containerType: "inline-size" }}
    >
      {rings.map((ring, ri) =>
        ring.list.length === 0 ? null : (
          <div
            key={ri}
            className="orbit-ring absolute left-1/2 top-1/2 rounded-full border border-dashed border-acc/25"
            style={{
              width: `${ring.r * 2}cqw`,
              height: `${ring.r * 2}cqw`,
              marginLeft: `-${ring.r}cqw`,
              marginTop: `-${ring.r}cqw`,
              ["--d" as string]: `${ring.d}s`,
              animationDirection: ri % 2 ? "reverse" : "normal",
            }}
          >
            {ring.list.map((s, i) => {
              const a = (360 / ring.list.length) * i;
              const color = s.brandColor || "var(--acc)";
              const isSelected = selected.id === s.id;
              return (
                <div
                  key={s.id}
                  className="absolute left-1/2 top-1/2 w-0 h-0"
                  style={{ transform: `rotate(${a}deg) translateX(${ring.r}cqw)` }}
                >
                  <div style={{ transform: `rotate(${-a}deg)` }}>
                    <div
                      className="orbit-rev"
                      style={{
                        ["--d" as string]: `${ring.d}s`,
                        animationDirection: ri % 2 ? "normal" : "reverse",
                      }}
                    >
                      <button
                        onMouseEnter={() => setHovered(s)}
                        onMouseLeave={() => setHovered(null)}
                        onClick={() => onPick(s)}
                        aria-label={s.name}
                        title={s.name}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-xl grid place-items-center font-mono font-bold cursor-pointer transition hover:scale-125 ${isSelected ? "scale-125" : ""}`}
                        style={{
                          width: "9cqw",
                          height: "9cqw",
                          fontSize: "3cqw",
                          color,
                          background: "#070c2a",
                          border: `1px solid ${color}${isSelected ? "" : "66"}`,
                          boxShadow: `0 0 ${isSelected ? 20 : 10}px ${color}55`,
                        }}
                      >
                        <SkillIcon
                          icon={s.icon}
                          name={s.name}
                          className="w-[5cqw] h-[5cqw]"
                          size={18}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Center orb */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[24cqw] h-[24cqw] rounded-full grid place-items-center text-center bg-[#050a26] ring-acc glow">
        <div key={show.id} className="fade px-2">
          <div
            className="font-display font-bold"
            style={{ fontSize: "3.6cqw", color: show.brandColor || "var(--acc)" }}
          >
            {show.name}
          </div>
          <div className="font-mono text-acc flex items-center justify-center gap-0.5" style={{ fontSize: "2.6cqw" }}>
            <AnimatedNumber value={proficiencyToLevel(show.proficiency)} suffix="%" />
          </div>
          <div className="text-slate-400 font-mono" style={{ fontSize: "2cqw" }}>
            {proficiencyLabel(show.proficiency)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────────────── */
export function Skills({
  groups,
  projects = [],
  section,
  index,
}: {
  groups: SkillGroup[];
  projects?: Project[];
  section?: SectionMeta;
  index: number;
}) {
  // Prioritize "Tech Stack" group first, and prioritize Next.js as the first skill
  const orderedGroups = useMemo(() => {
    return [...groups]
      .sort((a, b) => {
        const aIsTech = /tech|core|stack|frontend/i.test(a.category);
        const bIsTech = /tech|core|stack|frontend/i.test(b.category);
        if (aIsTech && !bIsTech) return -1;
        if (!aIsTech && bIsTech) return 1;
        return 0;
      })
      .map((g) => {
        const nextIdx = g.skills.findIndex((s) => s.name.toLowerCase().includes("next"));
        if (nextIdx > 0) {
          const copy = [...g.skills];
          const [nextItem] = copy.splice(nextIdx, 1);
          return { ...g, skills: [nextItem, ...copy] };
        }
        return g;
      });
  }, [groups]);

  const allSkills = useMemo(() => {
    const flat = orderedGroups.flatMap((g) => g.skills);
    const nextIdx = flat.findIndex((s) => s.name.toLowerCase().includes("next"));
    if (nextIdx > 0) {
      const copy = [...flat];
      const [nextItem] = copy.splice(nextIdx, 1);
      return [nextItem, ...copy];
    }
    return flat;
  }, [orderedGroups]);

  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"grid" | "orbit">("grid");

  // Keep Next.js selected by default
  const defaultSkill = useMemo(() => {
    return allSkills.find((s) => s.name.toLowerCase().includes("next")) ?? allSkills[0] ?? ({} as Skill);
  }, [allSkills]);

  const [selected, setSelected] = useState<Skill>(defaultSkill);

  // Radar data — avg proficiency per category
  const radarData = useMemo(
    () =>
      orderedGroups.map((g) => ({
        label: g.category,
        v: Math.round(g.skills.reduce((a, s) => a + proficiencyToLevel(s.proficiency), 0) / g.skills.length),
      })),
    [orderedGroups]
  );

  // Filtered skills with Next.js prioritized
  const filteredSkills = useMemo(() => {
    let base = selectedCat === "all" ? allSkills : orderedGroups.find((g) => g.category === selectedCat)?.skills ?? [];
    if (query.trim()) {
      const q = query.toLowerCase();
      base = base.filter((s) => s.name.toLowerCase().includes(q));
    }
    return base;
  }, [allSkills, orderedGroups, selectedCat, query]);

  // "Used in" — projects that include the selected skill in their techStack
  const usedIn = useMemo(() => {
    if (!selected?.name) return [];
    const key = selected.name.toLowerCase().split(" ")[0];
    return projects.filter((p) => p.techStack.some((t) => t.toLowerCase().includes(key))).map((p) => p.title);
  }, [selected, projects]);

  // Bail out only after every hook has run, so the hook order stays stable
  // when the CMS list becomes empty between renders.
  if (groups.length === 0) return null;

  return (
    <section id="skills" className="relative py-12">
      {/* ViewHeader */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="eyebrow mb-2 font-mono text-xs text-acc">{"// my skills"}</p>
          <h2 className="text-3xl font-bold">
            Tech <span className="text-grad">Stack</span>
          </h2>
          {section?.description && (
            <p className="text-sm text-slate-400 mt-2 max-w-xl">{section.description}</p>
          )}
        </div>
        {/* View mode toggle */}
        <div className="hud !rounded-lg p-1 flex shrink-0">
          {(
            [
              ["grid", LayoutGrid, "Matrix"],
              ["orbit", Orbit, "Orbit"],
            ] as const
          ).map(([m, Icon, label]) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm cursor-pointer transition ${
                mode === m ? "bg-acc/15 text-acc" : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid xl:grid-cols-[1fr_360px] gap-6">
        {/* Left: skill list or orbit */}
        <div>
          {/* Category filters + search */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <button
              className={`chip${selectedCat === "all" ? " on" : ""}`}
              onClick={() => setSelectedCat("all")}
            >
              All <span className="ml-1.5 opacity-60">{allSkills.length}</span>
            </button>
            {orderedGroups.map((g) => (
              <button
                key={g.category}
                className={`chip${selectedCat === g.category ? " on" : ""}`}
                onClick={() => setSelectedCat(g.category)}
              >
                {g.category} <span className="ml-1.5 opacity-60">{g.skills.length}</span>
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2 hud !rounded-lg px-3 py-1.5 w-full sm:w-52">
              <Search size={14} className="text-slate-500 shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="filter skills…"
                className="bg-transparent outline-none text-sm w-full placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Grid view */}
          {mode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-3">
              {filteredSkills.map((skill, pos) => {
                const segs = proficiencyToSegs(skill.proficiency);
                const isSelected = selected?.id === skill.id;
                return (
                  <button
                    key={skill.id}
                    onClick={() => setSelected(skill)}
                    style={{ animationDelay: `${pos * 35}ms` }}
                    className={`hud hud-hover rise text-left p-4 cursor-pointer hover:-translate-y-0.5 transition ${
                      isSelected ? "!border-acc glow-sm" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Brand icon */}
                      <span
                        className="grid place-items-center rounded-lg font-bold shrink-0 font-mono"
                        style={{
                          width: 36,
                          height: 36,
                          fontSize: 12,
                          color: skill.brandColor || "var(--acc)",
                          background: `${skill.brandColor || "var(--acc)"}1f`,
                          border: `1px solid ${skill.brandColor || "var(--acc)"}55`,
                          boxShadow: `0 0 14px ${skill.brandColor || "var(--acc)"}22`,
                        }}
                      >
                        <SkillIcon
                          icon={skill.icon}
                          name={skill.name}
                          className="w-5 h-5"
                          size={20}
                        />
                      </span>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm truncate">{skill.name}</div>
                        <div className="font-mono text-[10px] text-slate-500 uppercase">
                          {proficiencyLabel(skill.proficiency)}
                        </div>
                      </div>
                      <span className="ml-auto font-mono text-sm text-acc shrink-0">
                        <AnimatedNumber value={proficiencyToLevel(skill.proficiency)} suffix="%" />
                      </span>
                    </div>
                    <CleanProgressBar
                      level={proficiencyToLevel(skill.proficiency)}
                      brandColor={skill.brandColor}
                    />
                  </button>
                );
              })}
              {filteredSkills.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-500 font-mono text-sm">
                  {`$ grep "${query}" skills.json → no matches`}
                </div>
              )}
            </div>
          ) : (
            /* Orbit view */
            <div className="hud p-4">
              <OrbitView
                skills={filteredSkills.length ? filteredSkills : allSkills}
                selected={selected ?? defaultSkill}
                onPick={setSelected}
              />
              <p className="text-center text-[11px] font-mono text-slate-500 mt-2">
                hover to pause · click to inspect · sorted by proficiency, core → outer
              </p>
            </div>
          )}
        </div>

        {/* Right: selected skill detail + radar */}
        <div className="space-y-5 self-start xl:sticky xl:top-4">
          {/* Skill detail panel */}
          <div className="hud p-5">
            {selected?.name ? (
              <>
                <div className="flex items-center gap-3">
                  <span
                    className="grid place-items-center rounded-xl font-bold shrink-0 font-mono"
                    style={{
                      width: 46,
                      height: 46,
                      fontSize: 14,
                      color: selected.brandColor || "var(--acc)",
                      background: `${selected.brandColor || "var(--acc)"}1f`,
                      border: `2px solid ${selected.brandColor || "var(--acc)"}`,
                      boxShadow: `0 0 14px ${selected.brandColor || "var(--acc)"}22`,
                    }}
                  >
                    <SkillIcon
                      icon={selected.icon}
                      name={selected.name}
                      className="w-6 h-6"
                      size={24}
                    />
                  </span>
                  <div>
                    <div className="font-display text-xl font-bold">{selected.name}</div>
                    <div className="font-mono text-[11px] text-acc flex items-center gap-1">
                      <span>{proficiencyLabel(selected.proficiency)} ·</span>
                      <AnimatedNumber value={proficiencyToLevel(selected.proficiency)} suffix="%" />
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <AnimatedProgressBar
                    key={selected.id}
                    value={proficiencyToLevel(selected.proficiency)}
                    className="h-2 bg-white/10"
                    barClassName="bg-grad shadow-[0_0_12px_var(--acc)]"
                  />
                </div>

                {/* Used in projects */}
                {projects.length > 0 && (
                  <>
                    <div className="mt-4 font-mono text-[10px] uppercase tracking-widest text-slate-500">used in</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {usedIn.length > 0 ? (
                        usedIn.map((title) => (
                          <span key={title} className="chip flex items-center gap-1 !cursor-default">
                            {title} <ArrowUpRight size={10} />
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500">Personal experiments & learning</span>
                      )}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-3 text-acc/30">{"<>"}</div>
                <p className="font-mono text-xs text-slate-500">click a skill to inspect</p>
              </div>
            )}
          </div>

          {/* Radar chart */}
          {radarData.length >= 3 && (
            <div className="hud p-5">
              <div className="font-mono text-[11px] text-acc uppercase tracking-widest mb-1">{"// skill radar"}</div>
              <Radar data={radarData} />
            </div>
          )}

          {/* Category summary */}
          <div className="hud p-5">
            <div className="space-y-2">
              {orderedGroups.map((g) => (
                <div key={g.category} className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">{g.category}</span>
                  <span className="font-mono text-acc">{g.skills.length}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
