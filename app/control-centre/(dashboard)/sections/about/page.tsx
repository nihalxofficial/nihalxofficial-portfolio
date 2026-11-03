"use client";

import { useEffect, useState } from "react";
import { DashboardCard, LoadingState, ErrorState } from "@/components/admin/dashboard-card";
import { Icon } from "@/components/ui/icon";
import { listContent, updateContent } from "@/lib/admin";
import { Input, Textarea, Button, Switch } from "@heroui/react";

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

export default function AboutManagerPage() {
  const [about, setAbout] = useState<AboutSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadAbout();
  }, []);

  async function loadAbout() {
    try {
      setLoading(true);
      setError(null);
      const result = await listContent("abouts");
      if (result.items.length > 0) {
        setAbout(result.items[0] as unknown as AboutSection);
      } else {
        setError("About section not found");
      }
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
      await updateContent("abouts", about._id, about);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save about section");
    } finally {
      setSaving(false);
    }
  }

  function updateField(path: string, value: unknown) {
    if (!about) return;

    const keys = path.split(".");
    const updated = { ...about };
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
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-[13px] text-muted">Visible</span>
          <Switch
            isSelected={about.isVisible}
            onValueChange={(val) => updateField("isVisible", val)}
            size="sm"
            color="primary"
          />
        </label>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <DashboardCard icon="User" title="Section Info" description="Label and heading">
          <div className="space-y-4">
            <Input
              label="Section Label"
              placeholder="About"
              value={about.label}
              onChange={(e) => updateField("label", e.target.value)}
            />
            <Input
              label="Heading"
              placeholder="Who Am I"
              value={about.heading}
              onChange={(e) => updateField("heading", e.target.value)}
            />
          </div>
        </DashboardCard>

        {/* Introduction Paragraphs */}
        <DashboardCard icon="FileText" title="Introduction" description="Your personal story">
          <div className="space-y-4">
            <Textarea
              label="Paragraphs (one per line)"
              placeholder="I'm a passionate developer...&#10;&#10;With years of experience...&#10;&#10;I love creating..."
              description="Separate paragraphs with blank lines"
              value={about.paragraphs?.join("\n\n") || ""}
              onChange={(e) =>
                updateField(
                  "paragraphs",
                  e.target.value.split("\n\n").filter(Boolean)
                )
              }
              minRows={8}
            />
          </div>
        </DashboardCard>

        {/* Portrait */}
        <DashboardCard icon="Image" title="Portrait Image" description="Your profile photo">
          <div className="space-y-4">
            <Input
              label="Portrait URL"
              placeholder="https://i.ibb.co/..."
              description="Upload via Media Library and paste URL here"
              value={about.portraitUrl}
              onChange={(e) => updateField("portraitUrl", e.target.value)}
            />
            <Input
              label="Signature"
              placeholder="Your Name"
              description="Handwritten-style signature text"
              value={about.signature}
              onChange={(e) => updateField("signature", e.target.value)}
            />
          </div>
        </DashboardCard>

        {/* Code Card */}
        <DashboardCard icon="Code" title="Code Card" description="Developer info card">
          <div className="space-y-4">
            <Input
              label="Name"
              placeholder="John Doe"
              value={about.codeCard?.name || ""}
              onChange={(e) => updateField("codeCard.name", e.target.value)}
            />
            <Input
              label="Role"
              placeholder="Full Stack Developer"
              value={about.codeCard?.role || ""}
              onChange={(e) => updateField("codeCard.role", e.target.value)}
            />
            <Input
              label="Location"
              placeholder="San Francisco, CA"
              value={about.codeCard?.location || ""}
              onChange={(e) => updateField("codeCard.location", e.target.value)}
            />
            <Input
              label="Education"
              placeholder="BS Computer Science"
              value={about.codeCard?.education || ""}
              onChange={(e) => updateField("codeCard.education", e.target.value)}
            />
            <Input
              label="Experience"
              placeholder="5+ years"
              value={about.codeCard?.experience || ""}
              onChange={(e) => updateField("codeCard.experience", e.target.value)}
            />
            <Textarea
              label="Passions (one per line)"
              placeholder="Clean Code&#10;UI/UX Design&#10;Open Source"
              value={about.codeCard?.passion?.join("\n") || ""}
              onChange={(e) =>
                updateField(
                  "codeCard.passion",
                  e.target.value.split("\n").filter(Boolean)
                )
              }
              maxRows={5}
            />
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
                  <Button
                    size="sm"
                    color="danger"
                    variant="light"
                    onPress={() => removeHighlight(index)}
                    startContent={<Icon name="Trash2" className="h-3.5 w-3.5" />}
                  >
                    Remove
                  </Button>
                </div>
                <Input
                  label="Icon"
                  placeholder="Award, CheckCircle, Star"
                  value={highlight.icon}
                  onChange={(e) => updateHighlight(index, "icon", e.target.value)}
                />
                <Input
                  label="Label"
                  placeholder="Years Experience, Projects Completed"
                  value={highlight.label}
                  onChange={(e) => updateHighlight(index, "label", e.target.value)}
                />
                <Input
                  label="Value"
                  placeholder="5+, 100+, Expert"
                  value={highlight.value}
                  onChange={(e) => updateHighlight(index, "value", e.target.value)}
                />
              </div>
            ))}

            <Button
              onPress={addHighlight}
              variant="bordered"
              startContent={<Icon name="Plus" className="h-4 w-4" />}
            >
              Add Highlight
            </Button>
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
              <span>About section saved!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
