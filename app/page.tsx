import { About } from "@/components/site/about";
import { ChatWidget } from "@/components/site/chat-widget";
import { Contact } from "@/components/site/contact";
import { ExperienceEducation } from "@/components/site/experience-education";
import { Footer } from "@/components/site/footer";
import { Hero } from "@/components/site/hero";
import { PortfolioShell } from "@/components/site/portfolio-shell";
import { ScrollToTop } from "@/components/site/scroll-to-top";
import { Services } from "@/components/site/services";
import { Showcase } from "@/components/site/showcase";
import { Skills } from "@/components/site/skills";
import { Stats } from "@/components/site/stats";
import { getPortfolio } from "@/lib/api";
import type { NavigationItem, SectionMeta } from "@/lib/types";

// Page revalidates every 30 seconds
export const revalidate = 30;

export default async function Page() {
  const data = await getPortfolio();

  if (!data) {
    return (
      <main className="container-page flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
        <div className="hud max-w-lg p-8">
          <p className="font-mono text-xs uppercase tracking-widest text-acc">
            // connection error
          </p>
          <h1 className="mt-3 font-display text-2xl font-bold">
            Could not reach the database
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            Make sure the backend container is running and reachable.
          </p>
          <p className="mono mt-5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-slate-500">
            docker compose up -d portfolio-server
          </p>
        </div>
      </main>
    );
  }

  const meta = (key: string): SectionMeta | undefined =>
    data.sections.find((section) => section.key === key);

  // Hidden components: blog, review (testimonials), featured projects (projects)
  const HIDDEN_SECTION_COMPONENTS = new Set(["projects", "testimonials", "blog"]);
  const shown = (key: string) => !HIDDEN_SECTION_COMPONENTS.has(key);

  const heroVisible = Boolean(data.hero);

  const blocks: Array<{ key: string; visible: boolean }> = [
    { key: "about", visible: true },
    { key: "stats", visible: true },
    { key: "services", visible: true },
    { key: "skills", visible: true },
    { key: "projects", visible: false },
    { key: "showcase", visible: true },
    { key: "journey", visible: true },
    { key: "education", visible: true },
    { key: "testimonials", visible: false },
    { key: "blog", visible: false },
    { key: "contact", visible: true },
  ];

  const order = new Map<string, number>();
  blocks
    .filter((block) => block.visible && shown(block.key))
    .forEach((block, position) => order.set(block.key, position + (heroVisible ? 2 : 1)));

  const at = (key: string) => order.get(key) ?? 1;

  // Active navigation items displayed in navbar, dock, mobile dock & footer
  // User requested to hide: stats, featured projects, reviews, blog, services, and journey
  const ALL_SECTION_NAV: Array<{
    key: string;
    href: string;
    defaultLabel: string;
    icon: string;
    isPrimary?: boolean;
  }> = [
    { key: "hero", href: "#hero", defaultLabel: "Home", icon: "Home", isPrimary: true },
    { key: "about", href: "#about", defaultLabel: "About", icon: "User" },
    { key: "skills", href: "#skills", defaultLabel: "Skills", icon: "Wrench" },
    { key: "showcase", href: "#showcase", defaultLabel: "Showcase", icon: "Rocket", isPrimary: true },
    { key: "contact", href: "#contact", defaultLabel: "Contact", icon: "Mail", isPrimary: true },
  ];

  const HIDDEN_NAV_KEYS = new Set([
    "stats",
    "services",
    "projects",
    "testimonials",
    "reviews",
    "review",
    "blog",
    "journey",
  ]);

  const HIDDEN_NAV_HREFS = new Set([
    "#stats",
    "#services",
    "#projects",
    "#testimonials",
    "#reviews",
    "#blog",
    "/blog",
    "/projects",
    "#journey",
  ]);

  const isHiddenNav = (href: string, label?: string) => {
    const cleanHref = (href || "").toLowerCase().trim();
    const cleanLabel = (label || "").toLowerCase().trim();
    if (HIDDEN_NAV_HREFS.has(cleanHref)) return true;
    const cleanKey = cleanHref.replace(/^#/, "").split("/")[0];
    if (HIDDEN_NAV_KEYS.has(cleanKey)) return true;
    if (
      [
        "stats",
        "services",
        "projects",
        "featured projects",
        "reviews",
        "review",
        "testimonials",
        "blog",
        "journey",
        "experience",
      ].includes(cleanLabel)
    ) {
      return true;
    }
    return false;
  };

  const existingNavByHref = new Map(
    (data.navigation || []).map((item) => [item.href.toLowerCase(), item])
  );

  const nav: NavigationItem[] = ALL_SECTION_NAV.map((canonical, idx) => {
    const existing = existingNavByHref.get(canonical.href.toLowerCase());
    if (existing) {
      return {
        ...existing,
        isVisible: true,
        isPrimary: existing.isPrimary ?? canonical.isPrimary,
        order: idx + 1,
      };
    }
    return {
      _id: `nav-${canonical.key}`,
      label: canonical.defaultLabel,
      href: canonical.href,
      icon: canonical.icon,
      isPrimary: canonical.isPrimary ?? false,
      order: idx + 1,
      isVisible: true,
    };
  }).filter((item) => !isHiddenNav(item.href, item.label));

  // Preserve any custom CMS navigation links that are not section anchors and not hidden
  for (const item of data.navigation || []) {
    if (
      item.isVisible &&
      !isHiddenNav(item.href, item.label) &&
      !ALL_SECTION_NAV.some((c) => c.href.toLowerCase() === item.href.toLowerCase())
    ) {
      nav.push(item);
    }
  }

  return (
    <PortfolioShell navigation={nav} settings={data.settings}>
      {data.hero ? <Hero hero={data.hero} settings={data.settings} navigation={nav} /> : null}

      {data.about ? (
        <About about={data.about} section={meta("about")} index={at("about")} />
      ) : null}

      <Stats statistics={data.statistics} section={meta("stats")} index={at("stats")} />

      <Services
        services={data.services}
        section={meta("services")}
        index={at("services")}
      />

      <Skills groups={data.skills} projects={data.projects} section={meta("skills")} index={at("skills")} />

      <Showcase
        projects={data.projects}
        section={meta("showcase")}
        index={at("showcase")}
      />

      <ExperienceEducation
        experience={data.experience}
        education={data.education}
        journeySection={meta("journey")}
        educationSection={meta("education")}
        journeyIndex={at("journey")}
        educationIndex={at("education")}
      />

      <Contact settings={data.settings} section={meta("contact")} index={at("contact")} />

      <Footer
        settings={data.settings}
        navigation={nav}
        year={new Date().getFullYear()}
      />

      <ScrollToTop />
      <ChatWidget />
    </PortfolioShell>
  );
}
