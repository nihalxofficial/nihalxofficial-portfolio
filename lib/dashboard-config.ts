/**
 * Dashboard Configuration
 * Centralized configuration for all dashboard navigation, component management,
 * and CMS features.
 */

import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  BarChart3,
  Target,
  Navigation,
  Sparkles,
  User,
  BarChart,
  Briefcase,
  Code,
  GraduationCap,
  FolderKanban,
  MessageSquare,
  Award,
  Star,
  FileText,
  Mail,
  Settings,
  Palette,
  Image,
  Type,
  Upload,
  Shield,
  UserCircle,
  Globe,
  Layers,
  Box,
} from "lucide-react";

export interface DashboardNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
}

export interface DashboardNavGroup {
  label: string;
  items: DashboardNavItem[];
}

/**
 * Homepage Component Management Configuration
 * Maps each frontend component to its dashboard management page
 */
export interface ComponentManagementConfig {
  key: string;
  label: string;
  description: string;
  icon: LucideIcon;
  route: string;
  entity?: string; // Backend entity name
  isSingleton: boolean;
  hasCustomPage: boolean; // Whether it needs a custom management page
  defaultVisible: boolean;
}

export const HOMEPAGE_COMPONENTS: ComponentManagementConfig[] = [
  {
    key: "hero",
    label: "Hero Section",
    description: "Main hero banner with portrait, typewriter, and CTAs",
    icon: Sparkles,
    route: "/control-centre/components/hero",
    entity: "heroes",
    isSingleton: true,
    hasCustomPage: true,
    defaultVisible: true,
  },
  {
    key: "about",
    label: "About / Who Am I",
    description: "Introduction, highlights, code card, and signature",
    icon: User,
    route: "/control-centre/components/about",
    entity: "abouts",
    isSingleton: true,
    hasCustomPage: true,
    defaultVisible: true,
  },
  {
    key: "statistics",
    label: "Numbers Speak / Statistics",
    description: "Animated stat cards with sparklines and vitals",
    icon: BarChart,
    route: "/control-centre/components/statistics",
    entity: "statistics",
    isSingleton: false,
    hasCustomPage: true,
    defaultVisible: true,
  },
  {
    key: "skills",
    label: "Skills & Technologies",
    description: "Tech stack with grid/orbit views and proficiency levels",
    icon: Code,
    route: "/control-centre/components/skills",
    entity: "skills",
    isSingleton: false,
    hasCustomPage: true,
    defaultVisible: true,
  },
  {
    key: "services",
    label: "Services",
    description: "Engineering service offerings with expandable specs",
    icon: Briefcase,
    route: "/control-centre/components/services",
    entity: "services",
    isSingleton: false,
    hasCustomPage: true,
    defaultVisible: true,
  },
  {
    key: "projects",
    label: "Featured Projects / Showcase",
    description: "Project gallery with preview cards and tech stack",
    icon: FolderKanban,
    route: "/control-centre/components/projects",
    entity: "projects",
    isSingleton: false,
    hasCustomPage: true,
    defaultVisible: true,
  },
  {
    key: "experience",
    label: "Experience",
    description: "Work experience timeline with technologies",
    icon: Briefcase,
    route: "/control-centre/components/experience",
    entity: "experiences",
    isSingleton: false,
    hasCustomPage: true,
    defaultVisible: true,
  },
  {
    key: "education",
    label: "Education",
    description: "Academic background and qualifications",
    icon: GraduationCap,
    route: "/control-centre/components/education",
    entity: "educations",
    isSingleton: false,
    hasCustomPage: true,
    defaultVisible: true,
  },
  {
    key: "certifications",
    label: "Certifications",
    description: "Professional certifications and credentials",
    icon: Award,
    route: "/control-centre/components/certifications",
    entity: "certifications",
    isSingleton: false,
    hasCustomPage: true,
    defaultVisible: true,
  },
  {
    key: "testimonials",
    label: "Testimonials",
    description: "Client testimonials and reviews",
    icon: Star,
    route: "/control-centre/components/testimonials",
    entity: "testimonials",
    isSingleton: false,
    hasCustomPage: true,
    defaultVisible: true,
  },
  {
    key: "blog",
    label: "Blog",
    description: "Latest blog posts and articles",
    icon: FileText,
    route: "/control-centre/components/blog",
    entity: "posts",
    isSingleton: false,
    hasCustomPage: true,
    defaultVisible: true,
  },
  {
    key: "contact",
    label: "Contact Section",
    description: "Contact form, availability, and social links",
    icon: Mail,
    route: "/control-centre/components/contact",
    entity: "settings",
    isSingleton: true,
    hasCustomPage: true,
    defaultVisible: true,
  },
];

/**
 * Dashboard Navigation Structure
 */
export const DASHBOARD_NAV: DashboardNavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/control-centre",
        icon: LayoutDashboard,
        description: "Overview and quick stats",
      },
      {
        label: "Website Analytics",
        href: "/control-centre/analytics",
        icon: BarChart3,
        description: "Visitor trends and traffic sources",
      },
      {
        label: "Project Analytics",
        href: "/control-centre/analytics/projects",
        icon: Target,
        description: "Project engagement and performance",
      },
    ],
  },
  {
    label: "Content Management",
    items: [
      {
        label: "Navigation Manager",
        href: "/control-centre/navigation",
        icon: Navigation,
        description: "Manage site navigation and links",
      },
      ...HOMEPAGE_COMPONENTS.map((comp) => ({
        label: comp.label,
        href: comp.route,
        icon: comp.icon,
        description: comp.description,
      })),
    ],
  },
  {
    label: "Customization",
    items: [
      {
        label: "Global Settings",
        href: "/control-centre/settings/global",
        icon: Globe,
        description: "Site name, SEO, and contact info",
      },
      {
        label: "Theme & Colors",
        href: "/control-centre/settings/theme",
        icon: Palette,
        description: "Accent colors and palette",
      },
      {
        label: "Background",
        href: "/control-centre/settings/background",
        icon: Layers,
        description: "Animated background effects",
      },
      {
        label: "Typography",
        href: "/control-centre/settings/typography",
        icon: Type,
        description: "Font selection and styles",
      },
      {
        label: "Assets & Branding",
        href: "/control-centre/settings/branding",
        icon: Upload,
        description: "Logos, favicon, and media",
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        label: "Media Library",
        href: "/control-centre/media",
        icon: Image,
        description: "Upload and manage images",
      },
      {
        label: "Messages",
        href: "/control-centre/messages",
        icon: MessageSquare,
        description: "Contact form submissions",
      },
      {
        label: "Profile",
        href: "/control-centre/profile",
        icon: UserCircle,
        description: "Account settings",
      },
      {
        label: "Component Visibility",
        href: "/control-centre/components",
        icon: Box,
        description: "Enable/disable homepage sections",
      },
    ],
  },
];

/**
 * Get navigation item by href
 */
export function getNavItemByHref(href: string): DashboardNavItem | null {
  for (const group of DASHBOARD_NAV) {
    const item = group.items.find((i) => i.href === href);
    if (item) return item;
  }
  return null;
}

/**
 * Get navigation group for a given href
 */
export function getNavGroupByHref(href: string): DashboardNavGroup | null {
  for (const group of DASHBOARD_NAV) {
    if (group.items.some((i) => i.href === href)) {
      return group;
    }
  }
  return null;
}

/**
 * Get component config by key
 */
export function getComponentByKey(key: string): ComponentManagementConfig | null {
  return HOMEPAGE_COMPONENTS.find((c) => c.key === key) ?? null;
}

/**
 * Get component config by entity name
 */
export function getComponentByEntity(entity: string): ComponentManagementConfig | null {
  return HOMEPAGE_COMPONENTS.find((c) => c.entity === entity) ?? null;
}

/**
 * Available Google Fonts for Typography Settings
 */
export const FONT_OPTIONS = {
  sans: [
    { value: "inter", label: "Inter", category: "sans-serif" },
    { value: "outfit", label: "Outfit", category: "sans-serif" },
    { value: "manrope", label: "Manrope", category: "sans-serif" },
    { value: "plus-jakarta-sans", label: "Plus Jakarta Sans", category: "sans-serif" },
    { value: "space-grotesk", label: "Space Grotesk", category: "sans-serif" },
    { value: "dm-sans", label: "DM Sans", category: "sans-serif" },
    { value: "sora", label: "Sora", category: "sans-serif" },
    { value: "urbanist", label: "Urbanist", category: "sans-serif" },
    { value: "josefin-sans", label: "Josefin Sans", category: "sans-serif" },
  ],
  mono: [
    { value: "jetbrains-mono", label: "JetBrains Mono", category: "monospace" },
    { value: "fira-code", label: "Fira Code", category: "monospace" },
    { value: "ibm-plex-mono", label: "IBM Plex Mono", category: "monospace" },
    { value: "space-mono", label: "Space Mono", category: "monospace" },
    { value: "source-code-pro", label: "Source Code Pro", category: "monospace" },
  ],
};

/**
 * Accent Color Presets
 */
export const ACCENT_PRESETS = [
  {
    id: "cyan",
    label: "Cyan",
    primary: "hsl(189 100% 50%)",
    secondary: "hsl(189 100% 70%)",
  },
  {
    id: "emerald",
    label: "Emerald",
    primary: "hsl(142 76% 36%)",
    secondary: "hsl(142 76% 56%)",
  },
  {
    id: "magenta",
    label: "Magenta",
    primary: "hsl(328 86% 58%)",
    secondary: "hsl(328 86% 78%)",
  },
  {
    id: "amber",
    label: "Amber",
    primary: "hsl(38 92% 50%)",
    secondary: "hsl(38 92% 70%)",
  },
];

/**
 * Background Effect Options
 */
export const BACKGROUND_EFFECTS = [
  {
    value: "dna",
    label: "DNA Helix",
    description: "3D flowing double-helix with particle constellation",
  },
  {
    value: "rain",
    label: "Matrix Rain",
    description: "Falling Matrix-style code animation",
  },
  {
    value: "none",
    label: "Minimal Grid",
    description: "Simple cyber grid background",
  },
];
