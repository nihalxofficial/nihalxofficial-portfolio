"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { Icon } from "@/components/ui/icon";
import {
  AdminApiError,
  listContent,
  readContent,
  updateContent,
  uploadMedia,
  type EntityRecord,
} from "@/lib/admin";
import { adminHref } from "@/lib/admin-routes";
import {
  DEFAULT_TYPOGRAPHY,
  findFont,
  fontOptions,
  resolveTypography,
  type FontRole,
} from "@/lib/fonts";
import { mapEmbedUrl } from "@/lib/map";
import type { SiteSettings } from "@/lib/types";

/**
 * Appearance settings.
 *
 * Jobs the generic form cannot do well: uploading four theme-specific logos
 * plus a favicon, picking the Google Fonts the site loads, pointing the contact
 * map, and flipping each public section on or off with one click. Everything is
 * stored on the `settings` / `sections` documents, so the public site picks it up
 * on its next revalidation.
 */

type BrandingKey =
  | "navLogoLight"
  | "navLogoDark"
  | "footerLogoLight"
  | "footerLogoDark"
  | "faviconUrl";

type ContactMap = SiteSettings["contact"];

const LOGO_SLOTS: Array<{ field: BrandingKey; label: string; hint: string }> = [
  {
    field: "navLogoLight",
    label: "Navbar · light mode",
    hint: "Used on the light theme header",
  },
  {
    field: "navLogoDark",
    label: "Navbar · dark mode",
    hint: "Used on the dark theme header (main look)",
  },
  {
    field: "footerLogoLight",
    label: "Footer · light mode",
    hint: "Used on the light theme footer",
  },
  {
    field: "footerLogoDark",
    label: "Footer · dark mode",
    hint: "Used on the dark theme footer",
  },
];

const EMPTY_BRANDING: Record<BrandingKey, string> = {
  navLogoLight: "",
  navLogoDark: "",
  footerLogoLight: "",
  footerLogoDark: "",
  faviconUrl: "",
};

/** The three roles the public site resolves a typeface for. */
const FONT_ROLES: Array<{ role: FontRole; label: string; hint: string }> = [
  { role: "sans", label: "Body", hint: "Paragraphs, cards and form text" },
  { role: "display", label: "Headings", hint: "Section titles and the hero name" },
  { role: "mono", label: "Monospace", hint: "Terminal, code window and labels" },
];

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

type SavingSection = "branding" | "typography" | "map" | null;

type Flash = { tone: "success" | "error"; text: string } | null;

function toMessage(cause: unknown, fallback: string) {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}

export default function SiteSettingsPage() {
  const [branding, setBranding] = useState<Record<BrandingKey, string>>(EMPTY_BRANDING);
  const [logoAlt, setLogoAlt] = useState("");
  const [wordmark, setWordmark] = useState("");
  const [typography, setTypography] = useState<Record<FontRole, string>>({
    ...DEFAULT_TYPOGRAPHY,
  });
  const [contact, setContact] = useState<ContactMap>(EMPTY_MAP);
  const [sections, setSections] = useState<EntityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<SavingSection>(null);
  const [uploading, setUploading] = useState<BrandingKey | null>(null);
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

      const stored = (settings.branding ?? {}) as Partial<
        Record<BrandingKey | "logoAlt" | "wordmark", string>
      >;

      setBranding({
        navLogoLight: stored.navLogoLight ?? "",
        navLogoDark: stored.navLogoDark ?? "",
        footerLogoLight: stored.footerLogoLight ?? "",
        footerLogoDark: stored.footerLogoDark ?? "",
        faviconUrl: stored.faviconUrl ?? "",
      });
      setLogoAlt(stored.logoAlt ?? "");
      setWordmark(stored.wordmark ?? "");

      const type = (settings.typography ?? {}) as Partial<Record<FontRole, string>>;
      setTypography({
        sans: type.sans || DEFAULT_TYPOGRAPHY.sans,
        display: type.display || DEFAULT_TYPOGRAPHY.display,
        mono: type.mono || DEFAULT_TYPOGRAPHY.mono,
      });

      // The whole contact object is sent back on save, so keep the parts this
      // page does not edit (email, phone, availability) exactly as stored.
      setContact({ ...EMPTY_MAP, ...((settings.contact ?? {}) as ContactMap) });

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

  const patch = (field: BrandingKey, value: string) =>
    setBranding((current) => ({ ...current, [field]: value }));

  const patchContact = (field: keyof ContactMap, value: string | number) =>
    setContact((current) => ({ ...current, [field]: value }));

  async function saveBranding() {
    setSaving("branding");
    setFlash(null);

    try {
      await updateContent("settings", "current", {
        branding: { ...branding, logoAlt: logoAlt.trim(), wordmark: wordmark.trim() },
      });
      setFlash({ tone: "success", text: "Branding saved. The public site updates within a minute." });
    } catch (cause) {
      setFlash({ tone: "error", text: toMessage(cause, "Could not save the branding.") });
    } finally {
      setSaving(null);
    }
  }

  async function saveTypography() {
    setSaving("typography");
    setFlash(null);

    try {
      await updateContent("settings", "current", { typography });
      setFlash({ tone: "success", text: "Fonts saved — the public site loads exactly these three." });
    } catch (cause) {
      setFlash({ tone: "error", text: toMessage(cause, "Could not save the typography.") });
    } finally {
      setSaving(null);
    }
  }

  async function saveMap() {
    setSaving("map");
    setFlash(null);

    try {
      await updateContent("settings", "current", { contact });
      setFlash({ tone: "success", text: "Map saved. The contact section re-renders the pin." });
    } catch (cause) {
      setFlash({ tone: "error", text: toMessage(cause, "Could not save the map settings.") });
    } finally {
      setSaving(null);
    }
  }

  async function upload(field: BrandingKey, file: File) {
    setUploading(field);
    setFlash(null);

    try {
      const dataUrl = await readFile(file);
      const asset = await uploadMedia({
        image: dataUrl,
        name: `${field}-${file.name}`.slice(0, 120),
        mimeType: file.type,
        folder: "branding",
      });

      patch(field, asset.url);
      setFlash({ tone: "success", text: "Uploaded. Press “Save branding” to publish it." });
    } catch (cause) {
      setFlash({ tone: "error", text: toMessage(cause, "Upload failed. Check the ImgBB key.") });
    } finally {
      setUploading(null);
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
          <h1 className="mt-1.5 text-2xl font-semibold text-ink">Appearance &amp; components</h1>
          <p className="mt-1 text-[12.5px] text-muted">
            Brand logos for both themes, the favicon, and which sections the homepage renders.
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

      {/* ── Branding ─────────────────────────────────────────────────────── */}
      <section className="panel p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[13.5px] font-semibold text-ink">Brand logos</h2>
            <p className="mono mt-0.5 text-[10px] uppercase tracking-[0.14em] text-faint">
              one image per theme · png, webp or jpeg
            </p>
          </div>

          <button
            type="button"
            onClick={() => void saveBranding()}
            disabled={saving !== null}
            className="inline-flex items-center gap-2 rounded-lg grad-accent px-3.5 py-2 text-[12px] font-semibold text-accent-ink disabled:opacity-60"
          >
            <Icon
              name={saving === "branding" ? "Loader" : "Save"}
              className={`h-3.5 w-3.5 ${saving === "branding" ? "animate-spin" : ""}`}
            />
            {saving === "branding" ? "Saving…" : "Save branding"}
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {LOGO_SLOTS.map((slot) => (
            <LogoRow
              key={slot.field}
              field={slot.field}
              label={slot.label}
              hint={slot.hint}
              value={branding[slot.field]}
              uploading={uploading === slot.field}
              onChange={(value) => patch(slot.field, value)}
              onUpload={(file) => void upload(slot.field, file)}
            />
          ))}
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <LogoRow
            field="faviconUrl"
            label="Favicon"
            hint="Browser tab icon — square png, 512px"
            value={branding.faviconUrl}
            uploading={uploading === "faviconUrl"}
            onChange={(value) => patch("faviconUrl", value)}
            onUpload={(file) => void upload("faviconUrl", file)}
            compact
          />

          <label className="flex flex-col gap-1.5">
            <span className="mono text-[10px] uppercase tracking-[0.16em] text-faint">
              Alt text
            </span>
            <input
              value={logoAlt}
              onChange={(event) => setLogoAlt(event.target.value)}
              placeholder="Md. Nihal Uddin Bijoy"
              className="h-9 rounded-lg border border-line bg-surface-2/50 px-3 text-[12px] text-ink outline-none transition-colors placeholder:text-faint focus:border-accent"
            />
            <span className="text-[10.5px] text-faint">
              Used for screen readers and search engines when the logo replaces the name.
            </span>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="mono text-[10px] uppercase tracking-[0.16em] text-faint">
              Wordmark
            </span>
            <input
              value={wordmark}
              onChange={(event) => setWordmark(event.target.value)}
              placeholder="nihal.dev"
              maxLength={40}
              className="h-9 rounded-lg border border-line bg-surface-2/50 px-3 text-[12px] text-ink outline-none transition-colors placeholder:text-faint focus:border-accent"
            />
            <span className="text-[10.5px] text-faint">
              Text beside the mark in the header. Empty falls back to the site name; the first half
              stays white and the rest carries the gradient.
            </span>
          </label>
        </div>

        <p className="mono mt-4 rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[10.5px] leading-relaxed text-faint">
          Leave a slot empty to fall back to the gradient initials mark. The visible text block in the
          navbar and footer is hidden automatically once a logo exists.
        </p>
      </section>

      {/* ── Typography ───────────────────────────────────────────────────── */}
      <section className="panel p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[13.5px] font-semibold text-ink">Typography</h2>
            <p className="mono mt-0.5 text-[10px] uppercase tracking-[0.14em] text-faint">
              one google fonts request · only the chosen families
            </p>
          </div>

          <button
            type="button"
            onClick={() => void saveTypography()}
            disabled={saving !== null}
            className="inline-flex items-center gap-2 rounded-lg grad-accent px-3.5 py-2 text-[12px] font-semibold text-accent-ink disabled:opacity-60"
          >
            <Icon
              name={saving === "typography" ? "Loader" : "Save"}
              className={`h-3.5 w-3.5 ${saving === "typography" ? "animate-spin" : ""}`}
            />
            {saving === "typography" ? "Saving…" : "Save fonts"}
          </button>
        </div>

        {/* The admin layout only ships the saved families, so the preview needs
            its own stylesheet for whatever is picked but not yet stored. */}
        <link rel="stylesheet" href={resolveTypography(typography).href} />

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FONT_ROLES.map((role) => {
            const selected = findFont(role.role, typography[role.role]);

            return (
              <label
                key={role.role}
                className="flex flex-col gap-2 rounded-xl border border-line bg-surface-2/40 p-3"
              >
                <span className="mono text-[10px] uppercase tracking-[0.16em] text-faint">
                  {role.label}
                </span>

                <select
                  value={selected.key}
                  onChange={(event) =>
                    setTypography((current) => ({ ...current, [role.role]: event.target.value }))
                  }
                  className="h-9 rounded-lg border border-line bg-page px-2 text-[12px] text-ink outline-none transition-colors focus:border-accent"
                >
                  {fontOptions(role.role).map((font) => (
                    <option key={font.key} value={font.key}>
                      {font.label}
                    </option>
                  ))}
                </select>

                <span
                  className="truncate text-[19px] text-ink"
                  style={{ fontFamily: selected.stack }}
                >
                  Aa Bb 123
                </span>
                <span className="text-[10.5px] text-faint">
                  {role.hint} · {selected.note}
                </span>
              </label>
            );
          })}
        </div>
      </section>

      {/* ── Contact map ──────────────────────────────────────────────────── */}
      <section className="panel p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[13.5px] font-semibold text-ink">Contact map</h2>
            <p className="mono mt-0.5 text-[10px] uppercase tracking-[0.14em] text-faint">
              key-free google maps embed · no sdk needed
            </p>
          </div>

          <button
            type="button"
            onClick={() => void saveMap()}
            disabled={saving !== null}
            className="inline-flex items-center gap-2 rounded-lg grad-accent px-3.5 py-2 text-[12px] font-semibold text-accent-ink disabled:opacity-60"
          >
            <Icon
              name={saving === "map" ? "Loader" : "Save"}
              className={`h-3.5 w-3.5 ${saving === "map" ? "animate-spin" : ""}`}
            />
            {saving === "map" ? "Saving…" : "Save map"}
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MapField
            label="Location"
            value={contact.location ?? ""}
            onChange={(value) => patchContact("location", value)}
            placeholder="Mirsarai, Chattogram"
            hint="Shown in the contact list and used to centre the map when no pin is set."
          />
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
          <h2 className="text-[13px] font-semibold text-ink">SEO, contact &amp; social links</h2>
          <p className="mt-0.5 text-[11.5px] text-muted">
            Site name, meta description, email, phone and social profiles live in the full settings
            form.
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

function LogoRow({
  field,
  label,
  hint,
  value,
  uploading,
  compact = false,
  onChange,
  onUpload,
}: {
  field: BrandingKey;
  label: string;
  hint: string;
  value: string;
  uploading: boolean;
  compact?: boolean;
  onChange: (value: string) => void;
  onUpload: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) onUpload(file);
    event.target.value = "";
  }

  return (
    <div className="rounded-xl border border-line bg-surface-2/40 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="mono text-[10px] uppercase tracking-[0.16em] text-faint">{label}</span>
        <span className="mono text-[9px] uppercase tracking-[0.14em] text-faint/70">{field}</span>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <span
          className={`grid shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-page ${
            compact ? "h-9 w-9" : "h-9 w-24"
          }`}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="max-h-full max-w-full object-contain" />
          ) : (
            <Icon name="Image" className="h-3.5 w-3.5 text-faint" />
          )}
        </span>

        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://…"
          className="h-9 min-w-0 flex-1 rounded-lg border border-line bg-page px-2.5 text-[11.5px] text-ink outline-none transition-colors placeholder:text-faint focus:border-accent"
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 text-[11px] font-medium text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-60"
        >
          <Icon name={uploading ? "Loader" : "Upload"} className={`h-3.5 w-3.5 ${uploading ? "animate-spin" : ""}`} />
          {uploading ? "…" : "Upload"}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/webp,image/jpeg,image/gif,image/avif"
          onChange={handleFile}
          className="hidden"
        />
      </div>

      <p className="mt-1.5 text-[10.5px] text-faint">{hint}</p>
    </div>
  );
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
  type?: "text" | "number";
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

/** File → data URI exactly as the media endpoint expects it. */
function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}
