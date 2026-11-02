import { ChatWidget } from "@/components/site/chat-widget";
import { Footer } from "@/components/site/footer";
import { About } from "@/components/site/about";
import { Blog } from "@/components/site/blog";
import { Contact } from "@/components/site/contact";
import { ExperienceEducation } from "@/components/site/experience-education";
import { Hero } from "@/components/site/hero";
import { PortfolioShell } from "@/components/site/portfolio-shell";
import { Projects } from "@/components/site/projects";
import { Services } from "@/components/site/services";
import { Showcase } from "@/components/site/showcase";
import { Skills } from "@/components/site/skills";
import { Stats } from "@/components/site/stats";
import { Testimonials } from "@/components/site/testimonials";
import { getPortfolio } from "@/lib/api";
import type { SectionMeta } from "@/lib/types";

export const revalidate = 60;

/**
 * The public portfolio.
 *
 * Every string, image and ordering decision comes from the API, which reads
 * MongoDB — the dashboard writes the same documents, so nothing here is
 * hardcoded.
 */
export default async function HomePage() {
  const data = await getPortfolio();

  if (!data) {
    return (
      <main className="grid min-h-screen place-items-center px-6">
        <div className="panel max-w-md p-8 text-center">
          <p className="mono text-[11px] uppercase tracking-[0.22em] text-acc">Offline</p>
          <h1 className="mt-3 text-2xl font-semibold">Content API unreachable</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            The portfolio is rendered from the API, so this page needs{" "}
            <span className="mono text-acc">portfolio-server</span> to be running. Start it and
            refresh.
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

  const shown = (key: string) => meta(key)?.isVisible ?? true;

  const heroVisible = Boolean(data.hero) && shown("hero");

  const blocks: Array<{ key: string; visible: boolean }> = [
    { key: "about", visible: Boolean(data.about) },
    { key: "stats", visible: data.statistics.length > 0 },
    { key: "services", visible: data.services.length > 0 },
    { key: "skills", visible: data.skills.length > 0 },
    { key: "projects", visible: data.projects.length > 0 },
    { key: "showcase", visible: data.projects.length > 1 },
    { key: "journey", visible: data.experience.length > 0 },
    { key: "education", visible: data.education.length > 0 },
    { key: "testimonials", visible: data.testimonials.length > 0 },
    { key: "blog", visible: data.posts.length > 0 },
    { key: "contact", visible: true },
  ];

  const order = new Map<string, number>();
  blocks
    .filter((block) => block.visible && shown(block.key))
    .forEach((block, position) => order.set(block.key, position + (heroVisible ? 2 : 1)));

  const at = (key: string) => order.get(key) ?? 1;

  const nav = data.navigation.filter((item) => item.isVisible);

  const featuredPool = data.projects.filter((project) => project.isFeatured);
  const featured = (featuredPool.length > 0 ? featuredPool : data.projects).slice(0, 3);

  return (
    <PortfolioShell navigation={nav} settings={data.settings}>
      {data.hero && heroVisible ? <Hero hero={data.hero} settings={data.settings} navigation={nav} /> : null}

      {data.about && shown("about") ? (
        <About about={data.about} section={meta("about")} index={at("about")} />
      ) : null}

      {shown("stats") ? (
        <Stats statistics={data.statistics} section={meta("stats")} index={at("stats")} />
      ) : null}

      {shown("services") ? (
        <Services
          services={data.services}
          section={meta("services")}
          index={at("services")}
        />
      ) : null}

      {shown("skills") ? (
        <Skills groups={data.skills} section={meta("skills")} index={at("skills")} />
      ) : null}

      {shown("projects") ? (
        <Projects
          projects={featured}
          total={data.projects.length}
          section={meta("projects")}
          index={at("projects")}
        />
      ) : null}

      {shown("showcase") ? (
        <Showcase
          projects={data.projects}
          section={meta("showcase")}
          index={at("showcase")}
        />
      ) : null}

      {shown("journey") || shown("education") ? (
        <ExperienceEducation
          experience={shown("journey") ? data.experience : []}
          education={shown("education") ? data.education : []}
          journeySection={meta("journey")}
          educationSection={meta("education")}
          journeyIndex={at("journey")}
          educationIndex={at("education")}
        />
      ) : null}

      {shown("testimonials") ? (
        <Testimonials
          testimonials={data.testimonials}
          section={meta("testimonials")}
          index={at("testimonials")}
        />
      ) : null}

      {shown("blog") ? (
        <Blog posts={data.posts} section={meta("blog")} index={at("blog")} />
      ) : null}

      {shown("contact") ? (
        <Contact settings={data.settings} section={meta("contact")} index={at("contact")} />
      ) : null}

      <Footer
        settings={data.settings}
        navigation={nav}
        year={new Date().getFullYear()}
      />

      <ChatWidget />
    </PortfolioShell>
  );
}
