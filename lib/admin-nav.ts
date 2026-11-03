/**
 * Dashboard navigation — single source of truth for the sidebar.
 *
 * The sidebar is organised into the four logical groups the CMS needs:
 * Overview, Content Management, Customization and System. Each item declares
 * its own Lucide icon (resolved through `components/ui/icon`) and, where it
 * edits a registry entity, the `entity` it maps to so the shell can mark the
 * active route and keep links in sync with the content API.
 *
 * Component management lives under `/sections/<key>` (one bespoke page per
 * homepage component); navigation and the settings hub have their own routes.
 */

import { ADMIN_BASE, adminHref } from "@/lib/admin-routes";

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  /** Registry entity this page edits, used for active-route matching. */
  entity?: string;
  /** Set when the destination opens the public site rather than the dashboard. */
  external?: boolean;
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

/** Overview group. */
const OVERVIEW: NavGroup = {
  id: "overview",
  label: "Overview",
  items: [
    { href: ADMIN_BASE, label: "Dashboard Overview", icon: "LayoutDashboard" },
    { href: adminHref("analytics"), label: "Website Analytics", icon: "Gauge" },
    { href: adminHref("analytics/projects"), label: "Project Analytics", icon: "BarChart3" },
  ],
};

/**
 * One bespoke management page per homepage component, plus the collections the
 * site renders (projects, posts, media, messages). Ordered to mirror the page.
 */
const CONTENT: NavGroup = {
  id: "content",
  label: "Content Management",
  items: [
    { href: adminHref("navigation"), label: "Navigation Manager", icon: "Compass" },
    { href: adminHref("sections/hero"), label: "Hero", icon: "Home", entity: "hero" },
    { href: adminHref("sections/about"), label: "About", icon: "User", entity: "about" },
    { href: adminHref("sections/statistics"), label: "Statistics", icon: "BarChart3", entity: "statistics" },
    { href: adminHref("sections/skills"), label: "Skills", icon: "Wrench", entity: "skills" },
    { href: adminHref("sections/services"), label: "Services", icon: "Layers", entity: "services" },
    { href: adminHref("sections/projects"), label: "Projects", icon: "FolderKanban", entity: "projects" },
    { href: adminHref("sections/experience"), label: "Experience", icon: "Briefcase", entity: "experience" },
    { href: adminHref("sections/education"), label: "Education", icon: "GraduationCap", entity: "education" },
    { href: adminHref("sections/certifications"), label: "Certifications", icon: "Award", entity: "certifications" },
    { href: adminHref("sections/testimonials"), label: "Testimonials", icon: "Quote", entity: "testimonials" },
    { href: adminHref("sections/posts"), label: "Blog", icon: "Newspaper", entity: "posts" },
    { href: adminHref("sections/sections"), label: "Section Copy", icon: "ListChecks", entity: "sections" },
    { href: adminHref("sections/contact"), label: "Contact", icon: "Mail" },
    { href: adminHref("media"), label: "Media", icon: "Image" },
    { href: adminHref("messages"), label: "Messages", icon: "Inbox" },
  ],
};

/** Appearance and brand assets, all persisted on the `settings` document. */
const CUSTOMIZATION: NavGroup = {
  id: "customization",
  label: "Customization",
  items: [
    { href: adminHref("settings"), label: "Global Settings", icon: "Settings" },
    { href: adminHref("settings/theme"), label: "Theme & Colors", icon: "Palette" },
    { href: adminHref("settings/background"), label: "Background Settings", icon: "Sparkles" },
    { href: adminHref("settings/typography"), label: "Typography", icon: "Type" },
    { href: adminHref("settings/branding"), label: "Assets & Branding", icon: "ImagePlus" },
  ],
};

/** Account, session and the public site shortcut. */
const SYSTEM: NavGroup = {
  id: "system",
  label: "System",
  items: [
    { href: adminHref("profile"), label: "Profile & Security", icon: "UserCog" },
    { href: "/", label: "View Site", icon: "Globe", external: true },
  ],
};

export const NAV_GROUPS: NavGroup[] = [OVERVIEW, CONTENT, CUSTOMIZATION, SYSTEM];

/** Flat lookup of every dashboard route → group, used for the topbar title. */
export function findNavItem(pathname: string): { item: NavItem; group: NavGroup } | null {
  // Collect all matching internal links and keep the longest href, so a nested
  // route like `/analytics/projects` wins over its parent `/analytics`.
  let best: { item: NavItem; group: NavGroup } | null = null;
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (item.external) continue;
      const active =
        item.href === ADMIN_BASE ? pathname === ADMIN_BASE : pathname.startsWith(item.href);
      if (active && (!best || item.href.length > best.item.href.length)) {
        best = { item, group };
      }
    }
  }
  return best;
}
