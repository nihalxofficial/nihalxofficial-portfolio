"use client";

import Link from "next/link";
import { useMemo } from "react";
import { EntityManager } from "@/components/admin/entity-manager";
import { useAdminData } from "@/components/admin/admin-context";
import { SectionHeader } from "@/components/admin/ui";
import { Icon } from "@/components/ui/icon";
import { adminHref } from "@/lib/admin-routes";

/**
 * Global Settings hub.
 *
 * The single front door for everything that shapes the whole site rather than
 * one component: brand assets and fonts, the appearance modules, the navigation
 * and the raw settings document (site name, SEO meta, keywords, social links,
 * resume). Each card jumps to a focused page; the generic form at the bottom
 * still exposes every `settings` field for power edits.
 */

interface Card {
  href: string;
  label: string;
  description: string;
  icon: string;
}

const CARDS: Card[] = [
  {
    href: adminHref("settings/branding"),
    label: "Assets & Branding",
    description: "Logos for both themes, favicon, mark and wordmark.",
    icon: "ImagePlus",
  },
  {
    href: adminHref("settings/theme"),
    label: "Theme & Colors",
    description: "Accent presets and a custom palette, saved to the site.",
    icon: "Palette",
  },
  {
    href: adminHref("settings/background"),
    label: "Background Settings",
    description: "DNA mesh, matrix rain or a minimal grid.",
    icon: "Sparkles",
  },
  {
    href: adminHref("settings/typography"),
    label: "Typography",
    description: "Body, heading and monospace fonts.",
    icon: "Type",
  },
  {
    href: adminHref("site-settings"),
    label: "Contact & Components",
    description: "Contact details, map pin and homepage section visibility.",
    icon: "Mail",
  },
  {
    href: adminHref("navigation"),
    label: "Navigation Manager",
    description: "Reorder, publish and edit the site menu.",
    icon: "Compass",
  },
  {
    href: adminHref("sections"),
    label: "Section Copy",
    description: "Headings and ordering for every homepage block.",
    icon: "ListChecks",
  },
];

export default function GlobalSettingsHubPage() {
  const { types, loading } = useAdminData();
  const settingsType = useMemo(() => types.find((item) => item.key === "settings"), [types]);

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Customization"
        title="Global Settings"
        description="Site-wide appearance, branding and configuration."
        icon="Settings"
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="panel group flex items-start gap-3 p-4 transition-colors hover:border-accent/40"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-line bg-accent/10 text-accent transition-transform group-hover:scale-105">
              <Icon name={card.icon} className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-semibold text-ink">{card.label}</span>
              <span className="mt-0.5 block text-[11.5px] leading-snug text-muted">{card.description}</span>
            </span>
            <Icon name="ArrowUpRight" className="ml-auto h-4 w-4 shrink-0 text-faint transition-colors group-hover:text-accent" />
          </Link>
        ))}
      </div>

      <section className="panel p-4 sm:p-5">
        <div className="mb-4">
          <h2 className="text-[13.5px] font-semibold text-ink">Full settings document</h2>
          <p className="mt-0.5 text-[11.5px] text-muted">
            Every raw field on the `settings` document — site name, URL, SEO meta, keywords, social
            links and the resume file — for power edits.
          </p>
        </div>

        {loading && !settingsType ? (
          <div className="flex items-center gap-2 text-[12px] text-faint">
            <Icon name="Loader" className="h-4 w-4 animate-spin" />
            Loading settings…
          </div>
        ) : settingsType ? (
          <EntityManager type={settingsType} />
        ) : (
          <p className="text-[12px] text-faint">The settings type is unavailable from the API.</p>
        )}
      </section>
    </div>
  );
}
