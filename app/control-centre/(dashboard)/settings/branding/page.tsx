"use client";

import { useEffect, useState } from "react";
import { DashboardCard, LoadingState, ErrorState, EmptyState } from "@/components/admin/dashboard-card";
import { Icon } from "@/components/ui/icon";
import { readContent, updateContent } from "@/lib/admin";

interface BrandingAssets {
  _id: string;
  branding: {
    logo: {
      primary: string; // Main logo (full)
      dark: string; // Dark mode variant
      light: string; // Light mode variant
      icon: string; // Icon/favicon only
    };
    favicon: string;
    ogImage: string; // Social sharing preview
    brandName: string;
    tagline: string;
  };
}

export default function BrandingPage() {
  const [settings, setSettings] = useState<BrandingAssets | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("image", file);
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    if (!apiKey) throw new Error("ImgBB API key not configured");
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Image upload failed");
    const json = await res.json();
    return json.data.url as string;
  }

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      setError(null);
      const data = await readContent("settings", "default");
      
      // Initialize branding settings if they don't exist
      if (!data.branding) {
        data.branding = {
          logo: {
            primary: "",
            dark: "",
            light: "",
            icon: "",
          },
          favicon: "",
          ogImage: "",
          brandName: "",
          tagline: "",
        };
      }
      
      setSettings(data as unknown as BrandingAssets);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!settings) return;

    try {
      setSaving(true);
      setSuccess(false);
      await updateContent("settings", settings._id, settings as unknown as Record<string, unknown>);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(field: string, event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5MB");
      return;
    }

    try {
      setUploading(field);
      const url = await uploadImage(file);
      updateBrandingField(field, url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploading(null);
    }
  }

  function updateBrandingField(path: string, value: string) {
    if (!settings) return;

    const keys = path.split(".");
    const updated = { ...settings };
    let current: any = updated.branding;

    for (let i = 1; i < keys.length - 1; i++) {
      current[keys[i]] = { ...current[keys[i]] };
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setSettings(updated);
  }

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-ink">Assets & Branding</h1>
        <LoadingState message="Loading branding assets..." />
      </div>
    );
  }

  if (error || !settings) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-ink">Assets & Branding</h1>
        <ErrorState message={error || "Settings not found"} retry={loadSettings} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">Assets & Branding</h1>
        <p className="mt-2 text-[14px] text-muted">
          Upload logos, favicons, and configure your brand identity
        </p>
      </div>

      <div className="space-y-6">
        {/* Brand Identity */}
        <DashboardCard 
          icon="Sparkles" 
          title="Brand Identity" 
          description="Your brand name and tagline"
        >
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[12px] font-medium text-muted">Brand Name</label>
              <input type="text" className="w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                placeholder="Your Company Name" value={settings.branding.brandName || ""}
                onChange={(e) => updateBrandingField("branding.brandName", e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="block text-[12px] font-medium text-muted">Brand Tagline</label>
              <input type="text" className="w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                placeholder="Your memorable slogan" value={settings.branding.tagline || ""}
                onChange={(e) => updateBrandingField("branding.tagline", e.target.value)} />
            </div>
          </div>
        </DashboardCard>

        {/* Logo Variants */}
        <DashboardCard 
          icon="Image" 
          title="Logo Variants" 
          description="Upload different logo versions for various contexts"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Primary Logo */}
            <div className="rounded-lg border border-line/50 bg-surface-2/40 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-ink">Primary Logo</p>
                  <p className="text-[11px] text-muted">Full logo (horizontal)</p>
                </div>
                <Icon name="Image" className="h-5 w-5 text-accent" />
              </div>

              {settings.branding.logo.primary ? (
                <div className="group relative mb-3 aspect-video overflow-hidden rounded-lg border border-line/30 bg-gradient-to-br from-surface-2 to-surface-2/40">
                  <img
                    src={settings.branding.logo.primary}
                    alt="Primary Logo"
                    className="h-full w-full object-contain p-4"
                  />
                  <button
                    onClick={() => updateBrandingField("branding.logo.primary", "")}
                    className="absolute right-2 top-2 rounded-lg bg-red-500/90 p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Icon name="Trash2" className="h-3 w-3 text-white" />
                  </button>
                </div>
              ) : (
                <div className="mb-3 flex aspect-video items-center justify-center rounded-lg border-2 border-dashed border-line/50 bg-muted/5">
                  <Icon name="ImagePlus" className="h-8 w-8 text-muted/50" />
                </div>
              )}

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-[13px] font-semibold text-accent transition-all hover:bg-accent/20">
                <Icon name="Upload" className="h-4 w-4" />
                <span>{uploading === "branding.logo.primary" ? "Uploading..." : "Upload"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload("branding.logo.primary", e)}
                  className="hidden"
                  disabled={uploading !== null}
                />
              </label>
            </div>

            {/* Dark Mode Logo */}
            <div className="rounded-lg border border-line/50 bg-surface-2/40 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-ink">Dark Mode Logo</p>
                  <p className="text-[11px] text-muted">For dark backgrounds</p>
                </div>
                <Icon name="Moon" className="h-5 w-5 text-accent" />
              </div>

              {settings.branding.logo.dark ? (
                <div className="group relative mb-3 aspect-video overflow-hidden rounded-lg border border-line/30 bg-[#0a0a0f]">
                  <img
                    src={settings.branding.logo.dark}
                    alt="Dark Mode Logo"
                    className="h-full w-full object-contain p-4"
                  />
                  <button
                    onClick={() => updateBrandingField("branding.logo.dark", "")}
                    className="absolute right-2 top-2 rounded-lg bg-red-500/90 p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Icon name="Trash2" className="h-3 w-3 text-white" />
                  </button>
                </div>
              ) : (
                <div className="mb-3 flex aspect-video items-center justify-center rounded-lg border-2 border-dashed border-line/50 bg-[#0a0a0f]">
                  <Icon name="ImagePlus" className="h-8 w-8 text-muted/50" />
                </div>
              )}

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-[13px] font-semibold text-accent transition-all hover:bg-accent/20">
                <Icon name="Upload" className="h-4 w-4" />
                <span>{uploading === "branding.logo.dark" ? "Uploading..." : "Upload"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload("branding.logo.dark", e)}
                  className="hidden"
                  disabled={uploading !== null}
                />
              </label>
            </div>

            {/* Light Mode Logo */}
            <div className="rounded-lg border border-line/50 bg-surface-2/40 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-ink">Light Mode Logo</p>
                  <p className="text-[11px] text-muted">For light backgrounds</p>
                </div>
                <Icon name="Sun" className="h-5 w-5 text-accent" />
              </div>

              {settings.branding.logo.light ? (
                <div className="group relative mb-3 aspect-video overflow-hidden rounded-lg border border-line/30 bg-white">
                  <img
                    src={settings.branding.logo.light}
                    alt="Light Mode Logo"
                    className="h-full w-full object-contain p-4"
                  />
                  <button
                    onClick={() => updateBrandingField("branding.logo.light", "")}
                    className="absolute right-2 top-2 rounded-lg bg-red-500/90 p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Icon name="Trash2" className="h-3 w-3 text-white" />
                  </button>
                </div>
              ) : (
                <div className="mb-3 flex aspect-video items-center justify-center rounded-lg border-2 border-dashed border-line/50 bg-white">
                  <Icon name="ImagePlus" className="h-8 w-8 text-muted/50" />
                </div>
              )}

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-[13px] font-semibold text-accent transition-all hover:bg-accent/20">
                <Icon name="Upload" className="h-4 w-4" />
                <span>{uploading === "branding.logo.light" ? "Uploading..." : "Upload"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload("branding.logo.light", e)}
                  className="hidden"
                  disabled={uploading !== null}
                />
              </label>
            </div>

            {/* Icon/Mark */}
            <div className="rounded-lg border border-line/50 bg-surface-2/40 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-ink">Icon/Mark</p>
                  <p className="text-[11px] text-muted">Square logo mark</p>
                </div>
                <Icon name="Square" className="h-5 w-5 text-accent" />
              </div>

              {settings.branding.logo.icon ? (
                <div className="group relative mb-3 aspect-square overflow-hidden rounded-lg border border-line/30 bg-gradient-to-br from-surface-2 to-surface-2/40">
                  <img
                    src={settings.branding.logo.icon}
                    alt="Icon/Mark"
                    className="h-full w-full object-contain p-4"
                  />
                  <button
                    onClick={() => updateBrandingField("branding.logo.icon", "")}
                    className="absolute right-2 top-2 rounded-lg bg-red-500/90 p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Icon name="Trash2" className="h-3 w-3 text-white" />
                  </button>
                </div>
              ) : (
                <div className="mb-3 flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-line/50 bg-muted/5">
                  <Icon name="ImagePlus" className="h-8 w-8 text-muted/50" />
                </div>
              )}

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-[13px] font-semibold text-accent transition-all hover:bg-accent/20">
                <Icon name="Upload" className="h-4 w-4" />
                <span>{uploading === "branding.logo.icon" ? "Uploading..." : "Upload"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload("branding.logo.icon", e)}
                  className="hidden"
                  disabled={uploading !== null}
                />
              </label>
            </div>
          </div>
        </DashboardCard>

        {/* Favicon & Social */}
        <DashboardCard 
          icon="Globe" 
          title="Favicon & Social Sharing" 
          description="Browser icon and social media preview image"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Favicon */}
            <div className="rounded-lg border border-line/50 bg-surface-2/40 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-ink">Favicon</p>
                  <p className="text-[11px] text-muted">Browser tab icon (32×32)</p>
                </div>
                <Icon name="Chrome" className="h-5 w-5 text-accent" />
              </div>

              {settings.branding.favicon ? (
                <div className="group relative mb-3 flex h-32 items-center justify-center overflow-hidden rounded-lg border border-line/30 bg-gradient-to-br from-surface-2 to-surface-2/40">
                  <img
                    src={settings.branding.favicon}
                    alt="Favicon"
                    className="h-16 w-16 object-contain"
                  />
                  <button
                    onClick={() => updateBrandingField("branding.favicon", "")}
                    className="absolute right-2 top-2 rounded-lg bg-red-500/90 p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Icon name="Trash2" className="h-3 w-3 text-white" />
                  </button>
                </div>
              ) : (
                <div className="mb-3 flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-line/50 bg-muted/5">
                  <Icon name="ImagePlus" className="h-8 w-8 text-muted/50" />
                </div>
              )}

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-[13px] font-semibold text-accent transition-all hover:bg-accent/20">
                <Icon name="Upload" className="h-4 w-4" />
                <span>{uploading === "branding.favicon" ? "Uploading..." : "Upload"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload("branding.favicon", e)}
                  className="hidden"
                  disabled={uploading !== null}
                />
              </label>
            </div>

            {/* OG Image */}
            <div className="rounded-lg border border-line/50 bg-surface-2/40 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-ink">Social Preview</p>
                  <p className="text-[11px] text-muted">OG image (1200×630)</p>
                </div>
                <Icon name="Share2" className="h-5 w-5 text-accent" />
              </div>

              {settings.branding.ogImage ? (
                <div className="group relative mb-3 aspect-[1200/630] overflow-hidden rounded-lg border border-line/30 bg-gradient-to-br from-surface-2 to-surface-2/40">
                  <img
                    src={settings.branding.ogImage}
                    alt="OG Image"
                    className="h-full w-full object-cover"
                  />
                  <button
                    onClick={() => updateBrandingField("branding.ogImage", "")}
                    className="absolute right-2 top-2 rounded-lg bg-red-500/90 p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Icon name="Trash2" className="h-3 w-3 text-white" />
                  </button>
                </div>
              ) : (
                <div className="mb-3 flex aspect-[1200/630] items-center justify-center rounded-lg border-2 border-dashed border-line/50 bg-muted/5">
                  <Icon name="ImagePlus" className="h-8 w-8 text-muted/50" />
                </div>
              )}

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-[13px] font-semibold text-accent transition-all hover:bg-accent/20">
                <Icon name="Upload" className="h-4 w-4" />
                <span>{uploading === "branding.ogImage" ? "Uploading..." : "Upload"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload("branding.ogImage", e)}
                  className="hidden"
                  disabled={uploading !== null}
                />
              </label>
            </div>
          </div>
        </DashboardCard>

        {/* Save Button */}
        <div className="flex items-center gap-3">
          <button type="button" onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/15 px-6 py-2.5 text-[14px] font-medium text-accent transition-all hover:bg-accent/25 disabled:opacity-60">
            {saving ? "Saving..." : (<><Icon name="Save" className="h-4 w-4" />Save Branding Assets</>)}
          </button>

          {success && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-[13px] font-medium text-emerald-500">
              <Icon name="CheckCircle" className="h-4 w-4" />
              <span>Assets saved successfully!</span>
            </div>
          )}
        </div>

        {/* Information Panel */}
        <DashboardCard icon="Info" title="About Branding Assets">
          <ul className="space-y-2 text-[13px] text-muted">
            <li className="flex gap-2">
              <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
              <span><strong className="text-ink">Primary Logo</strong> is the main horizontal logo used in headers</span>
            </li>
            <li className="flex gap-2">
              <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
              <span><strong className="text-ink">Dark/Light variants</strong> adapt to different background modes</span>
            </li>
            <li className="flex gap-2">
              <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
              <span><strong className="text-ink">Icon/Mark</strong> is a square version for mobile nav and compact spaces</span>
            </li>
            <li className="flex gap-2">
              <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
              <span><strong className="text-ink">Favicon</strong> appears in browser tabs (recommended: 32×32 or 64×64)</span>
            </li>
            <li className="flex gap-2">
              <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
              <span><strong className="text-ink">Social Preview</strong> shows when sharing on social media (1200×630)</span>
            </li>
            <li className="flex gap-2">
              <Icon name="Zap" className="h-4 w-4 mt-0.5 text-yellow-500 shrink-0" />
              <span>All images are uploaded to ImgBB and stored permanently</span>
            </li>
            <li className="flex gap-2">
              <Icon name="Zap" className="h-4 w-4 mt-0.5 text-yellow-500 shrink-0" />
              <span>Max file size: 5MB per image. Formats: PNG, JPG, SVG, WEBP</span>
            </li>
          </ul>
        </DashboardCard>
      </div>
    </div>
  );
}
