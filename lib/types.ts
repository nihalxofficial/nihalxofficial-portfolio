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

export interface SiteSettings extends DocMeta {
  siteName: string;
  siteUrl: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  ogImageUrl: string;
  branding?: SiteBranding;
  typography?: SiteTypography;
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
