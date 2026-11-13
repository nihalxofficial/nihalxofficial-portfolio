/**
 * Shapes returned by portfolio-server (`GET /api/v1/portfolio`).
 * The dashboard edits these documents, so every field the admin can change is
 * represented here.
 */

export interface DocMeta {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CtaLink {
  label: string;
  href: string;
}

export interface Hero extends DocMeta {
  greeting: string;
  name: string;
  highlightedName: string;
  role: string;
  description: string;
  availability: { label: string; isAvailable: boolean };
  primaryCta: CtaLink;
  secondaryCta: CtaLink;
  terminal: { command: string; lines: string[] };
  /** Banner typewriter: cycles through `lines` behind an optional `prefix`. */
  rotator?: { prefix?: string; lines: string[] };
  portraitUrl: string;
  /** Handwritten-style note floating beside the portrait. */
  tagline?: string;
  order: number;
  isVisible: boolean;
}

export interface AboutHighlight {
  icon: string;
  label: string;
  value: string;
}

export interface About extends DocMeta {
  label: string;
  heading: string;
  paragraphs: string[];
  portraitUrl: string;
  codeCard: {
    name?: string;
    role?: string;
    location?: string;
    education?: string;
    experience?: string;
    passion?: string[];
  };
  highlights: AboutHighlight[];
  signature: string;
  order: number;
  isVisible: boolean;
}

export interface Statistic extends DocMeta {
  value: string;
  label: string;
  description: string;
  icon: string;
  order: number;
  isVisible: boolean;
}

export interface Skill {
  id: string;
  name: string;
  icon: string;
  brandColor: string;
  proficiency: "learning" | "familiar" | "advanced" | "expert";
}

export interface SkillGroup {
  category: string;
  skills: Skill[];
}

export interface Service extends DocMeta {
  title: string;
  description: string;
  icon: string;
  order: number;
  isVisible: boolean;
}

export interface Project extends DocMeta {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  thumbnailUrl: string;
  screenshots: string[];
  category: string;
  techStack: string[];
  features: string[];
  challenges: string;
  improvements: string;
  liveUrl: string;
  sourceUrl: string;
  isFeatured: boolean;
  isPublished: boolean;
  order: number;
  seo?: { title?: string; description?: string };
}

export interface Experience extends DocMeta {
  organization: string;
  role: string;
  employmentType: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: "current" | "upcoming" | "ongoing" | "completed";
  description: string;
  responsibilities: string[];
  technologies: string[];
  order: number;
  isVisible: boolean;
}

export interface Education extends DocMeta {
  degree: string;
  institution: string;
  field: string;
  period: string;
  description: string;
  highlights: string[];
  icon: string;
  order: number;
  isVisible: boolean;
}

export interface Certification extends DocMeta {
  title: string;
  issuer: string;
  year: string;
  credentialUrl: string;
  icon: string;
  accentColor: string;
  order: number;
  isVisible: boolean;
}

export interface Testimonial extends DocMeta {
  name: string;
  role: string;
  message: string;
  rating: number;
  avatarUrl: string;
  order: number;
  isVisible: boolean;
}

export interface BlogPost extends DocMeta {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  tags: string[];
  category: string;
  readingTime: string;
  isPublished: boolean;
  publishedAt?: string;
  seo?: { title?: string; description?: string };
}

export interface NavigationItem extends DocMeta {
  label: string;
  href: string;
  /** Lucide icon name shown before the label in the header pill. */
  icon?: string;
  /** Pinned to the mobile bottom dock; the rest fold into "More". */
  isPrimary?: boolean;
  /** Opens the link in a new browser tab (external links). */
  opensInNewTab?: boolean;
  order: number;
  isVisible: boolean;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export interface SiteBranding {
  navLogoLight?: string;
  navLogoDark?: string;
  footerLogoLight?: string;
  footerLogoDark?: string;
  faviconUrl?: string;
  logoAlt?: string;
  /** Short initials mark (e.g. "NB") shown when no logo image is uploaded. */
  mark?: string;
  /** Text wordmark shown next to the mark in the header and footer. */
  wordmark?: string;
}

/** Font keys resolved by `lib/fonts.ts`; empty values fall back to the defaults. */
export interface SiteTypography {
  sans?: string;
  display?: string;
  mono?: string;
}

/** Owner-controlled global theme; empty values keep the built-in design. */
export interface SiteTheme {
  /** Key from the site's ACCENTS list (e.g. "cyan"). */
  accentId?: string;
  /** Animated background engine, matching the frontend BackgroundMode union. */
  backgroundEffect?: string;
  /** Optional palette overrides; empty fields fall back to the accent preset. */
  palette?: {
    primary?: string;
    secondary?: string;
    background?: string;
    text?: string;
  };
}

export interface SiteSettings extends DocMeta {
  siteName: string;
  siteUrl: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  ogImageUrl: string;
  branding?: SiteBranding;
  typography?: SiteTypography;
  theme?: SiteTheme;
  contact: {
    email?: string;
    phone?: string;
    location?: string;
    availability?: string;
    /** Optional pin for the contact map. Empty means "geocode `location`". */
    mapLat?: string;
    mapLng?: string;
    mapZoom?: number;
    mapEmbedUrl?: string;
  };
  socialLinks: SocialLink[];
  /** Footer copy; empty values fall back to the built-in defaults. */
  footer?: {
    tagline?: string;
    description?: string;
    navigationHeading?: string;
    elsewhereHeading?: string;
    resumeLabel?: string;
    ctaLabel?: string;
    /** Supports {year} and {name} tokens. */
    copyright?: string;
    builtWith?: string;
    stack?: string[];
  };
  resumeUrl: string;
  backgroundEffect?: string;
}

export interface SectionMeta extends DocMeta {
  key: string;
  label: string;
  heading: string;
  description: string;
  /** Optional extra lines a section renders as a list (e.g. the goals card). */
  items?: string[];
  order: number;
  isVisible: boolean;
}

export interface Portfolio {
  hero: Hero | null;
  about: About | null;
  statistics: Statistic[];
  skills: SkillGroup[];
  services: Service[];
  projects: Project[];
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
  testimonials: Testimonial[];
  posts: BlogPost[];
  navigation: NavigationItem[];
  settings: SiteSettings | null;
  sections: SectionMeta[];
}

/**
 * Extended Analytics Types for Advanced Dashboard
 */

export interface AnalyticsMetric {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: "up" | "down" | "neutral";
}

export interface EnhancedAnalyticsOverview {
  range: { days: number; from: string; to: string };
  totals: {
    pageViews: AnalyticsMetric;
    uniqueVisitors: AnalyticsMetric;
    sessions: AnalyticsMetric;
    onlineNow: number;
    avgSessionDurationMs: number;
    avgEngagementMs: number;
    bounceRate: number;
    engagementRate: number;
  };
  timeline: Array<{
    bucket: string;
    pageViews: number;
    sessions: number;
    uniqueVisitors: number;
  }>;
  topPages: Array<{ path: string; views: number; avgDuration: number }>;
  sources: Array<{ source: string; views: number; sessions: number }>;
  browsers: Array<{ name: string; version?: string; count: number }>;
  oses: Array<{ name: string; version?: string; count: number }>;
  devices: Array<{ type: string; count: number }>;
  countries: Array<{
    country: string;
    code: string;
    lat?: number;
    lng?: number;
    count: number;
  }>;
  newVsReturning: { newVisitors: number; returningVisitors: number };
  recent: Array<{
    path: string;
    city: string;
    country: string;
    browser: string;
    device: string;
    duration?: number;
    at: string;
  }>;
}

export interface ProjectAnalyticsDetail {
  slug: string;
  title: string;
  thumbnailUrl: string;
  category: string;
  views: number;
  uniqueVisitors: number;
  clicks: number;
  clickThroughRate: number;
  totalEngagementMs: number;
  avgEngagementSec: number;
  bounceRate: number;
  timeline: Array<{
    date: string;
    views: number;
    clicks: number;
    avgDuration: number;
  }>;
}

/**
 * Component Management Types
 */

export interface ComponentVisibility extends DocMeta {
  componentKey: string;
  label: string;
  description: string;
  isVisible: boolean;
  order: number;
  icon?: string;
  hasManagementPage: boolean;
}

/**
 * Global Settings Extensions
 */

export interface GlobalSiteSettings extends SiteSettings {
  maintenance?: {
    enabled: boolean;
    message?: string;
    allowedIPs?: string[];
  };
  seo?: {
    robots?: string;
    sitemap?: boolean;
    googleAnalyticsId?: string;
    googleTagManagerId?: string;
  };
  features?: {
    blog?: boolean;
    testimonials?: boolean;
    newsletter?: boolean;
    darkMode?: boolean;
  };
}
