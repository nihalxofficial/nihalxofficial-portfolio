"use client";

import { useEffect, useState } from "react";
import { DashboardCard, LoadingState, ErrorState, EmptyState } from "@/components/admin/dashboard-card";
import { Icon } from "@/components/ui/icon";
import { listContent, createContent, updateContent, deleteContent } from "@/lib/admin";
import { Input, Textarea, Button, Switch } from "@heroui/react";

interface Education {
  _id: string;
  degree: string;
  institution: string;
  field: string;
  period: string;
  description: string;
  highlights: string[];
  icon: string;
  order: number;
  isVisible: boolean;
}

export default function EducationManagerPage() {
  const [education, setEducation] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Education>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadEducation();
  }, []);

  async function loadEducation() {
    try {
      setLoading(true);
      setError(null);
      const result = await listContent("educations");
      setEducation(result.items as unknown as Education[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load education");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      if (!formData.degree || !formData.institution) {
        alert("Degree and institution are required");
        return;
      }

      setSaving(true);

      if (editing) {
        await updateContent("educations", editing, formData);
      } else {
        await createContent("educations", {
          ...formData,
          order: education.length,
          isVisible: true,
        });
      }

      await loadEducation();
      setEditing(null);
      setCreating(false);
      setFormData({});
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save education");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this education entry?")) return;

    try {
      await deleteContent("educations", id);
      await loadEducation();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete education");
    }
  }

  async function toggleVisibility(id: string, currentState: boolean) {
    try {
      await updateContent("educations", id, { isVisible: !currentState });
      setEducation((prev) =>
        prev.map((edu) => (edu._id === id ? { ...edu, isVisible: !currentState } : edu))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update visibility");
    }
  }

  function startEdit(edu: Education) {
    setEditing(edu._id);
    setFormData(edu);
    setCreating(false);
  }

  function startCreate() {
    setCreating(true);
    setEditing(null);
    setFormData({
      degree: "",
      institution: "",
      field: "",
      period: "",
      description: "",
      highlights: [],
      icon: "GraduationCap",
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
        <h1 className="mb-6 text-2xl font-bold text-ink">Education</h1>
        <LoadingState message="Loading education..." />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-ink">Education</h1>
        <ErrorState message={error} retry={loadEducation} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Education</h1>
          <p className="mt-2 text-[14px] text-muted">
            Manage your academic background and qualifications
          </p>
        </div>
        <Button
          onPress={startCreate}
          color="primary"
          startContent={<Icon name="Plus" className="h-4 w-4" />}
        >
          Add Education
        </Button>
      </div>

      {/* Create/Edit Form */}
      {(creating || editing) && (
        <DashboardCard className="mb-6" icon="Edit" title={editing ? "Edit Education" : "Add Education"}>
          <div className="space-y-4">
            <Input
              label="Degree"
              placeholder="Bachelor of Science, Master's, PhD"
              value={formData.degree || ""}
              onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
            />

            <Input
              label="Institution"
              placeholder="University of California, MIT"
              value={formData.institution || ""}
              onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
            />

            <Input
              label="Field of Study"
              placeholder="Computer Science, Software Engineering"
              value={formData.field || ""}
              onChange={(e) => setFormData({ ...formData, field: e.target.value })}
            />

            <Input
              label="Period"
              placeholder="2015 - 2019, Class of 2020"
              description="When you attended (e.g., '2015 - 2019' or 'Class of 2020')"
              value={formData.period || ""}
              onChange={(e) => setFormData({ ...formData, period: e.target.value })}
            />

            <Textarea
              label="Description"
              placeholder="Brief overview of your studies and achievements..."
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              maxRows={4}
            />

            <Textarea
              label="Highlights (one per line)"
              placeholder="GPA: 3.9/4.0&#10;Dean's List&#10;President's Scholar&#10;Graduated with Honors"
              description="Key achievements, honors, or relevant coursework"
              value={formData.highlights?.join("\n") || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  highlights: e.target.value.split("\n").filter(Boolean),
                })
              }
              maxRows={6}
            />

            <Input
              label="Icon (Lucide name)"
              placeholder="GraduationCap, BookOpen, Award"
              description="Icon to display with this education entry"
              value={formData.icon || ""}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
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

      {/* Education List */}
      {education.length === 0 ? (
        <EmptyState
          icon="GraduationCap"
          title="No education entries yet"
          description="Add your first education entry to showcase your academic background"
          action={
            <Button onPress={startCreate} color="primary">
              Add Your First Education
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {education
            .sort((a, b) => a.order - b.order)
            .map((edu) => (
              <DashboardCard key={edu._id} hover>
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-gradient-to-br from-accent/15 to-accent/5 text-accent">
                        <Icon name={edu.icon || "GraduationCap"} className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-[15px] text-ink">{edu.degree}</h3>
                        <p className="mt-0.5 text-[13px] text-muted">{edu.institution}</p>
                        {edu.field && (
                          <p className="mt-1 text-[12px] text-muted">Field: {edu.field}</p>
                        )}
                        <p className="mt-1 text-[12px] text-muted">{edu.period}</p>
                        {edu.highlights && edu.highlights.length > 0 && (
                          <ul className="mt-3 space-y-1">
                            {edu.highlights.slice(0, 3).map((highlight, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-[12px] text-muted">
                                <Icon name="CheckCircle" className="h-3.5 w-3.5 mt-0.5 shrink-0 text-accent" />
                                <span>{highlight}</span>
                              </li>
                            ))}
                            {edu.highlights.length > 3 && (
                              <li className="text-[11px] text-muted pl-5">
                                +{edu.highlights.length - 3} more highlights
                              </li>
                            )}
                          </ul>
                        )}
                      </div>
                    </div>
                    <Switch
                      size="sm"
                      isSelected={edu.isVisible}
                      onValueChange={() => toggleVisibility(edu._id, edu.isVisible)}
                      aria-label="Toggle visibility"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 border-t border-line/50 pt-3">
                    <Button
                      size="sm"
                      variant="light"
                      onPress={() => startEdit(edu)}
                      startContent={<Icon name="Edit" className="h-3.5 w-3.5" />}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="light"
                      color="danger"
                      onPress={() => handleDelete(edu._id)}
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

      {/* Tips */}
      <DashboardCard className="mt-8" icon="Lightbulb" title="Education Tips">
        <ul className="space-y-2 text-[13px] text-muted">
          <li className="flex gap-2">
            <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
            <span>Include <strong className="text-ink">relevant coursework</strong> if it relates to your career</span>
          </li>
          <li className="flex gap-2">
            <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
            <span>Highlight <strong className="text-ink">academic achievements</strong> like honors and awards</span>
          </li>
          <li className="flex gap-2">
            <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
            <span>List most <strong className="text-ink">recent education first</strong></span>
          </li>
        </ul>
      </DashboardCard>
    </div>
  );
}
