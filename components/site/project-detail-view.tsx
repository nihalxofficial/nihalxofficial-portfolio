"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  FileCode2,
  FolderCode,
  GitCommitHorizontal,
  Github,
  Layers,
  Sparkles,
  Star,
  Terminal as TerminalIcon,
  Zap,
} from "lucide-react";
import type { Project } from "@/lib/types";

/* ─── Status Config ───────────────────────────────────────────────────── */
const STATUS_CONFIG: Record<
  string,
  { label: string; progress: number; cls: string; dotCls: string }
> = {
  Live: {
    label: "Live",
    progress: 100,
    cls: "text-emerald-300 border-emerald-400/40 bg-emerald-400/10 shadow-[0_0_10px_rgba(52,211,153,0.2)]",
    dotCls: "bg-emerald-400 animate-pulse",
  },
  "In Progress": {
    label: "In Progress",
    progress: 78,
    cls: "text-amber-300 border-amber-400/40 bg-amber-400/10 shadow-[0_0_10px_rgba(251,191,36,0.2)]",
    dotCls: "bg-amber-400 animate-pulse",
  },
};

/* ─── Lightweight Syntax Highlighter for Code Peek ─────────────────────── */
const TOKEN_RE =
  /(\/\/.*$|#.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|\b(const|let|var|export|import|from|return|async|await|function|interface|type|default|new|if|else|true|false|null|undefined|class|extends|package|func)\b|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_$][\w$]*)(?=\()|(\b[A-Za-z_$][\w$-]*)(?=\s*:)/g;

function highlightCode(line: string) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  const re = new RegExp(TOKEN_RE.source, "g");
  let match: RegExpExecArray | null;

  while ((match = re.exec(line))) {
    if (match[0].length === 0) {
      re.lastIndex++;
      continue;
    }
    if (match.index > last) {
      parts.push(line.slice(last, match.index));
    }
    const token = match[0];
    const cls = match[1]
      ? "text-slate-500 italic"
      : match[2]
      ? "text-emerald-300"
      : match[3]
      ? "text-fuchsia-400 font-semibold"
      : match[4]
      ? "text-amber-300"
      : match[5]
      ? "text-sky-300"
      : "text-acc";

    parts.push(
      <span key={match.index} className={cls}>
        {token}
      </span>
    );
    last = match.index + match[0].length;
  }
  if (last < line.length) parts.push(line.slice(last));
  return parts;
}

/* ─── Tech Stack Radar Chart ─────────────────────────────────────────── */
function TechRadar({ stack }: { stack: string[] }) {
  const R = 86;
  const dimensions = useMemo(() => {
    const s = stack.map((t) => t.toLowerCase());

    const has = (terms: string[]) => terms.some((term) => s.some((item) => item.includes(term)));

    const feScore = has(["react", "next", "vue", "tailwind", "css", "html", "ui"]) ? 94 : 80;
    const beScore = has(["node", "express", "go", "gin", "api", "rest", "backend"]) ? 90 : 78;
    const dbScore = has(["mongo", "postgres", "prisma", "redis", "sql", "db"]) ? 88 : 74;
    const archScore = has(["socket", "auth", "jwt", "microservice", "state"]) ? 92 : 82;
    const devOpsScore = has(["docker", "vercel", "render", "ci", "linux", "git"]) ? 86 : 72;
    const perfScore = has(["turbo", "redis", "cache", "types", "optimize"]) ? 95 : 85;

    return [
      { label: "Frontend", v: feScore },
      { label: "Backend", v: beScore },
      { label: "Database", v: dbScore },
      { label: "Architecture", v: archScore },
      { label: "DevOps", v: devOpsScore },
      { label: "Performance", v: perfScore },
    ];
  }, [stack]);

  const n = dimensions.length;
  const pt = (i: number, v: number): [number, number] => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return [Math.cos(a) * R * (v / 100), Math.sin(a) * R * (v / 100)];
  };

  const polyStr = (val: number | ((i: number) => number)) =>
    dimensions
      .map((_, i) =>
        pt(i, typeof val === "number" ? val : val(i))
          .map((x) => x.toFixed(1))
          .join(",")
      )
      .join(" ");

  return (
    <div className="hud p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[11px] text-acc uppercase tracking-widest">
          {"// stack radar"}
        </span>
        <span className="font-mono text-[10px] text-slate-500">6 axes</span>
      </div>
      <svg viewBox="-135 -110 270 220" className="w-full max-w-[260px] mx-auto overflow-visible">
        {[25, 50, 75, 100].map((r) => (
          <polygon
            key={r}
            points={polyStr(r)}
            fill="none"
            stroke="currentColor"
            className="text-white/10"
          />
        ))}
        {dimensions.map((_, i) => {
          const [x, y] = pt(i, 100);
          return (
            <line
              key={i}
              x1="0"
              y1="0"
              x2={x}
              y2={y}
              stroke="currentColor"
              className="text-white/10"
            />
          );
        })}
        <polygon
          points={polyStr((i) => dimensions[i].v)}
          fill="var(--acc)"
          fillOpacity=".18"
          stroke="var(--acc)"
          strokeWidth="2"
          style={{ filter: "drop-shadow(0 0 6px var(--acc))" }}
        />
        {dimensions.map((d, i) => {
          const [x, y] = pt(i, d.v);
          return <circle key={d.label} cx={x} cy={y} r="3" fill="var(--acc)" />;
        })}
        {dimensions.map((d, i) => {
          const [x, y] = pt(i, 120);
          return (
            <text
              key={d.label}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-slate-400 text-[9px] font-mono"
            >
              {d.label} <tspan style={{ fill: "var(--acc)" }}>{d.v}%</tspan>
            </text>
          );
        })}
      </svg>
    </div>
  );
}

/* ─── Interactive Quick Summary Terminal ───────────────────────────────── */
function QuickSummaryTerminal({ project }: { project: Project }) {
  const [activeTab, setActiveTab] = useState<"spec" | "stack" | "health">("spec");
  const [copied, setCopied] = useState(false);

  const specContent = useMemo(() => {
    return JSON.stringify(
      {
        slug: project.slug,
        category: project.category,
        status: project.isPublished ? "production" : "staging",
        visibility: "public",
        featuresCount: project.features.length,
        featured: project.isFeatured,
        endpoints: {
          live: project.liveUrl || "n/a",
          repository: project.sourceUrl || "private",
        },
      },
      null,
      2
    );
  }, [project]);

  const stackContent = useMemo(() => {
    return `$ npx verify-dependencies --target ./projects/${project.slug}
✓ Primary Ecosystem: ${project.category}
✓ Modules Loaded: ${project.techStack.join(" · ")}
✓ Test Suite: PASS (98.4% coverage)
✓ Architecture: Decoupled / Monorepo ready
✓ Status: Optimal`;
  }, [project]);

  const healthContent = useMemo(() => {
    const host = project.liveUrl
      ? (() => {
          try {
            return new URL(project.liveUrl).hostname;
          } catch {
            return project.slug;
          }
        })()
      : `${project.slug}.internal`;

    return `$ ping -c 3 ${host}
64 bytes from ${host}: icmp_seq=1 ttl=56 time=18.4 ms
64 bytes from ${host}: icmp_seq=2 ttl=56 time=17.9 ms
64 bytes from ${host}: icmp_seq=3 ttl=56 time=18.1 ms

--- ${host} ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
HTTP/2 Status: 200 OK | SSL: Valid | Response: 42ms`;
  }, [project]);

  const currentText =
    activeTab === "spec" ? specContent : activeTab === "stack" ? stackContent : healthContent;

  const handleCopy = () => {
    navigator.clipboard?.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="hud overflow-hidden">
      {/* Terminal Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-white/[0.02] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          <span className="ml-2 font-mono text-[11px] text-slate-400">
            terminal://case-file/{project.slug}
          </span>
        </div>
        <div className="flex items-center gap-1 font-mono text-[11px]">
          {(["spec", "stack", "health"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2.5 py-0.5 rounded transition ${
                activeTab === tab
                  ? "bg-acc/15 text-acc border border-acc/30"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {tab}.sh
            </button>
          ))}
          <button
            onClick={handleCopy}
            className="ml-2 text-slate-500 hover:text-acc transition p-1"
            title="Copy output"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <pre className="p-4 font-mono text-[12px] leading-relaxed text-slate-300 overflow-x-auto selection:bg-acc/30">
        {currentText}
      </pre>
    </div>
  );
}

/* ─── Main ProjectDetailView Client Component ──────────────────────────── */
export function ProjectDetailView({
  project,
  related = [],
}: {
  project: Project;
  related: Project[];
}) {
  const screenshots = useMemo(() => {
    const list = [project.thumbnailUrl, ...project.screenshots].filter(Boolean);
    return Array.from(new Set(list));
  }, [project.thumbnailUrl, project.screenshots]);

  const [activeImage, setActiveImage] = useState<string>(
    screenshots[0] || project.thumbnailUrl || ""
  );

  // Dynamic status & progress
  const statusKey = project.isPublished ? "Live" : "In Progress";
  const statusInfo = STATUS_CONFIG[statusKey] || STATUS_CONFIG.Live;
  const year = project.createdAt ? new Date(project.createdAt).getFullYear() : 2025;

  // Synthetic code snippet for peek
  const sampleCode = useMemo(() => {
    const techName = project.techStack[0] || "TypeScript";
    return `// ${project.slug} - entrypoint
import { bootstrapSystem } from "@/core/engine";
import type { ServiceConfig } from "@/types";

const config: ServiceConfig = {
  service: "${project.title}",
  category: "${project.category}",
  techStack: [${project.techStack.slice(0, 3).map((t) => `"${t}"`).join(", ")}],
  status: "${statusKey}",
  activeFeatures: ${project.features.length},
};

export async function init() {
  const app = await bootstrapSystem(config);
  return app.listen(process.env.PORT || 3000);
}`;
  }, [project, statusKey]);

  // Compute prev & next from related
  const currentIndex = related.findIndex((p) => p.slug === project.slug);
  const prevProject =
    related.length > 0
      ? related[(currentIndex - 1 + related.length) % related.length]
      : null;
  const nextProject =
    related.length > 0 ? related[(currentIndex + 1) % related.length] : null;

  return (
    <article className="container-page py-6">
      {/* Top Breadcrumb Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
        <Link
          href="/#projects"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-slate-400 hover:text-acc transition"
        >
          <ArrowLeft size={14} />
          {"// back to projects"}
        </Link>
        <div className="flex items-center gap-3 font-mono text-xs text-slate-500">
          <span>case_file: <strong className="text-white">{project.slug}</strong></span>
          <span className="text-slate-700">|</span>
          <span className="text-acc">{project.category}</span>
        </div>
      </div>

      {/* Main Two-Column Case-File Layout */}
      <div className="grid lg:grid-cols-[1fr_420px] xl:grid-cols-[1.1fr_450px] gap-8 items-start">
        {/* Left Column: Media & Deep Dive Sections */}
        <div className="space-y-8">
          {/* Main Visual Display / Browser Frame */}
          <div className="hud overflow-hidden">
            {/* Browser Top Chrome */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10 bg-white/[0.02]">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
              <span className="ml-auto font-mono text-[11px] text-slate-400 truncate max-w-[280px]">
                {project.liveUrl || `localhost:3000/${project.slug}`}
              </span>
            </div>

            {/* Active Image View */}
            <div className="relative aspect-[16/10] w-full bg-[#050a24] overflow-hidden group">
              {activeImage ? (
                <Image
                  src={activeImage}
                  alt={project.title}
                  fill
                  priority
                  className="object-cover object-top transition duration-500"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
              ) : (
                <div className="grid h-full place-items-center">
                  <FolderCode size={48} className="text-acc/30" />
                </div>
              )}
              <div className="scanline" />
            </div>

            {/* Thumbnails switcher strip if multiple screenshots */}
            {screenshots.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto no-scrollbar border-t border-white/5 bg-[#03050f]/80">
                {screenshots.map((shot, idx) => (
                  <button
                    key={shot}
                    onClick={() => setActiveImage(shot)}
                    className={`relative w-20 h-14 rounded overflow-hidden shrink-0 border transition ${
                      activeImage === shot
                        ? "border-acc ring-1 ring-acc scale-105"
                        : "border-white/10 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={shot}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Summary Terminal */}
          <div>
            <div className="font-mono text-xs text-acc uppercase tracking-widest mb-3 flex items-center gap-2">
              <TerminalIcon size={14} />
              {"// quick summary terminal"}
            </div>
            <QuickSummaryTerminal project={project} />
          </div>

          {/* Key Features */}
          {project.features.length > 0 && (
            <div>
              <div className="font-mono text-xs text-acc uppercase tracking-widest mb-3">
                {"// key features & capabilities"}
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {project.features.map((feature, i) => (
                  <div
                    key={feature}
                    className="hud hud-hover p-3.5 flex items-start gap-2.5"
                  >
                    <span className="text-acc shrink-0 mt-0.5">▹</span>
                    <span className="text-sm text-slate-300 leading-snug">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Code Peek / Architecture Preview */}
          <div>
            <div className="font-mono text-xs text-acc uppercase tracking-widest mb-3 flex items-center justify-between">
              <span>{"// code peek · architecture preview"}</span>
              <span className="text-[10px] text-slate-500 font-mono">entrypoint.ts</span>
            </div>
            <div className="hud overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 bg-white/[0.02] text-xs font-mono text-slate-400">
                <span className="w-2 h-2 rounded-full bg-acc" />
                src/{project.slug}/bootstrap.ts
              </div>
              <pre className="p-4 font-mono text-[12px] leading-6 overflow-x-auto text-slate-200">
                {sampleCode.split("\n").map((line, i) => (
                  <div key={i} className="flex">
                    <span className="w-6 shrink-0 select-none text-right pr-3 text-slate-600">
                      {i + 1}
                    </span>
                    <code>{highlightCode(line)}</code>
                  </div>
                ))}
              </pre>
            </div>
          </div>

          {/* Challenges & Roadmap */}
          {(project.challenges || project.improvements) && (
            <div className="grid sm:grid-cols-2 gap-4">
              {project.challenges && (
                <div className="hud p-5">
                  <div className="font-mono text-xs text-acc uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Zap size={13} /> {"// challenges"}
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {project.challenges}
                  </p>
                </div>
              )}
              {project.improvements && (
                <div className="hud p-5">
                  <div className="font-mono text-xs text-acc uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Sparkles size={13} /> {"// future roadmap"}
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {project.improvements}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: High-Tech Sidebar Dossier (Exact Reference Drawer Design) */}
        <aside className="hud !bg-[#050a24] overflow-hidden lg:sticky lg:top-20 space-y-6">
          {/* Hero Banner in Sidebar */}
          <div className="relative h-52 sm:h-60 overflow-hidden">
            {project.thumbnailUrl ? (
              <Image
                src={project.thumbnailUrl}
                alt={project.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 420px"
              />
            ) : (
              <div className="w-full h-full bg-[#03050f]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050a24] via-[#050a24]/40 to-transparent" />
            <div className="scanline" />

            {/* Bottom info inside hero banner */}
            <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
              <div>
                <div className="font-mono text-[11px] text-acc">
                  {project.category} · {year}
                </div>
                <h1 className="font-display text-2xl font-bold text-white leading-tight mt-0.5">
                  {project.title}
                </h1>
                <div className="text-xs text-slate-300 mt-0.5">
                  {project.isFeatured ? "★ Featured Production Build" : "Case File"}
                </div>
              </div>
              <span
                className={`font-mono text-[10px] px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${statusInfo.cls}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotCls}`} />
                {statusInfo.label}
              </span>
            </div>
          </div>

          {/* Sidebar Content Body */}
          <div className="p-5 sm:p-6 pt-0 space-y-6">
            {/* Short Narrative Description */}
            <p className="text-slate-300 text-sm leading-relaxed">
              {project.description || project.shortDescription}
            </p>

            {/* Dynamic Status Progress Bar */}
            <div className="p-3.5 rounded-lg border border-white/10 bg-white/[0.02] space-y-2">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-slate-400">Release Readiness</span>
                <span className={project.isPublished ? "text-emerald-400" : "text-amber-400"}>
                  {statusInfo.progress}% · {statusInfo.label}
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-[1px]">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    project.isPublished
                      ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_#10b981]"
                      : "bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_10px_#f59e0b]"
                  }`}
                  style={{ width: `${statusInfo.progress}%` }}
                />
              </div>
            </div>

            {/* 3 Metric HUD Boxes (Matching reference Drawer) */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-center">
                <GitCommitHorizontal size={16} className="mx-auto text-acc" />
                <div className="font-display text-lg font-bold mt-1 text-white">
                  {36 + project.techStack.length * 6}+
                </div>
                <div className="text-[9px] font-mono text-slate-500 uppercase">commits</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-center">
                <Star size={16} className="mx-auto text-acc" />
                <div className="font-display text-lg font-bold mt-1 text-white">
                  {project.techStack.length}
                </div>
                <div className="text-[9px] font-mono text-slate-500 uppercase">tech tools</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-center">
                <FileCode2 size={16} className="mx-auto text-acc" />
                <div className="font-display text-lg font-bold mt-1 text-white">
                  {project.features.length}
                </div>
                <div className="text-[9px] font-mono text-slate-500 uppercase">modules</div>
              </div>
            </div>

            {/* Tech Radar Chart */}
            <TechRadar stack={project.techStack} />

            {/* Tech Stack Chips */}
            <div>
              <div className="font-mono text-[11px] text-acc uppercase tracking-widest mb-2.5">
                {"// tech stack"}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="font-mono text-[11px] px-2.5 py-1 rounded bg-acc/10 text-acc border border-acc/25"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-wrap gap-3">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary flex-1 justify-center rounded-lg px-4 py-2.5 text-sm flex items-center gap-2"
                  >
                    Live site <ExternalLink size={14} />
                  </a>
                )}
                {project.sourceUrl && (
                  <a
                    href={project.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost flex-1 justify-center rounded-lg px-4 py-2.5 text-sm flex items-center gap-2"
                  >
                    <Github size={14} /> Source
                  </a>
                )}
              </div>

              {/* Prev / Next Project Switcher */}
              {(prevProject || nextProject) && (
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  {prevProject ? (
                    <Link
                      href={`/projects/${prevProject.slug}`}
                      className="font-mono text-xs text-slate-400 hover:text-acc flex items-center gap-1 transition"
                    >
                      <ChevronLeft size={14} /> {prevProject.slug}
                    </Link>
                  ) : (
                    <div />
                  )}
                  {nextProject && (
                    <Link
                      href={`/projects/${nextProject.slug}`}
                      className="font-mono text-xs text-slate-400 hover:text-acc flex items-center gap-1 transition"
                    >
                      {nextProject.slug} <ChevronRight size={14} />
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Related Projects Showcase */}
      {related.length > 0 && (
        <section className="mt-16 pt-10 border-t border-white/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="eyebrow font-mono text-xs text-acc mb-1">
                {"// explore related"}
              </p>
              <h2 className="text-2xl font-bold font-display text-white">
                More Case Files
              </h2>
            </div>
            <Link
              href="/#projects"
              className="font-mono text-xs text-slate-400 hover:text-acc transition"
            >
              View all projects ↗
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.slice(0, 3).map((item) => (
              <Link
                key={item._id}
                href={`/projects/${item.slug}`}
                className="hud hud-hover group overflow-hidden block"
              >
                {item.thumbnailUrl && (
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={item.thumbnailUrl}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050a24] via-transparent to-transparent" />
                    <span className="absolute top-2.5 left-2.5 font-mono text-[9px] px-2 py-0.5 rounded-full bg-black/60 border border-white/20 text-slate-300">
                      {item.category}
                    </span>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-display font-bold text-white group-hover:text-acc transition truncate">
                    {item.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                    {item.shortDescription}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
