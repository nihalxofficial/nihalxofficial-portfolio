"use client";

import { useEffect, useState } from "react";
import { DashboardCard, LoadingState, ErrorState, EmptyState } from "@/components/admin/dashboard-card";
import { Icon } from "@/components/ui/icon";
import { listContent, createContent, updateContent, deleteContent } from "@/lib/admin";
import { Input, Button, Switch } from "@heroui/react";

interface Certification {
  _id: string;
  title: string;
  issuer: string;
  year: string;
  credentialUrl: string;
  icon: string;
  accentColor: string;
  order: number;
  isVisible: boolean;
}

export default function CertificationsManagerPage() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Certification>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCertifications();
  }, []);

  async function loadCertifications() {
    try {
      setLoading(true);
      setError(null);
      const result = await listContent("certifications");
      setCertifications(result.items as unknown as Certification[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load certifications");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      if (!formData.title || !formData.issuer) {
        alert("Title and issuer are required");
        return;
      }

      setSaving(true);

      if (editing) {
        await updateContent("certifications", editing, formData);
      } else {
        await createContent("certifications", {
          ...formData,
          order: certifications.length,
          isVisible: true,
        });
      }

      await loadCertifications();
      setEditing(null);
      setCreating(false);
      setFormData({});
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save certification");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this certification?")) return;

    try {
      await deleteContent("certifications", id);
      await loadCertifications();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete certification");
    }
  }

  async function toggleVisibility(id: string, currentState: boolean) {
    try {
      await updateContent("certifications", id, { isVisible: !currentState });
      setCertifications((prev) =>
        prev.map((cert) => (cert._id === id ? { ...cert, isVisible: !currentState } : cert))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update visibility");
    }
  }

  function startEdit(cert: Certification) {
    setEditing(cert._id);
    setFormData(cert);
    setCreating(false);
  }

  function startCreate() {
    setCreating(true);
    setEditing(null);
    setFormData({
      title: "",
      issuer: "",
      year: new Date().getFullYear().toString(),
      credentialUrl: "",
      icon: "Award",
      accentColor: "hsl(189 100% 50%)",
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
        <h1 className="mb-6 text-2xl font-bold text-ink">Certifications</h1>
        <LoadingState message="Loading certifications..." />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-ink">Certifications</h1>
        <ErrorState message={error} retry={loadCertifications} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Certifications</h1>
          <p className="mt-2 text-[14px] text-muted">
            Manage your professional certifications and credentials
          </p>
        </div>
        <Button
          onPress={startCreate}
          color="primary"
          startContent={<Icon name="Plus" className="h-4 w-4" />}
        >
          Add Certification
        </Button>
      </div>

      {/* Create/Edit Form */}
      {(creating || editing) && (
        <DashboardCard className="mb-6" icon="Edit" title={editing ? "Edit Certification" : "Add Certification"}>
          <div className="space-y-4">
            <Input
              label="Title"
              placeholder="AWS Certified Solutions Architect, Google Cloud Professional"
              value={formData.title || ""}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />

            <Input
              label="Issuer"
              placeholder="Amazon Web Services, Google, Microsoft"
              value={formData.issuer || ""}
              onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
            />

            <Input
              label="Year"
              placeholder="2024"
              type="number"
              value={formData.year || ""}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            />

            <Input
              label="Credential URL (optional)"
              placeholder="https://www.credly.com/badges/..."
              description="Link to verify the certification"
              value={formData.credentialUrl || ""}
              onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
            />

            <Input
              label="Icon (Lucide name)"
              placeholder="Award, Badge, CheckCircle, Shield"
              value={formData.icon || ""}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            />

            <div className="space-y-2">
              <label className="text-[13px] font-medium text-ink">Accent Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.accentColor || "#00BFFF"}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className="h-10 w-20 cursor-pointer rounded-lg border border-line"
                />
                <Input
                  placeholder="hsl(189 100% 50%) or #00BFFF"
                  value={formData.accentColor || ""}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className="flex-1"
                />
              </div>
              <p className="text-[12px] text-muted">
                Color used for the certification badge
              </p>
            </div>

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

      {/* Certifications Grid */}
      {certifications.length === 0 ? (
        <EmptyState
          icon="Award"
          title="No certifications yet"
          description="Add your first certification to showcase your professional credentials"
          action={
            <Button onPress={startCreate} color="primary">
              Add Your First Certification
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certifications
            .sort((a, b) => a.order - b.order)
            .map((cert) => (
              <DashboardCard key={cert._id} hover>
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-lg border"
                      style={{
                        backgroundColor: `${cert.accentColor}15`,
                        borderColor: `${cert.accentColor}30`,
                        color: cert.accentColor,
                      }}
                    >
                      <Icon name={cert.icon || "Award"} className="h-6 w-6" />
                    </div>
                    <Switch
                      size="sm"
                      isSelected={cert.isVisible}
                      onValueChange={() => toggleVisibility(cert._id, cert.isVisible)}
                      aria-label="Toggle visibility"
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="font-semibold text-[14px] text-ink line-clamp-2">
                      {cert.title}
                    </h3>
                    <p className="mt-1 text-[12px] text-muted">{cert.issuer}</p>
                    <p className="mt-0.5 text-[11px] text-muted">Year: {cert.year}</p>
                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-[11px] text-accent hover:underline"
                      >
                        <Icon name="ExternalLink" className="h-3 w-3" />
                        <span>View Credential</span>
                      </a>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 border-t border-line/50 pt-3">
                    <Button
                      size="sm"
                      variant="light"
                      onPress={() => startEdit(cert)}
                      startContent={<Icon name="Edit" className="h-3.5 w-3.5" />}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="light"
                      color="danger"
                      onPress={() => handleDelete(cert._id)}
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
      <DashboardCard className="mt-8" icon="Lightbulb" title="Certification Tips">
        <ul className="space-y-2 text-[13px] text-muted">
          <li className="flex gap-2">
            <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
            <span>Include <strong className="text-ink">credential URLs</strong> for verification</span>
          </li>
          <li className="flex gap-2">
            <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
            <span>Use <strong className="text-ink">brand colors</strong> matching the issuing organization</span>
          </li>
          <li className="flex gap-2">
            <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
            <span>List <strong className="text-ink">most recent certifications</strong> first</span>
          </li>
        </ul>
      </DashboardCard>
    </div>
  );
}
