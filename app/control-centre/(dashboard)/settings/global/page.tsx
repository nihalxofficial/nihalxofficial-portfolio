"use client";

import { useEffect, useState } from "react";
import { DashboardCard, LoadingState, ErrorState } from "@/components/admin/dashboard-card";
import { Icon } from "@/components/ui/icon";
import { readContent, updateContent } from "@/lib/admin";
import { Input, Textarea, Button } from "@heroui/react";

interface GlobalSettings {
  _id: string;
  siteName: string;
  siteUrl: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  resumeUrl: string;
  contact: {
    email?: string;
    phone?: string;
    location?: string;
    availability?: string;
  };
}

export default function GlobalSettingsPage() {
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      setError(null);
      const data = await readContent("settings", "default");
      setSettings(data as unknown as GlobalSettings);
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
      await updateContent("settings", settings._id, settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  function updateField(path: string, value: unknown) {
    if (!settings) return;

    const keys = path.split(".");
    const updated = { ...settings };
    let current: any = updated;

    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = { ...current[keys[i]] };
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setSettings(updated);
  }

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-ink">Global Settings</h1>
        <LoadingState message="Loading settings..." />
      </div>
    );
  }

  if (error || !settings) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-ink">Global Settings</h1>
        <ErrorState message={error || "Settings not found"} retry={loadSettings} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">Global Settings</h1>
        <p className="mt-2 text-[14px] text-muted">
          Configure your website's core information and metadata
        </p>
      </div>

      <div className="space-y-6">
        {/* Site Information */}
        <DashboardCard icon="Globe" title="Site Information" description="Basic site details and branding">
          <div className="space-y-4">
            <Input
              label="Site Name"
              placeholder="My Portfolio"
              value={settings.siteName}
              onChange={(e) => updateField("siteName", e.target.value)}
            />
            <Input
              label="Site URL"
              placeholder="https://yourportfolio.com"
              value={settings.siteUrl}
              onChange={(e) => updateField("siteUrl", e.target.value)}
            />
            <Input
              label="Resume URL"
              placeholder="https://example.com/resume.pdf"
              value={settings.resumeUrl || ""}
              onChange={(e) => updateField("resumeUrl", e.target.value)}
            />
          </div>
        </DashboardCard>

        {/* SEO Settings */}
        <DashboardCard icon="Search" title="SEO & Metadata" description="Search engine optimization">
          <div className="space-y-4">
            <Input
              label="Meta Title"
              placeholder="Full Stack Developer | Portfolio"
              value={settings.metaTitle}
              onChange={(e) => updateField("metaTitle", e.target.value)}
            />
            <Textarea
              label="Meta Description"
              placeholder="Professional portfolio showcasing projects, skills, and experience..."
              value={settings.metaDescription}
              onChange={(e) => updateField("metaDescription", e.target.value)}
              maxRows={4}
            />
            <Input
              label="Keywords (comma-separated)"
              placeholder="developer, portfolio, react, typescript"
              value={settings.keywords?.join(", ") || ""}
              onChange={(e) =>
                updateField(
                  "keywords",
                  e.target.value
                    .split(",")
                    .map((k) => k.trim())
                    .filter(Boolean)
                )
              }
            />
          </div>
        </DashboardCard>

        {/* Contact Information */}
        <DashboardCard icon="Mail" title="Contact Information" description="How visitors can reach you">
          <div className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="hello@example.com"
              value={settings.contact?.email || ""}
              onChange={(e) => updateField("contact.email", e.target.value)}
            />
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={settings.contact?.phone || ""}
              onChange={(e) => updateField("contact.phone", e.target.value)}
            />
            <Input
              label="Location"
              placeholder="San Francisco, CA"
              value={settings.contact?.location || ""}
              onChange={(e) => updateField("contact.location", e.target.value)}
            />
            <Input
              label="Availability Status"
              placeholder="Available for hire"
              value={settings.contact?.availability || ""}
              onChange={(e) => updateField("contact.availability", e.target.value)}
            />
          </div>
        </DashboardCard>

        {/* Save Button */}
        <div className="flex items-center gap-3">
          <Button
            onPress={handleSave}
            isLoading={saving}
            color="primary"
            size="lg"
            startContent={!saving ? <Icon name="Save" className="h-4 w-4" /> : undefined}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>

          {success && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-[13px] font-medium text-emerald-500">
              <Icon name="CheckCircle" className="h-4 w-4" />
              <span>Settings saved successfully!</span>
            </div>
          )}
        </div>

        {/* Information Panel */}
        <DashboardCard icon="Info" title="About Global Settings">
          <ul className="space-y-2 text-[13px] text-muted">
            <li className="flex gap-2">
              <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
              <span><strong className="text-ink">Site Name</strong> appears in browser tabs and SEO metadata</span>
            </li>
            <li className="flex gap-2">
              <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
              <span><strong className="text-ink">Meta Description</strong> appears in search engine results</span>
            </li>
            <li className="flex gap-2">
              <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
              <span><strong className="text-ink">Keywords</strong> help search engines understand your content</span>
            </li>
            <li className="flex gap-2">
              <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
              <span><strong className="text-ink">Contact information</strong> displays in your contact section</span>
            </li>
          </ul>
        </DashboardCard>
      </div>
    </div>
  );
}
