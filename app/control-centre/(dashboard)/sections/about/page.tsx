"use client";

import { useEffect, useState } from "react";
import { DashboardCard, LoadingState, ErrorState } from "@/components/admin/dashboard-card";
import { Icon } from "@/components/ui/icon";
import {
  AdminApiError,
  createContent,
  listContent,
  readContent,
  updateContent,
  type EntityRecord,
} from "@/lib/admin";
import { CmsSwitch } from "@/components/admin/ui";

interface AboutHighlight {
  icon: string;
  label: string;
  value: string;
}

interface AboutSection {
  _id: string;
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
  isVisible: boolean;
  order: number;
}

/** Fills missing collections/nested objects so the form never crashes. */
function normaliseAbout(raw: Partial<AboutSection>): AboutSection {
  const codeCard: Partial<AboutSection["codeCard"]> = raw.codeCard ?? {};
  const highlights = Array.isArray(raw.highlights) ? raw.highlights : [];

  return {
    _id: String(raw._id ?? ""),
    label: raw.label ?? "",
    heading: raw.heading ?? "",
    paragraphs: Array.isArray(raw.paragraphs) ? raw.paragraphs : [],
    portraitUrl: raw.portraitUrl ?? "",
    codeCard: {
      name: codeCard.name ?? "",
      role: codeCard.role ?? "",
      location: codeCard.location ?? "",
      education: codeCard.education ?? "",
      experience: codeCard.experience ?? "",
      passion: Array.isArray(codeCard.passion) ? codeCard.passion : [],
    },
    highlights: highlights.map((highlight) => ({
      icon: highlight?.icon ?? "",
      label: highlight?.label ?? "",
      value: highlight?.value ?? "",
    })),
    signature: raw.signature ?? "",
    isVisible: raw.isVisible ?? true,
    order: raw.order ?? 0,
  };
}

export default function AboutManagerPage() {
  const [about, setAbout] = useState<AboutSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Homepage visibility is owned by the `sections` document (key "about"),
  // never by the about singleton itself.
  const [sectionDoc, setSectionDoc] = useState<EntityRecord | null>(null);
  const [visible, setVisible] = useState(true);
  const [togglingVisible, setTogglingVisible] = useState(false);

  useEffect(() => {
    loadAbout();
  }, []);

  async function loadAbout() {
    try {
      setLoading(true);
      setError(null);
      const [record, sections] = await Promise.all([
        // A site that has never been saved is a normal first run, not an error.
        readContent("about", "current").catch((cause: unknown) => {
          if (cause instanceof AdminApiError && cause.status === 404) return {} as EntityRecord;
          throw cause;
        }),
        listContent("sections", { limit: 100 }),
      ]);
      const found = sections.items.find((item) => item.key === "about") ?? null;
      setSectionDoc(found);
      setVisible(found ? found.isVisible !== false : true);
      setAbout(normaliseAbout(record as unknown as Partial<AboutSection>));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load about section");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!about) return;

    try {
      setSaving(true);
      setSuccess(false);
      setSaveError(null);
      await updateContent("about", "current", about as unknown as Record<string, unknown>);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save about section");
    } finally {
      setSaving(false);
    }
  }

  async function toggleVisible(next: boolean) {
    setTogglingVisible(true);
    setSaveError(null);
    try {
      if (sectionDoc) {
        const saved = await updateContent("sections", sectionDoc._id, { isVisible: next });
        setSectionDoc(saved);
      } else {
        const created = await createContent("sections", {
          key: "about",
          label: "About",
          isVisible: next,
          order: 2,
        });
        setSectionDoc(created);
      }
      setVisible(next);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not update this section's visibility");
    } finally {
      setTogglingVisible(false);
    }
  }

  function updateField(path: string, value: unknown) {
    if (!about) return;

    const keys = path.split(".");
    const updated = { ...about };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = updated;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current[keys[i]] = { ...current[keys[i]] };
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setAbout(updated);
  }

  function updateHighlight(index: number, field: keyof AboutHighlight, value: string) {
    if (!about) return;
    const updated = [...about.highlights];
    updated[index] = { ...updated[index], [field]: value };
    setAbout({ ...about, highlights: updated });
  }

  function addHighlight() {
    if (!about) return;
    setAbout({
      ...about,
      highlights: [...about.highlights, { icon: "CheckCircle", label: "", value: "" }],
    });
  }

  function removeHighlight(index: number) {
    if (!about) return;
    setAbout({
      ...about,
      highlights: about.highlights.filter((_, i) => i !== index),
    });
  }

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-ink">About Section</h1>
        <LoadingState message="Loading about section..." />
      </div>
    );
  }

  if (error || !about) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-ink">About Section</h1>
        <ErrorState message={error || "About section not found"} retry={loadAbout} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">About / Who Am I</h1>
          <p className="mt-2 text-[14px] text-muted">
            Manage your introduction, highlights, and personal information
          </p>
        </div>
        <CmsSwitch
          checked={visible}
          onChange={(val) => void toggleVisible(val)}
          label={togglingVisible ? "Saving…" : "Visible"}
          size="sm"
        />
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <DashboardCard icon="User" title="Section Info" description="Label and heading">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[12px] font-medium text-muted">Section Label</label>
              <input
                placeholder="About"
                value={about.label}
                onChange={(e) => updateField("label", e.target.value)}
                className="w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[12px] font-medium text-muted">Heading</label>
              <input
                placeholder="Who Am I"
                value={about.heading}
                onChange={(e) => updateField("heading", e.target.value)}
                className="w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
              />
            </div>
          </div>
        </DashboardCard>

        {/* Introduction Paragraphs */}
        <DashboardCard icon="FileText" title="Introduction" description="Your personal story">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[12px] font-medium text-muted">Paragraphs (one per line)</label>
              <textarea
                placeholder={"I'm a passionate developer...\n\nWith years of experience...\n\nI love creating..."}
                value={about.paragraphs?.join("\n\n") || ""}
                onChange={(e) =>
                  updateField(
                    "paragraphs",
                    e.target.value.split("\n\n").filter(Boolean)
                  )
                }
                rows={8}
                className="w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
              />
            </div>
          </div>
        </DashboardCard>

        {/* Portrait */}
        <DashboardCard icon="Image" title="Portrait Image" description="Your profile photo">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[12px] font-medium text-muted">Portrait URL</label>
              <input
                placeholder="https://i.ibb.co/..."
                value={about.portraitUrl}
                onChange={(e) => updateField("portraitUrl", e.target.value)}
                className="w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[12px] font-medium text-muted">Signature</label>
              <input
                placeholder="Your Name"
                value={about.signature}
                onChange={(e) => updateField("signature", e.target.value)}
                className="w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
              />
            </div>
          </div>
        </DashboardCard>

        {/* Code Card */}
        <DashboardCard icon="Code" title="Code Card" description="Developer info card">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[12px] font-medium text-muted">Name</label>
              <input
                placeholder="John Doe"
                value={about.codeCard?.name || ""}
                onChange={(e) => updateField("codeCard.name", e.target.value)}
                className="w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[12px] font-medium text-muted">Role</label>
              <input
                placeholder="Full Stack Developer"
                value={about.codeCard?.role || ""}
                onChange={(e) => updateField("codeCard.role", e.target.value)}
                className="w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[12px] font-medium text-muted">Location</label>
              <input
                placeholder="San Francisco, CA"
                value={about.codeCard?.location || ""}
                onChange={(e) => updateField("codeCard.location", e.target.value)}
                className="w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[12px] font-medium text-muted">Education</label>
              <input
                placeholder="BS Computer Science"
                value={about.codeCard?.education || ""}
                onChange={(e) => updateField("codeCard.education", e.target.value)}
                className="w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[12px] font-medium text-muted">Experience</label>
              <input
                placeholder="5+ years"
                value={about.codeCard?.experience || ""}
                onChange={(e) => updateField("codeCard.experience", e.target.value)}
                className="w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[12px] font-medium text-muted">Passions (one per line)</label>
              <textarea
                placeholder={"Clean Code\nUI/UX Design\nOpen Source"}
                value={about.codeCard?.passion?.join("\n") || ""}
                onChange={(e) =>
                  updateField(
                    "codeCard.passion",
                    e.target.value.split("\n").filter(Boolean)
                  )
                }
                rows={5}
                className="w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
              />
            </div>
          </div>
        </DashboardCard>

        {/* Highlights */}
        <DashboardCard icon="Star" title="Highlights" description="Key points and achievements">
          <div className="space-y-6">
            {about.highlights.map((highlight, index) => (
              <div
                key={index}
                className="space-y-3 rounded-lg border border-line/50 bg-surface/30 p-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-[13px] font-semibold text-ink">
                    Highlight {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeHighlight(index)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-transparent px-2 py-1.5 text-[12px] font-medium text-muted transition-all hover:border-danger/30 hover:bg-danger/5 hover:text-danger"
                  >
                    <Icon name="Trash2" className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>
                <div className="space-y-1">
                  <label className="block text-[12px] font-medium text-muted">Icon</label>
                  <input
                    placeholder="Award, CheckCircle, Star"
                    value={highlight.icon}
                    onChange={(e) => updateHighlight(index, "icon", e.target.value)}
                    className="w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[12px] font-medium text-muted">Label</label>
                  <input
                    placeholder="Years Experience, Projects Completed"
                    value={highlight.label}
                    onChange={(e) => updateHighlight(index, "label", e.target.value)}
                    className="w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[12px] font-medium text-muted">Value</label>
                  <input
                    placeholder="5+, 100+, Expert"
                    value={highlight.value}
                    onChange={(e) => updateHighlight(index, "value", e.target.value)}
                    className="w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addHighlight}
              className="inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/15 px-4 py-2 text-[13px] font-medium text-accent transition-all hover:bg-accent/25"
            >
              <Icon name="Plus" className="h-4 w-4" />
              Add Highlight
            </button>
          </div>
        </DashboardCard>

        {/* Save Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/15 px-5 py-2.5 text-[14px] font-medium text-accent transition-all hover:bg-accent/25 disabled:opacity-60"
          >
            {saving ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
            ) : (
              <Icon name="Save" className="h-4 w-4" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>

          {success && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-[13px] font-medium text-emerald-500">
              <Icon name="CheckCircle" className="h-4 w-4" />
              <span>About section saved!</span>
            </div>
          )}

          {saveError && (
            <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2 text-[13px] font-medium text-danger">
              <Icon name="AlertTriangle" className="h-4 w-4" />
              <span>{saveError}</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
