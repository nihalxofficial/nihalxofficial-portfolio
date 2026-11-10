"use client";

import { useEffect, useState } from "react";
import { DashboardCard, LoadingState, ErrorState } from "@/components/admin/dashboard-card";
import { Icon } from "@/components/ui/icon";
import { listContent, updateContent } from "@/lib/admin";
import { CmsSwitch } from "@/components/admin/ui";

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

const inputCls = "w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30";
const labelCls = "block text-[12px] font-medium text-muted";

function Field({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className={labelCls}>{label}</label>
      {children}
      {description && <p className="text-[11px] text-faint">{description}</p>}
    </div>
  );
}

export default function HeroManagementPage() {
  const [hero, setHero] = useState<HeroSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => { loadHero(); }, []);

  async function loadHero() {
    try {
      setLoading(true); setError(null);
      const result = await listContent("heroes");
      if (result.items.length > 0) {
        setHero(result.items[0] as unknown as HeroSection);
      } else {
        setError("Hero section not found");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load hero section");
    } finally { setLoading(false); }
  }

  async function handleSave() {
    if (!hero) return;
    try {
      setSaving(true); setSuccess(false);
      await updateContent("heroes", hero._id, hero as unknown as Record<string, unknown>);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save hero section");
    } finally { setSaving(false); }
  }

  function updateField(path: string, value: unknown) {
    if (!hero) return;
    const keys = path.split(".");
    const updated = { ...hero };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = updated;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current[keys[i]] = { ...current[keys[i]] };
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    setHero(updated);
  }

  if (loading) return <div><h1 className="mb-6 text-2xl font-bold text-ink">Hero Section</h1><LoadingState message="Loading hero section..." /></div>;
  if (error || !hero) return <div><h1 className="mb-6 text-2xl font-bold text-ink">Hero Section</h1><ErrorState message={error || "Hero section not found"} retry={loadHero} /></div>;

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Hero Section</h1>
          <p className="mt-2 text-[14px] text-muted">Manage your homepage hero banner content and CTAs</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-muted">Visible</span>
          <CmsSwitch checked={hero.isVisible} onChange={(val) => updateField("isVisible", val)} label="Visible" size="sm" />
        </div>
      </div>

      <div className="space-y-6">
        <DashboardCard icon="User" title="Basic Information" description="Greeting, name, and role">
          <div className="space-y-4">
            <Field label="Greeting"><input placeholder="Hello, I'm" value={hero.greeting} onChange={(e) => updateField("greeting", e.target.value)} className={inputCls} /></Field>
            <Field label="Name"><input placeholder="John Doe" value={hero.name} onChange={(e) => updateField("name", e.target.value)} className={inputCls} /></Field>
            <Field label="Highlighted Name" description="Name with accent styling"><input placeholder="John Doe" value={hero.highlightedName} onChange={(e) => updateField("highlightedName", e.target.value)} className={inputCls} /></Field>
            <Field label="Role"><input placeholder="Full Stack Developer" value={hero.role} onChange={(e) => updateField("role", e.target.value)} className={inputCls} /></Field>
            <Field label="Description"><textarea placeholder="Your brief introduction..." value={hero.description} onChange={(e) => updateField("description", e.target.value)} rows={4} className={inputCls} /></Field>
          </div>
        </DashboardCard>

        <DashboardCard icon="Type" title="Typewriter Animation" description="Rotating text lines">
          <div className="space-y-4">
            <Field label="Prefix (optional)"><input placeholder="I'm a" value={hero.rotator?.prefix || ""} onChange={(e) => updateField("rotator.prefix", e.target.value)} className={inputCls} /></Field>
            <Field label="Rotating Lines (one per line)"><textarea placeholder={"Developer\nDesigner\nCreator"} value={hero.rotator?.lines?.join("\n") || ""} onChange={(e) => updateField("rotator.lines", e.target.value.split("\n").filter(Boolean))} rows={6} className={inputCls} /></Field>
          </div>
        </DashboardCard>

        <DashboardCard icon="MousePointer" title="Call-to-Action Buttons" description="Primary and secondary CTAs">
          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-[13px] font-semibold text-ink">Primary CTA</h4>
              <Field label="Label"><input placeholder="Get in touch" value={hero.primaryCta.label} onChange={(e) => updateField("primaryCta.label", e.target.value)} className={inputCls} /></Field>
              <Field label="URL"><input placeholder="/#contact" value={hero.primaryCta.href} onChange={(e) => updateField("primaryCta.href", e.target.value)} className={inputCls} /></Field>
            </div>
            <div className="h-px bg-line" />
            <div className="space-y-3">
              <h4 className="text-[13px] font-semibold text-ink">Secondary CTA</h4>
              <Field label="Label"><input placeholder="View projects" value={hero.secondaryCta.label} onChange={(e) => updateField("secondaryCta.label", e.target.value)} className={inputCls} /></Field>
              <Field label="URL"><input placeholder="/#projects" value={hero.secondaryCta.href} onChange={(e) => updateField("secondaryCta.href", e.target.value)} className={inputCls} /></Field>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard icon="Image" title="Portrait & Availability" description="Profile image and status">
          <div className="space-y-4">
            <Field label="Portrait URL" description="Upload via Media Library and paste URL here"><input placeholder="https://i.ibb.co/..." value={hero.portraitUrl} onChange={(e) => updateField("portraitUrl", e.target.value)} className={inputCls} /></Field>
            <Field label="Tagline (optional)"><input placeholder="Crafting digital experiences" value={hero.tagline || ""} onChange={(e) => updateField("tagline", e.target.value)} className={inputCls} /></Field>
            <div className="space-y-3">
              <h4 className="text-[13px] font-semibold text-ink">Availability Status</h4>
              <Field label="Label"><input placeholder="Available for hire" value={hero.availability.label} onChange={(e) => updateField("availability.label", e.target.value)} className={inputCls} /></Field>
              <div className="flex items-center gap-2">
                <CmsSwitch checked={hero.availability.isAvailable} onChange={(val) => updateField("availability.isAvailable", val)} label="Available" size="sm" />
                <span className="text-[13px] text-ink">Available</span>
              </div>
            </div>
          </div>
        </DashboardCard>

        <div className="flex items-center gap-3">
          <button type="button" onClick={() => void handleSave()} disabled={saving} className="inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/15 px-5 py-2.5 text-[14px] font-medium text-accent transition-all hover:bg-accent/25 disabled:opacity-60">
            {saving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent/30 border-t-accent" /> : <Icon name="Save" className="h-4 w-4" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {success && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-[13px] font-medium text-emerald-500">
              <Icon name="CheckCircle" className="h-4 w-4" /><span>Hero section saved!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
