"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Layers,
  Radio,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import type { SectionMeta, Service } from "@/lib/types";

/* ── Rich Metadata for all 9 Engineering Services ───────────────────────── */
interface EnhancedServiceMeta {
  code: string;
  category: "Full-Stack & Frontend" | "Backend & Systems" | "DevOps & Security";
  tags: string[];
  metric: string;
  metricLabel: string;
  deliverables: string[];
}

const SERVICE_META_BY_TITLE: Record<string, EnhancedServiceMeta> = {
  "full-stack development": {
    code: "PROTOCOL_01",
    category: "Full-Stack & Frontend",
    tags: ["Next.js 15", "React 19", "TypeScript", "Tailwind CSS"],
    metric: "95+ Score",
    metricLabel: "Lighthouse Vitals",
    deliverables: [
      "End-to-end SSR/SSG web application",
      "Typed component system with clean contracts",
      "Responsive state management & hydration",
    ],
  },
  "rest & api engineering": {
    code: "PROTOCOL_02",
    category: "Backend & Systems",
    tags: ["Express", "Validation", "JWT / RBAC", "Rate Limiting"],
    metric: "< 45ms",
    metricLabel: "P95 Latency",
    deliverables: [
      "Layered controller-service-repository architecture",
      "Strict request validation & sanitize middleware",
      "Predictable standardized JSON error schemas",
    ],
  },
  "database design": {
    code: "PROTOCOL_03",
    category: "Backend & Systems",
    tags: ["MongoDB", "PostgreSQL", "Prisma", "Aggregation"],
    metric: "Zero Dups",
    metricLabel: "Integrity",
    deliverables: [
      "Optimized compound indexing for high query volume",
      "Robust relational & document data models",
      "Aggregation pipelines with data migration scripts",
    ],
  },
  "performance tuning": {
    code: "PROTOCOL_04",
    category: "Full-Stack & Frontend",
    tags: ["Bundle Splitting", "Edge CDN", "Image Pipeline", "SEO"],
    metric: "Sub-100ms",
    metricLabel: "First Paint",
    deliverables: [
      "Dynamic code chunking & font optimization",
      "Server-side caching & revalidation strategy",
      "Zero Cumulative Layout Shift (CLS) guarantee",
    ],
  },
  "responsive interfaces": {
    code: "PROTOCOL_05",
    category: "Full-Stack & Frontend",
    tags: ["Mobile First", "WCAG 2.1 AA", "Framer Motion", "Dark Mode"],
    metric: "100%",
    metricLabel: "Mobile Ready",
    deliverables: [
      "Pixel-perfect layouts across mobile, tablet & 4K",
      "Semantic HTML & keyboard navigation accessibility",
      "Smooth micro-interactions & hardware-accelerated animations",
    ],
  },
  "docker & deployment": {
    code: "PROTOCOL_06",
    category: "DevOps & Security",
    tags: ["Multi-Stage Builds", "Docker Compose", "Health Checks", "Networks"],
    metric: "Slim Image",
    metricLabel: "Container Size",
    deliverables: [
      "Production-grade non-root container isolation",
      "Orchestration scripts for backend, database & frontend",
      "CI-friendly reproducible deployment configs",
    ],
  },
  // ── 3 NEW SERVICES ────────────────────────────────────────────────────────
  "real-time systems & event streaming": {
    code: "PROTOCOL_07",
    category: "Backend & Systems",
    tags: ["Socket.IO", "Redis Pub/Sub", "Presence Sync", "Room Engine"],
    metric: "< 30ms",
    metricLabel: "Broadcast",
    deliverables: [
      "Low-latency duplex WebSocket message channels",
      "Presence detection, live room state & heartbeat",
      "Horizontal scale with Redis pub/sub backplane",
    ],
  },
  "ci/cd pipelines & cloud automation": {
    code: "PROTOCOL_08",
    category: "DevOps & Security",
    tags: ["GitHub Actions", "Vercel / Render", "Zero Downtime", "Secrets Vault"],
    metric: "99.9%",
    metricLabel: "Pipeline SLA",
    deliverables: [
      "Automated lint, unit test & build gatekeeping",
      "Preview deployments on branch pull requests",
      "Zero-downtime rolling production deploys",
    ],
  },
  "security hardening & auth architecture": {
    code: "PROTOCOL_09",
    category: "DevOps & Security",
    tags: ["OAuth2 / JWT", "OWASP Shield", "CORS & Helmet", "Audit Logs"],
    metric: "A+ Rating",
    metricLabel: "Security Posture",
    deliverables: [
      "Role-based access control (RBAC) & cryptographic tokens",
      "Defensive mitigation against XSS, CSRF & SQLi/NoSQLi",
      "Audit logging, rate limiting & secure cookie handling",
    ],
  },
};

/* ── 9 Canonical Default Services ───────────────────────────────────────── */
const CANONICAL_SERVICES: Service[] = [
  {
    _id: "srv-fullstack",
    title: "Full-Stack Development",
    description:
      "End-to-end product development with React, Next.js and Node.js — performance-first, accessible, strictly typed and maintainable.",
    icon: "Code2",
    order: 1,
    isVisible: true,
  },
  {
    _id: "srv-api",
    title: "REST & API Engineering",
    description:
      "Layered Express and Next.js backend APIs with strict payload validation, authentication, rate limiting and predictable response contracts.",
    icon: "Server",
    order: 2,
    isVisible: true,
  },
  {
    _id: "srv-db",
    title: "Database Design",
    description:
      "MongoDB and PostgreSQL schema design with high-efficiency indexing, aggregation pipelines, ACID transactions and sensible data modeling.",
    icon: "Database",
    order: 3,
    isVisible: true,
  },
  {
    _id: "srv-perf",
    title: "Performance Tuning",
    description:
      "Core Web Vitals optimization, bundle tree-shaking, caching tiers, Edge CDNs and image pipeline compression to keep interfaces blisteringly fast.",
    icon: "Gauge",
    order: 4,
    isVisible: true,
  },
  {
    _id: "srv-ui",
    title: "Responsive Interfaces",
    description:
      "Mobile-first, touch-friendly layouts with a unified cyber HUD design system that feels native across desktop, tablet and phone screens.",
    icon: "Smartphone",
    order: 5,
    isVisible: true,
  },
  {
    _id: "srv-docker",
    title: "Docker & Deployment",
    description:
      "Production multi-stage Docker containerization, compose orchestration, environment segregation and cloud-ready infrastructure configs.",
    icon: "Container",
    order: 6,
    isVisible: true,
  },
  // ── 3 NEW SERVICES ──
  {
    _id: "srv-realtime",
    title: "Real-Time Systems & Event Streaming",
    description:
      "Bi-directional event streaming, collaborative live UI synchronization, WebSocket rooms, presence indicators and low-latency pub/sub pipelines.",
    icon: "Zap",
    order: 7,
    isVisible: true,
  },
  {
    _id: "srv-cicd",
    title: "CI/CD Pipelines & Cloud Automation",
    description:
      "Automated GitHub Actions workflows, multi-stage test gates, container registry pushes, environment secrets management and zero-downtime releases.",
    icon: "Rocket",
    order: 8,
    isVisible: true,
  },
  {
    _id: "srv-security",
    title: "Security Hardening & Auth Architecture",
    description:
      "Defensive web engineering with JWT/OAuth2 RBAC, OWASP vulnerability mitigations, cryptographic salting, sanitization and tamper-proof audit trails.",
    icon: "ShieldCheck",
    order: 9,
    isVisible: true,
  },
];

function resolveMeta(title: string, index: number): EnhancedServiceMeta {
  const norm = title.toLowerCase().trim();
  const direct = SERVICE_META_BY_TITLE[norm];
  if (direct) return direct;

  for (const [key, meta] of Object.entries(SERVICE_META_BY_TITLE)) {
    if (norm.includes(key) || key.includes(norm)) return meta;
  }

  // Fallback defaults
  const categories: EnhancedServiceMeta["category"][] = [
    "Full-Stack & Frontend",
    "Backend & Systems",
    "DevOps & Security",
  ];
  return {
    code: `PROTOCOL_${String(index + 1).padStart(2, "0")}`,
    category: categories[index % 3],
    tags: ["TypeScript", "Modern Web", "Production"],
    metric: "High SLA",
    metricLabel: "Standard",
    deliverables: [
      "Custom engineering tailored to product requirements",
      "Comprehensive test coverage & typed contracts",
      "Direct code documentation & deployment guide",
    ],
  };
}

export function Services({
  services = [],
  section,
  index,
}: {
  services: Service[];
  section?: SectionMeta;
  index: number;
}) {
  // Merge DB services with the 3 new services to ensure all 9 are always rendered
  const mergedServices = useMemo(() => {
    const list = [...services];
    for (const canonical of CANONICAL_SERVICES) {
      const exists = list.some(
        (s) => s.title.toLowerCase().trim() === canonical.title.toLowerCase().trim()
      );
      if (!exists) {
        list.push(canonical);
      }
    }
    return list.sort((a, b) => a.order - b.order);
  }, [services]);

  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = ["ALL", "Full-Stack & Frontend", "Backend & Systems", "DevOps & Security"];

  const filtered = useMemo(() => {
    return mergedServices.filter((srv, i) => {
      const meta = resolveMeta(srv.title, i);
      const matchesCat = activeCategory === "ALL" || meta.category === activeCategory;
      const q = search.toLowerCase().trim();
      const matchesQuery =
        !q ||
        srv.title.toLowerCase().includes(q) ||
        srv.description.toLowerCase().includes(q) ||
        meta.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCat && matchesQuery;
    });
  }, [mergedServices, activeCategory, search]);

  const handleInquire = (serviceTitle: string) => {
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
      const textarea = document.querySelector<HTMLTextAreaElement>("#contact textarea");
      if (textarea) {
        textarea.value = `Hi Nihal, I'd like to inquire about your "${serviceTitle}" service. `;
        textarea.focus();
      }
    }
  };

  return (
    <section id="services" className="relative py-14">
      {/* View Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs uppercase tracking-widest text-acc">
              {"// service protocols & capabilities"}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-mono text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {mergedServices.length}/{mergedServices.length} PROTOCOLS ONLINE
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            System <span className="text-grad">Capabilities</span>
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-2xl">
            {section?.description ||
              "Production-grade engineering services built on typed architectures, automated delivery pipelines, and zero-compromise security standards."}
          </p>
        </div>

        {/* Global SLA Vitals ticker */}
        <div className="hud !rounded-xl px-4 py-2.5 hidden lg:flex items-center gap-6 font-mono text-xs">
          <div>
            <div className="text-[10px] text-slate-500 uppercase">Avg Delivery</div>
            <div className="text-white font-bold">1–3 Weeks</div>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <div>
            <div className="text-[10px] text-slate-500 uppercase">Type Safety</div>
            <div className="text-acc font-bold">100% Strict</div>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <div>
            <div className="text-[10px] text-slate-500 uppercase">Architecture</div>
            <div className="text-emerald-400 font-bold">Modular</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        {/* Category Chips */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {categories.map((cat) => {
            const count =
              cat === "ALL"
                ? mergedServices.length
                : mergedServices.filter((s, idx) => resolveMeta(s.title, idx).category === cat)
                    .length;
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`chip text-xs transition cursor-pointer ${
                  active ? "on !border-acc text-acc bg-acc/10" : "text-slate-400 hover:text-white"
                }`}
              >
                {cat === "ALL" ? "All Capabilities" : cat}
                <span className="ml-1.5 opacity-60 font-mono text-[10px]">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Live Filter Input */}
        <div className="flex items-center gap-2 hud !rounded-lg px-3 py-1.5 w-full sm:w-60">
          <Search size={13} className="text-slate-500 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="filter capabilities…"
            className="bg-transparent outline-none text-xs w-full placeholder:text-slate-600 font-mono"
          />
        </div>
      </div>

      {/* 9 Service HUD Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((service, position) => {
          const meta = resolveMeta(service.title, position);
          const isExpanded = expandedId === service._id;

          return (
            <div
              key={service._id}
              className={`hud hud-hover group relative flex flex-col justify-between overflow-hidden p-5 transition-all duration-300 ${
                isExpanded ? "!border-acc glow-sm" : ""
              }`}
            >
              {/* Corner Sci-Fi Bracket Indicators */}
              <div className="pointer-events-none absolute left-0 top-0 w-3 h-3 border-l-2 border-t-2 border-acc/40 group-hover:border-acc transition-colors" />
              <div className="pointer-events-none absolute right-0 bottom-0 w-3 h-3 border-r-2 border-b-2 border-acc/40 group-hover:border-acc transition-colors" />

              {/* Glowing top scan line */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-[2px] scale-x-0 bg-gradient-to-r from-acc via-acc2 to-acc transition-transform duration-500 group-hover:scale-x-100"
              />

              {/* Card Header: Protocol Code + Metric Tag */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-4 font-mono text-[10.5px]">
                  <span className="flex items-center gap-1.5 text-acc font-bold tracking-wider">
                    <Terminal size={11} />
                    {meta.code}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/10 text-slate-400 group-hover:border-acc/30 group-hover:text-acc transition-colors">
                    {meta.metricLabel}: <b className="text-white">{meta.metric}</b>
                  </span>
                </div>

                {/* Icon + Title */}
                <div className="flex items-start gap-3.5 mb-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-acc/30 bg-[#070d30] text-acc shadow-[0_0_15px_rgba(0,255,200,0.12)] group-hover:scale-105 group-hover:shadow-[0_0_20px_var(--acc)] group-hover:border-acc transition-all">
                    <Icon name={service.icon} className="h-6 w-6" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-white tracking-tight group-hover:text-grad transition-colors leading-snug">
                      {service.title}
                    </h3>
                    <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider block mt-0.5">
                      {meta.category}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-[13px] leading-relaxed text-slate-400 mb-4">
                  {service.description}
                </p>

                {/* Tech Badges */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {meta.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-[10px] px-2 py-0.5 rounded bg-acc/10 text-acc/90 border border-acc/20 group-hover:border-acc/40 transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Expandable Deliverables Drawer */}
                {isExpanded && (
                  <div className="fade mb-4 pt-3 border-t border-white/10 space-y-1.5">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-acc">
                      {"// protocol specifications"}
                    </div>
                    {meta.deliverables.map((item) => (
                      <div key={item} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer: Action Buttons */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2 mt-2">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : service._id)}
                  className="font-mono text-[11px] text-slate-400 hover:text-white inline-flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap"
                >
                  <span>{isExpanded ? "Hide Specs" : "View Specs"}</span>
                  <ChevronRight
                    size={13}
                    className={`transition-transform duration-200 shrink-0 ${isExpanded ? "rotate-90 text-acc" : ""}`}
                  />
                </button>

                <button
                  onClick={() => handleInquire(service.title)}
                  className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold text-acc hover:text-white px-2.5 py-1 rounded bg-acc/10 hover:bg-acc/20 border border-acc/30 hover:border-acc cursor-pointer transition-all whitespace-nowrap"
                  title={`Inquire about ${service.title}`}
                >
                  <span>Request Protocol</span>
                  <ArrowUpRight size={12} className="shrink-0" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty Filter State */}
      {filtered.length === 0 && (
        <div className="hud p-12 text-center text-slate-500 font-mono text-sm mt-4">
          <Terminal size={24} className="mx-auto mb-2 text-slate-600" />
          {`$ grep "${search}" services.protocol → zero matching capabilities.`}
        </div>
      )}

      {/* Bottom Capability Guarantee Callout */}
      <div className="mt-8 hud !rounded-2xl p-5 sm:p-6 bg-gradient-to-r from-acc/5 via-transparent to-acc2/5 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl grid place-items-center bg-acc/15 border border-acc/30 text-acc shrink-0">
            <ShieldCheck size={26} />
          </div>
          <div>
            <div className="font-display font-bold text-white text-base">
              Need a bespoke contract or specialized architecture?
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Available for full product development, high-load optimizations, and system design audits.
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            const el = document.getElementById("contact");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
          className="btn-primary inline-flex items-center justify-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-xl font-mono text-xs font-bold cursor-pointer shrink-0"
        >
          <span>Initialize Contract</span>
          <ArrowUpRight size={15} className="shrink-0" />
        </button>
      </div>
    </section>
  );
}
