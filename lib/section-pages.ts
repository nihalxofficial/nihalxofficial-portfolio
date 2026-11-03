/**
 * Homepage component registry for the dashboard.
 *
 * Every bespoke management page under `/sections/<key>` is described here once:
 * which registry entity it edits, which `sections` document controls the
 * homepage visibility, and which in-page anchor the preview link targets. The
 * shared `<SectionEditor>` consumes a config; a new component page is a new
 * entry, not a new file.
 */

export interface SectionPageConfig {
  /** Route param for `/sections/<routeKey>`. */
  routeKey: string;
  title: string;
  description: string;
  /** Lucide icon name for the header. */
  icon: string;
  /** Registry entity whose records this page edits (via `<EntityManager>`). */
  entity: string;
  /**
   * Key of the `sections` document that toggles this block on the homepage.
   * Left empty for pages (like Section Copy) that are not a homepage block.
   */
  sectionKey: string;
  /** Anchor (`#…`) the preview link opens on the public site. */
  anchor: string;
}

const PAGES: SectionPageConfig[] = [
  {
    routeKey: "hero",
    title: "Hero",
    description: "The opening banner: name, role, typing lines, portrait and calls to action.",
    icon: "Home",
    entity: "hero",
    sectionKey: "hero",
    anchor: "hero",
  },
  {
    routeKey: "about",
    title: "About",
    description: "Your narrative, code-card facts, highlights and signature.",
    icon: "User",
    entity: "about",
    sectionKey: "about",
    anchor: "about",
  },
  {
    routeKey: "statistics",
    title: "Statistics",
    description: "The number counters strip and the goals list beside it.",
    icon: "BarChart3",
    entity: "statistics",
    sectionKey: "stats",
    anchor: "stats",
  },
  {
    routeKey: "skills",
    title: "Skills",
    description: "Grouped technologies with proficiency levels and brand icons.",
    icon: "Wrench",
    entity: "skills",
    sectionKey: "skills",
    anchor: "skills",
  },
  {
    routeKey: "services",
    title: "Services",
    description: "What you offer — each service is a card on the homepage.",
    icon: "Layers",
    entity: "services",
    sectionKey: "services",
    anchor: "services",
  },
  {
    routeKey: "projects",
    title: "Projects",
    description: "Your build showcase. Records appear in the homepage Showcase block.",
    icon: "FolderKanban",
    entity: "projects",
    sectionKey: "showcase",
    anchor: "showcase",
  },
  {
    routeKey: "experience",
    title: "Experience",
    description: "Roles in the unified journey timeline.",
    icon: "Briefcase",
    entity: "experience",
    sectionKey: "journey",
    anchor: "journey",
  },
  {
    routeKey: "education",
    title: "Education",
    description: "Degrees and institutions shown in the journey timeline.",
    icon: "GraduationCap",
    entity: "education",
    sectionKey: "education",
    anchor: "education",
  },
  {
    routeKey: "certifications",
    title: "Certifications",
    description: "Credentials list (hidden on the homepage by default).",
    icon: "Award",
    entity: "certifications",
    sectionKey: "certifications",
    anchor: "certifications",
  },
  {
    routeKey: "testimonials",
    title: "Testimonials",
    description: "Quotes and ratings from people you have worked with.",
    icon: "Quote",
    entity: "testimonials",
    sectionKey: "testimonials",
    anchor: "testimonials",
  },
  {
    routeKey: "posts",
    title: "Blog",
    description: "Writing published to the site. The homepage blog block is off by default.",
    icon: "Newspaper",
    entity: "posts",
    sectionKey: "blog",
    anchor: "blog",
  },
  {
    routeKey: "contact",
    title: "Contact",
    description: "Contact details, availability, map pin and social links live in Site settings.",
    icon: "Mail",
    entity: "settings",
    sectionKey: "contact",
    anchor: "contact",
  },
  {
    routeKey: "sections",
    title: "Section Copy",
    description:
      "Headings, descriptions and ordering for every homepage block. Toggles here drive what the site renders.",
    icon: "ListChecks",
    entity: "sections",
    // Edits the whole `sections` collection; no single block toggle.
    sectionKey: "",
    anchor: "",
  },
];

export const SECTION_PAGES: Record<string, SectionPageConfig> = Object.fromEntries(
  PAGES.map((page) => [page.routeKey, page]),
);

export function getSectionPage(routeKey: string | undefined): SectionPageConfig | undefined {
  return routeKey ? SECTION_PAGES[routeKey] : undefined;
}
