import { About } from "@/components/site/about";
import { Blog } from "@/components/site/blog";
import { ChatWidget } from "@/components/site/chat-widget";
import { Contact } from "@/components/site/contact";
import { ExperienceEducation } from "@/components/site/experience-education";
import { Footer } from "@/components/site/footer";
import { Hero } from "@/components/site/hero";
import { PortfolioShell } from "@/components/site/portfolio-shell";
import { Projects } from "@/components/site/projects";
import { Services } from "@/components/site/services";
import { Showcase } from "@/components/site/showcase";
import { Skills } from "@/components/site/skills";
import { Stats } from "@/components/site/stats";
import { Testimonials } from "@/components/site/testimonials";
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

  // User explicitly requested to show ALL components on the portfolio
  const shown = (_key: string) => true;

  const heroVisible = Boolean(data.hero);

  const blocks: Array<{ key: string; visible: boolean }> = [
    { key: "about", visible: true },
    { key: "stats", visible: true },
    { key: "services", visible: true },
    { key: "skills", visible: true },
    { key: "projects", visible: true },
    { key: "showcase", visible: true },
    { key: "journey", visible: true },
    { key: "education", visible: true },
    { key: "testimonials", visible: true },
    { key: "blog", visible: true },
    { key: "contact", visible: true },
  ];

  const order = new Map<string, number>();
  blocks
    .filter((block) => block.visible && shown(block.key))
    .forEach((block, position) => order.set(block.key, position + (heroVisible ? 2 : 1)));

  const at = (key: string) => order.get(key) ?? 1;

  // Complete navigation map for all active sections shown on the page
  const ALL_SECTION_NAV: Array<{
    key: string;
    href: string;
    defaultLabel: string;
    icon: string;
    isPrimary?: boolean;
  }> = [
    { key: "hero", href: "#hero", defaultLabel: "Home", icon: "Home", isPrimary: true },
    { key: "about", href: "#about", defaultLabel: "About", icon: "User" },
    { key: "stats", href: "#stats", defaultLabel: "Stats", icon: "Cpu" },
    { key: "services", href: "#services", defaultLabel: "Services", icon: "Layers" },
    { key: "skills", href: "#skills", defaultLabel: "Skills", icon: "Wrench" },
    { key: "projects", href: "#projects", defaultLabel: "Projects", icon: "FolderKanban", isPrimary: true },
    { key: "showcase", href: "#showcase", defaultLabel: "Showcase", icon: "Rocket" },
    { key: "journey", href: "#journey", defaultLabel: "Journey", icon: "Briefcase" },
    { key: "testimonials", href: "#testimonials", defaultLabel: "Reviews", icon: "Star" },
    { key: "blog", href: "#blog", defaultLabel: "Blog", icon: "BookOpen" },
    { key: "contact", href: "#contact", defaultLabel: "Contact", icon: "Mail", isPrimary: true },
  ];

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
  });

  // Preserve any custom CMS navigation links that are not section anchors
  for (const item of data.navigation || []) {
    if (
      item.isVisible &&
      !ALL_SECTION_NAV.some((c) => c.href.toLowerCase() === item.href.toLowerCase())
    ) {
      nav.push(item);
    }
  }

  const featuredPool = data.projects.filter((project) => project.isFeatured);
  const featured = (featuredPool.length > 0 ? featuredPool : data.projects).slice(0, 3);

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

      <Projects
        projects={featured}
        total={data.projects.length}
        section={meta("projects")}
        index={at("projects")}
      />

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

      <Testimonials
        testimonials={data.testimonials}
        section={meta("testimonials")}
        index={at("testimonials")}
      />

      <Blog posts={data.posts} section={meta("blog")} index={at("blog")} />

      <Contact settings={data.settings} section={meta("contact")} index={at("contact")} />

      <Footer
        settings={data.settings}
        navigation={nav}
        year={new Date().getFullYear()}
      />

      <ChatWidget />
    </PortfolioShell>
  );
}
