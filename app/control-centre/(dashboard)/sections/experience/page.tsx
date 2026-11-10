"use client";

import { useEffect, useState } from "react";
import { DashboardCard, LoadingState, ErrorState, EmptyState } from "@/components/admin/dashboard-card";
import { Icon } from "@/components/ui/icon";
import { listContent, createContent, updateContent, deleteContent } from "@/lib/admin";
import { CmsSwitch } from "@/components/admin/ui";

interface Experience {
  _id: string;
  organization: string;
  role: string;
  employmentType: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: "current" | "upcoming" | "ongoing" | "completed";
  description: string;
  responsibilities: string[];
  technologies: string[];
  order: number;
  isVisible: boolean;
}

const STATUS_OPTIONS = [
  { value: "current", label: "Current" },
  { value: "upcoming", label: "Upcoming" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
];

export default function ExperienceManagerPage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Experience>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadExperiences();
  }, []);

  async function loadExperiences() {
    try {
      setLoading(true);
      setError(null);
      const result = await listContent("experiences");
      setExperiences(result.items as unknown as Experience[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load experiences");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      if (!formData.organization || !formData.role) {
        alert("Organization and role are required");
        return;
      }

      setSaving(true);

      if (editing) {
        await updateContent("experiences", editing, formData);
      } else {
        await createContent("experiences", {
          ...formData,
          order: experiences.length,
          isVisible: true,
        });
      }

      await loadExperiences();
      setEditing(null);
      setCreating(false);
      setFormData({});
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save experience");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this experience?")) return;

    try {
      await deleteContent("experiences", id);
      await loadExperiences();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete experience");
    }
  }

  async function toggleVisibility(id: string, currentState: boolean) {
    try {
      await updateContent("experiences", id, { isVisible: !currentState });
      setExperiences((prev) =>
        prev.map((exp) => (exp._id === id ? { ...exp, isVisible: !currentState } : exp))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update visibility");
    }
  }

  function startEdit(exp: Experience) {
    setEditing(exp._id);
    setFormData(exp);
    setCreating(false);
  }

  function startCreate() {
    setCreating(true);
    setEditing(null);
    setFormData({
      organization: "",
      role: "",
      employmentType: "Full-time",
      location: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      status: "completed",
      description: "",
      responsibilities: [],
      technologies: [],
    });
  }

  function cancelEdit() {
    setEditing(null);
    setCreating(false);
    setFormData({});
  }

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-ink">Experience</h1>
        <LoadingState message="Loading experiences..." />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-ink">Experience</h1>
        <ErrorState message={error} retry={loadExperiences} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Work Experience</h1>
          <p className="mt-2 text-[14px] text-muted">
            Manage your professional work history and roles
          </p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/15 px-4 py-2 text-[13px] font-medium text-accent transition-all hover:bg-accent/25"
        >
          <Icon name="Plus" className="h-4 w-4" />
          Add Experience
        </button>
      </div>

      {/* Create/Edit Form */}
      {(creating || editing) && (
        <DashboardCard className="mb-6" icon="Edit" title={editing ? "Edit Experience" : "Add Experience"}>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="block text-[12px] font-medium text-muted">Company / Organization</label>
                <input
                  type="text"
                  placeholder="Acme Corp"
                  value={formData.organization || ""}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[12px] font-medium text-muted">Role / Position</label>
                <input
                  type="text"
                  placeholder="Senior Full Stack Developer"
                  value={formData.role || ""}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="block text-[12px] font-medium text-muted">Employment Type</label>
                <input
                  type="text"
                  placeholder="Full-time, Part-time, Contract"
                  value={formData.employmentType || ""}
                  onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                  className="w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[12px] font-medium text-muted">Location</label>
                <input
                  type="text"
                  placeholder="San Francisco, CA / Remote"
                  value={formData.location || ""}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <label className="block text-[12px] font-medium text-muted">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate || ""}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[12px] font-medium text-muted">End Date</label>
                <input
                  type="date"
                  value={formData.endDate || ""}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  disabled={formData.isCurrent}
                  className="w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                />
              </div>
              <div className="flex items-center">
                <CmsSwitch
                  checked={formData.isCurrent || false}
                  onChange={(val) => setFormData({ ...formData, isCurrent: val, endDate: val ? "" : formData.endDate })}
                  label="Current Position"
                  size="sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[12px] font-medium text-muted">Status</label>
              <select
                value={formData.status || ""}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Experience["status"] })}
                className="w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[12px] font-medium text-muted">Description</label>
              <textarea
                placeholder="Brief overview of your role and achievements..."
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[12px] font-medium text-muted">Key Responsibilities (one per line)</label>
              <textarea
                placeholder={"Led team of 5 developers\nArchitected microservices infrastructure\nReduced deployment time by 50%"}
                value={formData.responsibilities?.join("\n") || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    responsibilities: e.target.value.split("\n").filter(Boolean),
                  })
                }
                rows={6}
                className="w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[12px] font-medium text-muted">Technologies Used (one per line)</label>
              <textarea
                placeholder={"React\nNode.js\nPostgreSQL\nDocker"}
                value={formData.technologies?.join("\n") || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    technologies: e.target.value.split("\n").filter(Boolean),
                  })
                }
                rows={5}
                className="w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/15 px-4 py-2 text-[13px] font-medium text-accent transition-all hover:bg-accent/25 disabled:opacity-60"
              >
                {saving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent/30 border-t-accent" /> : null}
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface-2/40 px-4 py-2 text-[13px] font-medium text-muted transition-all hover:border-line-strong hover:text-ink"
              >
                Cancel
              </button>
            </div>
          </div>
        </DashboardCard>
      )}

      {/* Experiences List */}
      {experiences.length === 0 ? (
        <EmptyState
          icon="Briefcase"
          title="No experience entries yet"
          description="Add your first work experience to build your professional timeline"
          action={
            <button
              type="button"
              onClick={startCreate}
              className="inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/15 px-4 py-2 text-[13px] font-medium text-accent transition-all hover:bg-accent/25"
            >
              <Icon name="Plus" className="h-4 w-4" />
              Add Your First Experience
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {experiences
            .sort((a, b) => a.order - b.order)
            .map((exp) => (
              <DashboardCard key={exp._id} hover>
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-gradient-to-br from-accent/15 to-accent/5 text-accent">
                        <Icon name="Briefcase" className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-[15px] text-ink">{exp.role}</h3>
                        <p className="mt-0.5 text-[13px] text-muted">{exp.organization}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-muted">
                          <span>{exp.employmentType}</span>
                          <span>•</span>
                          <span>{exp.location}</span>
                          <span>•</span>
                          <span>
                            {exp.startDate} - {exp.isCurrent ? "Present" : exp.endDate}
                          </span>
                        </div>
                        {exp.technologies && exp.technologies.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {exp.technologies.slice(0, 5).map((tech, idx) => (
                              <span
                                key={idx}
                                className="rounded-md bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent ring-1 ring-accent/20"
                              >
                                {tech}
                              </span>
                            ))}
                            {exp.technologies.length > 5 && (
                              <span className="rounded-md bg-muted/10 px-2 py-0.5 text-[11px] font-medium text-muted">
                                +{exp.technologies.length - 5} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <CmsSwitch
                      checked={exp.isVisible}
                      onChange={() => void toggleVisibility(exp._id, exp.isVisible)}
                      label="Toggle visibility"
                      size="sm"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 border-t border-line/50 pt-3">
                    <button
                      type="button"
                      onClick={() => startEdit(exp)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-transparent px-2 py-1.5 text-[12px] font-medium text-muted transition-all hover:border-line hover:bg-surface-2/60 hover:text-accent"
                    >
                      <Icon name="Edit" className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(exp._id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-transparent px-2 py-1.5 text-[12px] font-medium text-muted transition-all hover:border-danger/30 hover:bg-danger/5 hover:text-danger"
                    >
                      <Icon name="Trash2" className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </DashboardCard>
            ))}
        </div>
      )}
    </div>
  );
}
