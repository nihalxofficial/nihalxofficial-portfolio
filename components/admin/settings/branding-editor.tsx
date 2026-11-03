"use client";

import { useCallback, useEffect, useState } from "react";
import type { SiteBranding } from "@/lib/types";
import { Icon } from "@/components/ui/icon";
import {
  FlashBanner,
  ImageField,
  ModuleHeader,
  SaveButton,
  loadSettings,
  saveSettingsField,
  toMessage,
  uploadImageFile,
  useFlash,
} from "@/components/admin/settings/settings-utils";

/**
 * Assets & Branding module.
 *
 * Uploads the four theme-specific logos plus the favicon and edits the initials
 * mark / wordmark used when no logo exists. Everything lives on
 * `settings.branding`; empty slots fall back to the generated gradient mark, so
 * a fresh install still looks complete.
 */

type BrandingKey =
  | "navLogoLight"
  | "navLogoDark"
  | "footerLogoLight"
  | "footerLogoDark"
  | "faviconUrl";

const LOGO_SLOTS: Array<{ field: BrandingKey; label: string; hint: string; compact?: boolean }> = [
  { field: "navLogoLight", label: "Navbar · light mode", hint: "Used on the light theme header" },
  { field: "navLogoDark", label: "Navbar · dark mode", hint: "Used on the dark theme header (main look)" },
  { field: "footerLogoLight", label: "Footer · light mode", hint: "Used on the light theme footer" },
  { field: "footerLogoDark", label: "Footer · dark mode", hint: "Used on the dark theme footer" },
  { field: "faviconUrl", label: "Favicon", hint: "Browser tab icon — square png, 512px", compact: true },
];

const EMPTY: Record<BrandingKey, string> = {
  navLogoLight: "",
  navLogoDark: "",
  footerLogoLight: "",
  footerLogoDark: "",
  faviconUrl: "",
};

export function BrandingEditor() {
  const [branding, setBranding] = useState<Record<BrandingKey, string>>(EMPTY);
  const [logoAlt, setLogoAlt] = useState("");
  const [mark, setMark] = useState("");
  const [wordmark, setWordmark] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<BrandingKey | null>(null);
  const [flash, setFlash] = useFlash();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const settings = await loadSettings();
      const stored = (settings.branding ?? {}) as SiteBranding & Record<string, unknown>;
      setBranding({
        navLogoLight: stored.navLogoLight ?? "",
        navLogoDark: stored.navLogoDark ?? "",
        footerLogoLight: stored.footerLogoLight ?? "",
        footerLogoDark: stored.footerLogoDark ?? "",
        faviconUrl: stored.faviconUrl ?? "",
      });
      setLogoAlt(stored.logoAlt ?? "");
      setMark(stored.mark ?? "");
      setWordmark(stored.wordmark ?? "");
    } catch (cause) {
      setFlash({ tone: "error", text: toMessage(cause, "Could not load the brand assets.") });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const patch = (field: BrandingKey, value: string) =>
    setBranding((current) => ({ ...current, [field]: value }));

  async function upload(field: BrandingKey, file: File) {
    setUploading(field);
    setFlash(null);
    try {
      const url = await uploadImageFile(file, "branding", field);
      patch(field, url);
      setFlash({ tone: "success", text: "Uploaded. Press “Save branding” to publish it." });
    } catch (cause) {
      setFlash({ tone: "error", text: toMessage(cause, "Upload failed. Check the ImgBB key.") });
    } finally {
      setUploading(null);
    }
  }

  async function save() {
    setSaving(true);
    setFlash(null);
    try {
      await saveSettingsField("branding", {
        ...branding,
        logoAlt: logoAlt.trim(),
        mark: mark.trim().slice(0, 3),
        wordmark: wordmark.trim(),
      });
      setFlash({ tone: "success", text: "Branding saved. The public site updates within a minute." });
    } catch (cause) {
      setFlash({ tone: "error", text: toMessage(cause, "Could not save the branding.") });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <ModuleHeader
        eyebrow="Customization"
        title="Assets & Branding"
        description="Logos for both themes, the favicon, and the fallback mark."
        onSave={<SaveButton label="Save branding" busy={saving} disabled={loading} onClick={() => void save()} />}
      />

      <FlashBanner flash={flash} />

      {loading ? (
        <div className="grid min-h-[30vh] place-items-center">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-line-strong border-t-accent" />
        </div>
      ) : (
        <>
          <section className="panel p-4 sm:p-5">
            <h2 className="text-[13.5px] font-semibold text-ink">Brand logos &amp; favicon</h2>
            <p className="mono mt-0.5 text-[10px] uppercase tracking-[0.14em] text-faint">
              one image per slot · png, webp, jpeg or svg
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {LOGO_SLOTS.map((slot) => (
                <ImageField
                  key={slot.field}
                  label={slot.label}
                  hint={slot.hint}
                  compact={slot.compact}
                  value={branding[slot.field]}
                  uploading={uploading === slot.field}
                  onChange={(value) => patch(slot.field, value)}
                  onUpload={(file) => void upload(slot.field, file)}
                />
              ))}
            </div>
          </section>

          <section className="panel p-4 sm:p-5">
            <h2 className="text-[13.5px] font-semibold text-ink">Mark &amp; wordmark</h2>
            <p className="mt-0.5 text-[11.5px] text-muted">
              Used only when no logo image is uploaded, and for the generated favicon.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <label className="flex flex-col gap-1.5">
                <span className="mono text-[10px] uppercase tracking-[0.16em] text-faint">Alt text</span>
                <input
                  value={logoAlt}
                  onChange={(event) => setLogoAlt(event.target.value)}
                  placeholder="Md. Nihal Uddin Bijoy"
                  className="h-9 rounded-lg border border-line bg-surface-2/50 px-3 text-[12px] text-ink outline-none transition-colors placeholder:text-faint focus:border-accent"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="mono text-[10px] uppercase tracking-[0.16em] text-faint">Logo mark</span>
                <input
                  value={mark}
                  onChange={(event) => setMark(event.target.value)}
                  placeholder="NB"
                  maxLength={3}
                  className="h-9 rounded-lg border border-line bg-surface-2/50 px-3 text-[12px] text-ink outline-none transition-colors placeholder:text-faint focus:border-accent"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="mono text-[10px] uppercase tracking-[0.16em] text-faint">Wordmark</span>
                <input
                  value={wordmark}
                  onChange={(event) => setWordmark(event.target.value)}
                  placeholder="nihal.dev"
                  maxLength={40}
                  className="h-9 rounded-lg border border-line bg-surface-2/50 px-3 text-[12px] text-ink outline-none transition-colors placeholder:text-faint focus:border-accent"
                />
              </label>
            </div>

            <p className="mono mt-4 flex items-start gap-2 rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[10.5px] leading-relaxed text-faint">
              <Icon name="AlertTriangle" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Leave a slot empty to fall back to the gradient initials mark. The visible text block in
              the navbar and footer hides automatically once a logo exists.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
