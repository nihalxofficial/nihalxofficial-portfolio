"use client";

import { useEffect, useState } from "react";
import { DashboardCard, LoadingState, ErrorState, EmptyState } from "@/components/admin/dashboard-card";
import { Icon } from "@/components/ui/icon";
import { listContent, createContent, updateContent, deleteContent } from "@/lib/admin";
import { Input, Textarea, Button, Switch, Select, SelectItem } from "@heroui/react";

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
        <Button
          onPress={startCreate}
          color="primary"
          startContent={<Icon name="Plus" className="h-4 w-4" />}
        >
          Add Experience
        </Button>
      </div>

      {/* Create/Edit Form */}
      {(creating || editing) && (
        <DashboardCard className="mb-6" icon="Edit" title={editing ? "Edit Experience" : "Add Experience"}>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Company / Organization"
                placeholder="Acme Corp"
                value={formData.organization || ""}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              />
              <Input
                label="Role / Position"
                placeholder="Senior Full Stack Developer"
                value={formData.role || ""}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Employment Type"
                placeholder="Full-time, Part-time, Contract"
                value={formData.employmentType || ""}
                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
              />
              <Input
                label="Location"
                placeholder="San Francisco, CA / Remote"
                value={formData.location || ""}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Input
                type="date"
                label="Start Date"
                value={formData.startDate || ""}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
              <Input
                type="date"
                label="End Date"
                value={formData.endDate || ""}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                isDisabled={formData.isCurrent}
              />
              <label className="flex items-center gap-2 cursor-pointer">
                <Switch
                  size="sm"
                  isSelected={formData.isCurrent || false}
                  onValueChange={(val) => setFormData({ ...formData, isCurrent: val, endDate: val ? "" : formData.endDate })}
                />
                <span className="text-[13px] text-ink">Current Position</span>
              </label>
            </div>

            <Select
              label="Status"
              placeholder="Select status"
              selectedKeys={formData.status ? [formData.status] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as Experience["status"];
                setFormData({ ...formData, status: selected });
              }}
            >
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>

            <Textarea
              label="Description"
              placeholder="Brief overview of your role and achievements..."
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              maxRows={4}
            />

            <Textarea
              label="Key Responsibilities (one per line)"
              placeholder="Led team of 5 developers&#10;Architected microservices infrastructure&#10;Reduced deployment time by 50%"
              value={formData.responsibilities?.join("\n") || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  responsibilities: e.target.value.split("\n").filter(Boolean),
                })
              }
              maxRows={6}
            />

            <Textarea
              label="Technologies Used (one per line)"
              placeholder="React&#10;Node.js&#10;PostgreSQL&#10;Docker"
              value={formData.technologies?.join("\n") || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  technologies: e.target.value.split("\n").filter(Boolean),
                })
              }
              maxRows={5}
            />

            <div className="flex gap-3 pt-2">
              <Button onPress={handleSave} color="primary" isLoading={saving}>
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </Button>
              <Button onPress={cancelEdit} variant="bordered">
                Cancel
              </Button>
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
            <Button onPress={startCreate} color="primary">
              Add Your First Experience
            </Button>
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
                    <Switch
                      size="sm"
                      isSelected={exp.isVisible}
                      onValueChange={() => toggleVisibility(exp._id, exp.isVisible)}
                      aria-label="Toggle visibility"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 border-t border-line/50 pt-3">
                    <Button
                      size="sm"
                      variant="light"
                      onPress={() => startEdit(exp)}
                      startContent={<Icon name="Edit" className="h-3.5 w-3.5" />}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="light"
                      color="danger"
                      onPress={() => handleDelete(exp._id)}
                      startContent={<Icon name="Trash2" className="h-3.5 w-3.5" />}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </DashboardCard>
            ))}
        </div>
      )}
    </div>
  );
}
