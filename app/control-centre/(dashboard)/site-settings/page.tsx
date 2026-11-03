"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import {
  AdminApiError,
  listContent,
  readContent,
  updateContent,
  type EntityRecord,
} from "@/lib/admin";
import { adminHref } from "@/lib/admin-routes";
import { mapEmbedUrl } from "@/lib/map";
import type { SiteSettings, SocialLink } from "@/lib/types";

/**
 * Contact & homepage components.
 *
 * The settings slice the generic form cannot do well: the contact details + map
 * pin, the social profile list shared by the hero / contact / footer, and
 * one-click visibility for every homepage section. Brand assets, fonts, colours
 * and backgrounds now live in their own Customization modules (linked below),
 * all still stored on the same `settings` / `sections` documents.
 */

type ContactMap = SiteSettings["contact"];

const EMPTY_MAP: ContactMap = {
  email: "",
  phone: "",
  location: "",
  availability: "",
  mapLat: "",
  mapLng: "",
  mapZoom: 13,
  mapEmbedUrl: "",
};

/**
 * Platform presets for the social links editor. Picking one stores its display
 * name and the icon key the public site resolves (hero, contact and footer all
 * render the same `socialLinks` array). "Custom" keeps a free-text name.
 */
const SOCIAL_PLATFORMS: Array<{ name: string; icon: string }> = [
  { name: "GitHub", icon: "Github" },
  { name: "LinkedIn", icon: "Linkedin" },
  { name: "Facebook", icon: "SiFacebook" },
  { name: "Twitter / X", icon: "SiX" },
  { name: "WhatsApp", icon: "SiWhatsapp" },
  { name: "Discord", icon: "SiDiscord" },
  { name: "LeetCode", icon: "SiLeetcode" },
  { name: "Stack Overflow", icon: "SiStackoverflow" },
  { name: "Instagram", icon: "SiInstagram" },
  { name: "YouTube", icon: "SiYoutube" },
  { name: "Telegram", icon: "SiTelegram" },
  { name: "Docker Hub", icon: "Container" },
];

function iconFor(platform: string): string {
  return SOCIAL_PLATFORMS.find((entry) => entry.name === platform)?.icon || "Globe";
}

/** The Customization modules that own the rest of the `settings` document. */
const MODULE_LINKS: Array<{ href: string; label: string; icon: string }> = [
  { href: adminHref("settings/branding"), label: "Assets & Branding", icon: "ImagePlus" },
  { href: adminHref("settings/theme"), label: "Theme & Colors", icon: "Palette" },
  { href: adminHref("settings/background"), label: "Background", icon: "Sparkles" },
  { href: adminHref("settings/typography"), label: "Typography", icon: "Type" },
];

type Flash = { tone: "success" | "error"; text: string } | null;

function toMessage(cause: unknown, fallback: string) {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}

export default function SiteSettingsPage() {
  const [contact, setContact] = useState<ContactMap>(EMPTY_MAP);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [sections, setSections] = useState<EntityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [flash, setFlash] = useState<Flash>(null);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const [settings, list] = await Promise.all([
        // A site that has never been saved is a normal first run, not an error.
        readContent("settings", "current").catch((cause: unknown) => {
          if (cause instanceof AdminApiError && cause.status === 404) return {} as EntityRecord;
          throw cause;
        }),
        listContent("sections", { limit: 100 }),
      ]);

      // The whole contact object is sent back on save, so map-only fields
      // (coordinates, zoom, embed) survive edits made on this page.
      setContact({ ...EMPTY_MAP, ...((settings.contact ?? {}) as ContactMap) });

      setSocialLinks(
        Array.isArray(settings.socialLinks) ? (settings.socialLinks as SocialLink[]) : [],
      );

      setSections(list.items);
      setFlash(null);
    } catch (cause) {
      setFlash({ tone: "error", text: toMessage(cause, "Could not load the site settings.") });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const patchContact = (field: keyof ContactMap, value: string | number) =>
    setContact((current) => ({ ...current, [field]: value }));

  const patchSocial = (index: number, next: Partial<SocialLink>) =>
    setSocialLinks((rows) =>
      rows.map((row, position) => (position === index ? { ...row, ...next } : row)),
    );

  async function saveContact() {
    setSaving(true);
    setFlash(null);

    try {
      // Rows with no URL are drafts: they are dropped so the public site never
      // renders an empty icon.
      const links = socialLinks
        .filter((link) => link.platform.trim() && link.url.trim())
        .map((link) => ({
          platform: link.platform.trim(),
          url: link.url.trim(),
          icon: link.icon || iconFor(link.platform.trim()),
        }));

      await updateContent("settings", "current", { contact, socialLinks: links });
      setSocialLinks(links);
      setFlash({
        tone: "success",
        text: "Contact details saved. Hero, contact and footer pick up the links on the next revalidation.",
      });
    } catch (cause) {
      setFlash({ tone: "error", text: toMessage(cause, "Could not save the contact settings.") });
    } finally {
      setSaving(false);
    }
  }

  async function toggleSection(section: EntityRecord) {
    const id = section._id;
    const next = section.isVisible === false;

    setToggling(id);
    setFlash(null);
    setSections((items) =>
      items.map((item) => (item._id === id ? { ...item, isVisible: next } : item)),
    );

    try {
      await updateContent("sections", id, { isVisible: next });
      setFlash({
        tone: "success",
        text: `${labelOf(section)} ${next ? "shown on" : "hidden from"} the public site.`,
      });
    } catch (cause) {
      // Roll back so the switch never lies about what is stored.
      setSections((items) =>
        items.map((item) => (item._id === id ? { ...item, isVisible: !next } : item)),
      );
      setFlash({ tone: "error", text: toMessage(cause, "Could not change that section.") });
    } finally {
      setToggling(null);
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-line-strong border-t-accent" />
      </div>
    );
  }

  const visibleCount = sections.filter((section) => section.isVisible !== false).length;
  const previewMap = mapEmbedUrl(contact);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.22em] text-accent">Site settings</p>
          <h1 className="mt-1.5 text-2xl font-semibold text-ink">Contact &amp; homepage components</h1>
          <p className="mt-1 text-[12.5px] text-muted">
            Contact details, the shared social list, and which sections the homepage renders.
          </p>
        </div>

        <Link
          href="/"
          target="_blank"
          rel="noreferrer"
          className="mono inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-faint transition-colors hover:border-line-strong hover:text-accent"
        >
          <Icon name="Globe" className="h-3.5 w-3.5" />
          open site
        </Link>
      </header>

      {flash ? (
        <p
          className={`rounded-xl border px-4 py-2.5 text-[12.5px] ${
            flash.tone === "success"
              ? "border-success/30 bg-success/10 text-success"
              : "border-danger/30 bg-danger/10 text-danger"
          }`}
        >
          {flash.text}
        </p>
      ) : null}

      {/* ── Links to the other Customization modules ─────────────────────── */}
      <section className="panel p-4">
        <p className="mono mb-3 text-[10px] uppercase tracking-[0.16em] text-faint">
          also customise
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {MODULE_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[12px] font-medium text-muted transition-colors hover:border-accent/40 hover:text-accent"
            >
              <Icon name={link.icon} className="h-4 w-4 text-accent" />
              {link.label}
              <Icon name="ArrowUpRight" className="ml-auto h-3.5 w-3.5 text-faint" />
            </Link>
          ))}
        </div>
      </section>

      {/* ── Contact & social ────────────────────────────────────────────── */}
      <section className="panel p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[13.5px] font-semibold text-ink">Contact &amp; social links</h2>
            <p className="mono mt-0.5 text-[10px] uppercase tracking-[0.14em] text-faint">
              email · phone · location · availability · map · social profiles
            </p>
          </div>

          <button
            type="button"
            onClick={() => void saveContact()}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg grad-accent px-3.5 py-2 text-[12px] font-semibold text-accent-ink disabled:opacity-60"
          >
            <Icon
              name={saving ? "Loader" : "Save"}
              className={`h-3.5 w-3.5 ${saving ? "animate-spin" : ""}`}
            />
            {saving ? "Saving…" : "Save contact"}
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <MapField
            label="Email"
            value={contact.email ?? ""}
            onChange={(value) => patchContact("email", value)}
            placeholder="you@example.com"
            type="email"
            hint="Shown in the contact section as a mailto link."
          />
          <MapField
            label="Phone"
            value={contact.phone ?? ""}
            onChange={(value) => patchContact("phone", value)}
            placeholder="+880 1XXX-XXXXXX"
            hint="Optional. Shown as a tel link when set."
          />
          <MapField
            label="Location"
            value={contact.location ?? ""}
            onChange={(value) => patchContact("location", value)}
            placeholder="Mirsarai, Chattogram"
            hint="Shown in the contact list and used to centre the map when no pin is set."
          />
          <MapField
            label="Availability"
            value={contact.availability ?? ""}
            onChange={(value) => patchContact("availability", value)}
            placeholder="Open to offers / Ready to interview"
            hint="Shown in the contact list and the terminal column."
          />
        </div>

        {/* Social links — hero, contact and footer all render this one list. */}
        <div className="mt-5">
          <div className="flex items-center justify-between gap-2">
            <span className="mono text-[10px] uppercase tracking-[0.16em] text-faint">
              Social profiles
            </span>
            <button
              type="button"
              onClick={() => setSocialLinks((rows) => [...rows, { platform: "", url: "", icon: "" }])}
              className="mono inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-[9.5px] uppercase tracking-[0.14em] text-faint transition-colors hover:border-line-strong hover:text-accent"
            >
              <Icon name="Plus" className="h-3 w-3" />
              add link
            </button>
          </div>

          {socialLinks.length === 0 ? (
            <p className="mt-2 rounded-lg border border-dashed border-line px-3 py-2.5 text-[11.5px] text-faint">
              No social profiles yet. Add as many as you like — they appear in the hero, the contact
              section and the footer.
            </p>
          ) : (
            <ul className="mt-2 space-y-2">
              {socialLinks.map((link, index) => (
                <li
                  key={index}
                  className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface-2/40 p-2.5"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-page text-accent">
                    <Icon name={link.icon || iconFor(link.platform)} className="h-4 w-4" />
                  </span>

                  <select
                    value={
                      SOCIAL_PLATFORMS.some((entry) => entry.name === link.platform)
                        ? link.platform
                        : ""
                    }
                    onChange={(event) => {
                      const picked = event.target.value;
                      patchSocial(
                        index,
                        picked ? { platform: picked, icon: iconFor(picked) } : { platform: "", icon: "" },
                      );
                    }}
                    className="h-9 w-36 shrink-0 rounded-lg border border-line bg-page px-2 text-[12px] text-ink outline-none transition-colors focus:border-accent"
                    aria-label={`Platform ${index + 1}`}
                  >
                    <option value="">— pick —</option>
                    {SOCIAL_PLATFORMS.map((entry) => (
                      <option key={entry.name} value={entry.name}>
                        {entry.name}
                      </option>
                    ))}
                  </select>

                  <input
                    value={link.platform}
                    onChange={(event) => patchSocial(index, { platform: event.target.value })}
                    placeholder="Platform name"
                    className="h-9 w-32 shrink-0 rounded-lg border border-line bg-page px-2.5 text-[12px] text-ink outline-none transition-colors placeholder:text-faint focus:border-accent"
                    aria-label={`Platform name ${index + 1}`}
                  />

                  <input
                    value={link.url}
                    onChange={(event) => patchSocial(index, { url: event.target.value })}
                    placeholder="https://…"
                    className="h-9 min-w-40 flex-1 rounded-lg border border-line bg-page px-2.5 text-[11.5px] text-ink outline-none transition-colors placeholder:text-faint focus:border-accent"
                    aria-label={`Profile URL ${index + 1}`}
                  />

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() =>
                        setSocialLinks((rows) => {
                          const copy = [...rows];
                          [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
                          return copy;
                        })
                      }
                      aria-label="Move link up"
                      className="grid h-8 w-7 place-items-center rounded-md border border-line text-faint transition-colors hover:text-accent disabled:opacity-40"
                    >
                      <Icon name="ChevronDown" className="h-3.5 w-3.5 rotate-180" />
                    </button>
                    <button
                      type="button"
                      disabled={index === socialLinks.length - 1}
                      onClick={() =>
                        setSocialLinks((rows) => {
                          const copy = [...rows];
                          [copy[index], copy[index + 1]] = [copy[index + 1], copy[index]];
                          return copy;
                        })
                      }
                      aria-label="Move link down"
                      className="grid h-8 w-7 place-items-center rounded-md border border-line text-faint transition-colors hover:text-accent disabled:opacity-40"
                    >
                      <Icon name="ChevronDown" className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSocialLinks((rows) => rows.filter((_, position) => position !== index))
                      }
                      aria-label="Remove link"
                      className="grid h-8 w-7 place-items-center rounded-md border border-line text-faint transition-colors hover:border-danger/40 hover:text-danger"
                    >
                      <Icon name="Trash" className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <p className="mono mt-2 rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[10.5px] leading-relaxed text-faint">
            Rows keep their order. The same list feeds the hero, contact and footer — one place to
            manage every profile.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MapField
            label="Latitude"
            value={String(contact.mapLat ?? "")}
            onChange={(value) => patchContact("mapLat", value)}
            placeholder="22.3833"
          />
          <MapField
            label="Longitude"
            value={String(contact.mapLng ?? "")}
            onChange={(value) => patchContact("mapLng", value)}
            placeholder="91.8315"
          />
          <MapField
            label="Zoom · 1-20"
            value={String(contact.mapZoom ?? 13)}
            onChange={(value) => patchContact("mapZoom", Number(value) || 13)}
            placeholder="13"
            type="number"
          />
        </div>

        <div className="mt-3">
          <MapField
            label="Custom embed url"
            value={contact.mapEmbedUrl ?? ""}
            onChange={(value) => patchContact("mapEmbedUrl", value)}
            placeholder="https://www.google.com/maps/embed?pb=…"
            hint="Optional. Leave empty to generate the embed from the place or pin above."
          />
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-line">
          {previewMap ? (
            <iframe
              src={previewMap}
              title="Map preview"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block h-56 w-full border-0 grayscale-[35%] dark:invert dark:hue-rotate-180 dark:grayscale-[65%]"
            />
          ) : (
            <div className="grid h-32 place-items-center bg-surface-2/40 px-4 text-center">
              <p className="mono text-[10.5px] uppercase tracking-[0.16em] text-faint">
                set a location or a pin to see the map here
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Component visibility ─────────────────────────────────────────── */}
      <section className="panel p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[13.5px] font-semibold text-ink">Homepage components</h2>
            <p className="mono mt-0.5 text-[10px] uppercase tracking-[0.14em] text-faint">
              {visibleCount} of {sections.length} visible
            </p>
          </div>

          <Link
            href={adminHref("sections")}
            className="mono inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-faint transition-colors hover:border-line-strong hover:text-accent"
          >
            <Icon name="Pencil" className="h-3 w-3" />
            headings &amp; copy
          </Link>
        </div>

        <ul className="mt-4 divide-y divide-line">
          {sections.map((section) => {
            const visible = section.isVisible !== false;
            const busy = toggling === section._id;

            return (
              <li key={section._id} className="flex items-center gap-3 py-2.5">
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border ${
                    visible
                      ? "border-accent/35 bg-accent/10 text-accent"
                      : "border-line bg-surface-2/60 text-faint"
                  }`}
                >
                  <Icon name={visible ? "Eye" : "EyeOff"} className="h-3.5 w-3.5" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-medium text-ink">
                    {labelOf(section)}
                  </span>
                  <span className="mono block truncate text-[10px] text-faint">
                    {String(section.key ?? "")}
                    {section.heading ? ` · ${String(section.heading)}` : ""}
                  </span>
                </span>

                <button
                  type="button"
                  role="switch"
                  aria-checked={visible}
                  aria-label={`${visible ? "Hide" : "Show"} ${labelOf(section)}`}
                  disabled={busy}
                  onClick={() => void toggleSection(section)}
                  className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors disabled:opacity-60 ${
                    visible ? "border-accent/50 bg-accent/25" : "border-line bg-surface-2"
                  }`}
                >
                  <span
                    className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full transition-all ${
                      visible ? "left-6 bg-accent" : "left-1 bg-faint"
                    }`}
                  />
                </button>
              </li>
            );
          })}
        </ul>

        <p className="mono mt-3 rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[10.5px] leading-relaxed text-faint">
          Hidden components disappear from the homepage immediately after revalidation; their content
          is kept, so turning them back on restores them.
        </p>
      </section>

      {/* ── Elsewhere ────────────────────────────────────────────────────── */}
      <section className="panel flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <h2 className="text-[13px] font-semibold text-ink">SEO &amp; meta</h2>
          <p className="mt-0.5 text-[11.5px] text-muted">
            Site name, meta description and keywords live in the full settings form.
          </p>
        </div>
        <Link
          href={adminHref("settings")}
          className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-[12px] font-medium text-muted transition-colors hover:border-line-strong hover:text-accent"
        >
          Open full settings
          <Icon name="ArrowUpRight" className="h-3.5 w-3.5" />
        </Link>
      </section>
    </div>
  );
}

function labelOf(section: EntityRecord) {
  const label = typeof section.label === "string" ? section.label.trim() : "";
  const key = typeof section.key === "string" ? section.key : "section";
  return label || key.charAt(0).toUpperCase() + key.slice(1);
}

/** One labelled text box in the map grid. */
function MapField({
  label,
  value,
  placeholder,
  hint,
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  hint?: string;
  type?: "text" | "number" | "email";
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="mono text-[10px] uppercase tracking-[0.16em] text-faint">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        min={type === "number" ? 1 : undefined}
        max={type === "number" ? 20 : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 rounded-lg border border-line bg-surface-2/50 px-3 text-[12px] text-ink outline-none transition-colors placeholder:text-faint focus:border-accent"
      />
      {hint ? <span className="text-[10.5px] text-faint">{hint}</span> : null}
    </label>
  );
}
