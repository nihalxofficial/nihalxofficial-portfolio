"use client";

import { useEffect, useState } from "react";
import { DashboardCard, LoadingState, ErrorState } from "@/components/admin/dashboard-card";
import { Icon } from "@/components/ui/icon";
import { listContent, updateContent } from "@/lib/admin";
import { Input, Textarea, Button, Switch } from "@heroui/react";

interface HeroSection {
  _id: string;
  greeting: string;
  name: string;
  highlightedName: string;
  role: string;
  description: string;
  availability: { label: string; isAvailable: boolean };
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  portraitUrl: string;
  tagline?: string;
  rotator?: { prefix?: string; lines: string[] };
  isVisible: boolean;
  order: number;
}

export default function HeroManagementPage() {
  const [hero, setHero] = useState<HeroSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadHero();
  }, []);

  async function loadHero() {
    try {
      setLoading(true);
      setError(null);
      const result = await listContent("heroes");
      if (result.items.length > 0) {
        setHero(result.items[0] as unknown as HeroSection);
      } else {
        setError("Hero section not found");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load hero section");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!hero) return;

    try {
      setSaving(true);
      setSuccess(false);
      await updateContent("heroes", hero._id, hero);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save hero section");
    } finally {
      setSaving(false);
    }
  }

  function updateField(path: string, value: unknown) {
    if (!hero) return;

    const keys = path.split(".");
    const updated = { ...hero };
    let current: any = updated;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current[keys[i]] = { ...current[keys[i]] };
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setHero(updated);
  }

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-ink">Hero Section</h1>
        <LoadingState message="Loading hero section..." />
      </div>
    );
  }

  if (error || !hero) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-ink">Hero Section</h1>
        <ErrorState message={error || "Hero section not found"} retry={loadHero} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Hero Section</h1>
          <p className="mt-2 text-[14px] text-muted">
            Manage your homepage hero banner content and CTAs
          </p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-[13px] text-muted">Visible</span>
          <Switch
            isSelected={hero.isVisible}
            onValueChange={(val) => updateField("isVisible", val)}
            size="sm"
            color="primary"
          />
        </label>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <DashboardCard icon="User" title="Basic Information" description="Greeting, name, and role">
          <div className="space-y-4">
            <Input
              label="Greeting"
              placeholder="Hello, I'm"
              value={hero.greeting}
              onChange={(e) => updateField("greeting", e.target.value)}
            />
            <Input
              label="Name"
              placeholder="John Doe"
              value={hero.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
            <Input
              label="Highlighted Name"
              placeholder="John Doe"
              description="Name with accent styling"
              value={hero.highlightedName}
              onChange={(e) => updateField("highlightedName", e.target.value)}
            />
            <Input
              label="Role"
              placeholder="Full Stack Developer"
              value={hero.role}
              onChange={(e) => updateField("role", e.target.value)}
            />
            <Textarea
              label="Description"
              placeholder="Your brief introduction..."
              value={hero.description}
              onChange={(e) => updateField("description", e.target.value)}
              maxRows={4}
            />
          </div>
        </DashboardCard>

        {/* Typewriter Rotator */}
        <DashboardCard icon="Type" title="Typewriter Animation" description="Rotating text lines">
          <div className="space-y-4">
            <Input
              label="Prefix (optional)"
              placeholder="I'm a"
              value={hero.rotator?.prefix || ""}
              onChange={(e) => updateField("rotator.prefix", e.target.value)}
            />
            <Textarea
              label="Rotating Lines (one per line)"
              placeholder="Developer&#10;Designer&#10;Creator"
              value={hero.rotator?.lines?.join("\n") || ""}
              onChange={(e) =>
                updateField(
                  "rotator.lines",
                  e.target.value.split("\n").filter(Boolean)
                )
              }
              maxRows={6}
            />
          </div>
        </DashboardCard>

        {/* CTAs */}
        <DashboardCard icon="MousePointer" title="Call-to-Action Buttons" description="Primary and secondary CTAs">
          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-[13px] font-semibold text-ink">Primary CTA</h4>
              <Input
                label="Label"
                placeholder="Get in touch"
                value={hero.primaryCta.label}
                onChange={(e) => updateField("primaryCta.label", e.target.value)}
              />
              <Input
                label="URL"
                placeholder="/#contact"
                value={hero.primaryCta.href}
                onChange={(e) => updateField("primaryCta.href", e.target.value)}
              />
            </div>

            <div className="h-px bg-line" />

            <div className="space-y-3">
              <h4 className="text-[13px] font-semibold text-ink">Secondary CTA</h4>
              <Input
                label="Label"
                placeholder="View projects"
                value={hero.secondaryCta.label}
                onChange={(e) => updateField("secondaryCta.label", e.target.value)}
              />
              <Input
                label="URL"
                placeholder="/#projects"
                value={hero.secondaryCta.href}
                onChange={(e) => updateField("secondaryCta.href", e.target.value)}
              />
            </div>
          </div>
        </DashboardCard>

        {/* Availability & Portrait */}
        <DashboardCard icon="Image" title="Portrait & Availability" description="Profile image and status">
          <div className="space-y-4">
            <Input
              label="Portrait URL"
              placeholder="https://i.ibb.co/..."
              value={hero.portraitUrl}
              onChange={(e) => updateField("portraitUrl", e.target.value)}
              description="Upload via Media Library and paste URL here"
            />
            <Input
              label="Tagline (optional)"
              placeholder="Crafting digital experiences"
              value={hero.tagline || ""}
              onChange={(e) => updateField("tagline", e.target.value)}
            />
            <div className="space-y-3">
              <h4 className="text-[13px] font-semibold text-ink">Availability Status</h4>
              <Input
                label="Label"
                placeholder="Available for hire"
                value={hero.availability.label}
                onChange={(e) => updateField("availability.label", e.target.value)}
              />
              <label className="flex items-center gap-2 cursor-pointer">
                <Switch
                  size="sm"
                  isSelected={hero.availability.isAvailable}
                  onValueChange={(val) => updateField("availability.isAvailable", val)}
                />
                <span className="text-[13px] text-ink">Available</span>
              </label>
            </div>
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
              <span>Hero section saved!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
