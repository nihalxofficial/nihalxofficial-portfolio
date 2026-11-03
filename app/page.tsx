import { About } from "@/components/site/about";
import { Contact } from "@/components/site/contact";
import { ExperienceEducation } from "@/components/site/experience-education";
import { Footer } from "@/components/site/footer";
import { Hero } from "@/components/site/hero";
import { PortfolioShell } from "@/components/site/portfolio-shell";
import { Services } from "@/components/site/services";
import { Showcase } from "@/components/site/showcase";
import { Skills } from "@/components/site/skills";
import { Stats } from "@/components/site/stats";
import { getPortfolio } from "@/lib/api";
import type { SectionMeta } from "@/lib/types";

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

  // Section visibility and order are owned entirely by the CMS `sections`
  // documents. A key with no document yet defaults to visible so the seeded
  // design never loses content to a missing row; the dashboard toggle drives it
  // from here on. Nothing is hard-coded in this file anymore.
  const show = (key: string): boolean => {
    const section = meta(key);
    return section ? section.isVisible : true;
  };

  // Decorative section number, ranked across the visible sections by their CMS
  // order. Components treat this as optional eye-candy, not layout.
  const visibleOrder = data.sections
    .filter((section) => section.isVisible)
    .sort((a, b) => a.order - b.order)
    .map((section) => section.key);
  const at = (key: string): number => {
    const position = visibleOrder.indexOf(key);
    return position >= 0 ? position + 1 : 1;
  };

  // Navigation is whatever the CMS publishes: the public API already returns
  // only visible items sorted by order, so a disabled link drops out of the
  // navbar, dock, mobile nav, footer and the command palette in one place.
  const nav = data.navigation;

  const hasJourney = show("journey");
  const hasEducation = show("education");

  return (
    <PortfolioShell navigation={nav} settings={data.settings}>
      {data.hero && show("hero") ? (
        <Hero hero={data.hero} settings={data.settings} navigation={nav} />
      ) : null}

      {data.about && show("about") ? (
        <About about={data.about} section={meta("about")} index={at("about")} />
      ) : null}

      {show("stats") ? (
        <Stats statistics={data.statistics} section={meta("stats")} index={at("stats")} />
      ) : null}

      {show("services") ? (
        <Services services={data.services} section={meta("services")} index={at("services")} />
      ) : null}

      {show("skills") ? (
        <Skills
          groups={data.skills}
          projects={data.projects}
          section={meta("skills")}
          index={at("skills")}
        />
      ) : null}

      {show("showcase") ? (
        <Showcase projects={data.projects} section={meta("showcase")} index={at("showcase")} />
      ) : null}

      {hasJourney || hasEducation ? (
        <ExperienceEducation
          experience={data.experience}
          education={data.education}
          journeySection={meta("journey")}
          educationSection={meta("education")}
          journeyIndex={at("journey")}
          educationIndex={at("education")}
          showJourney={hasJourney}
          showEducation={hasEducation}
        />
      ) : null}

      {show("contact") ? (
        <Contact settings={data.settings} section={meta("contact")} index={at("contact")} />
      ) : null}

      <Footer
        settings={data.settings}
        navigation={nav}
        year={new Date().getFullYear()}
      />
    </PortfolioShell>
  );
}
