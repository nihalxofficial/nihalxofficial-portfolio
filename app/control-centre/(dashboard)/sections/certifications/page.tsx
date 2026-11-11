"use client";

import { useEffect, useState } from "react";
import { DashboardCard, LoadingState, ErrorState, EmptyState } from "@/components/admin/dashboard-card";
import { Icon } from "@/components/ui/icon";
import { listContent, createContent, updateContent, deleteContent } from "@/lib/admin";
import { Input, Switch } from "@heroui/react";

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

const inputCls = "w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30";
const labelCls = "block text-[12px] font-medium text-muted";
const btnPrimary = "inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/15 px-4 py-2 text-[13px] font-medium text-accent transition-all hover:bg-accent/25 disabled:opacity-60";
const btnSecondary = "inline-flex items-center gap-2 rounded-lg border border-line bg-surface-2/40 px-4 py-2 text-[13px] font-medium text-muted transition-all hover:border-line-strong hover:text-ink";
const btnIcon = "inline-flex items-center rounded-lg border border-transparent p-1.5 text-muted transition-all hover:border-line hover:bg-surface-2/60 hover:text-accent";
const btnDanger = "inline-flex items-center gap-1.5 rounded-lg border border-transparent px-2 py-1.5 text-[12px] font-medium text-muted transition-all hover:border-danger/30 hover:bg-danger/5 hover:text-danger";

export default function CertificationsManagerPage() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Certification>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadCertifications(); }, []);

  async function loadCertifications() {
    try {
      setLoading(true); setError(null);
      const result = await listContent("certifications");
      setCertifications(result.items as unknown as Certification[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load certifications");
    } finally { setLoading(false); }
  }

  async function handleSave() {
    try {
      if (!formData.title || !formData.issuer) { alert("Title and issuer are required"); return; }
      setSaving(true);
      if (editing) {
        await updateContent("certifications", editing, formData as Record<string, unknown>);
      } else {
        await createContent("certifications", { ...formData, order: certifications.length, isVisible: true } as Record<string, unknown>);
      }
      await loadCertifications();
      setEditing(null); setCreating(false); setFormData({});
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save certification");
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure?")) return;
    try { await deleteContent("certifications", id); await loadCertifications(); }
    catch (err) { alert(err instanceof Error ? err.message : "Failed to delete"); }
  }

  async function toggleVisibility(id: string, currentState: boolean) {
    try {
      await updateContent("certifications", id, { isVisible: !currentState });
      setCertifications((prev) => prev.map((c) => (c._id === id ? { ...c, isVisible: !currentState } : c)));
    } catch (err) { alert(err instanceof Error ? err.message : "Failed to update"); }
  }

  function startEdit(cert: Certification) { setEditing(cert._id); setFormData(cert); setCreating(false); }
  function startCreate() {
    setCreating(true); setEditing(null);
    setFormData({ title: "", issuer: "", year: new Date().getFullYear().toString(), credentialUrl: "", icon: "Award", accentColor: "hsl(189 100% 50%)" });
  }
  function cancelEdit() { setEditing(null); setCreating(false); setFormData({}); }

  if (loading) return <div><h1 className="mb-6 text-2xl font-bold text-ink">Certifications</h1><LoadingState message="Loading certifications..." /></div>;
  if (error) return <div><h1 className="mb-6 text-2xl font-bold text-ink">Certifications</h1><ErrorState message={error} retry={loadCertifications} /></div>;

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Certifications</h1>
          <p className="mt-2 text-[14px] text-muted">Manage your professional certifications and credentials</p>
        </div>
        <button type="button" onClick={startCreate} className={btnPrimary}>
          <Icon name="Plus" className="h-4 w-4" />Add Certification
        </button>
      </div>

      {(creating || editing) && (
        <DashboardCard className="mb-6" icon="Edit" title={editing ? "Edit Certification" : "Add Certification"}>
          <div className="space-y-4">
            {[
              { label: "Title", key: "title", placeholder: "AWS Certified Solutions Architect" },
              { label: "Issuer", key: "issuer", placeholder: "Amazon Web Services" },
              { label: "Year", key: "year", placeholder: "2024", type: "number" },
              { label: "Credential URL (optional)", key: "credentialUrl", placeholder: "https://www.credly.com/badges/..." },
              { label: "Icon (Lucide name)", key: "icon", placeholder: "Award, Badge, Shield" },
            ].map(({ label, key, placeholder, type }) => (
              <div key={key} className="space-y-1">
                <label className={labelCls}>{label}</label>
                <Input
                  type={type ?? "text"}
                  placeholder={placeholder}
                  value={(formData as Record<string, string>)[key] ?? ""}
                  onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                  className={inputCls}
                />
              </div>
            ))}
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-ink">Accent Color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={formData.accentColor || "#00BFFF"} onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })} className="h-10 w-20 cursor-pointer rounded-lg border border-line" />
                <Input
                  placeholder="hsl(189 100% 50%) or #00BFFF"
                  value={formData.accentColor || ""}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className={`${inputCls} flex-1`}
/>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => void handleSave()} disabled={saving} className={btnPrimary}>
                {saving && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />}
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </button>
              <button type="button" onClick={cancelEdit} className={btnSecondary}>Cancel</button>
            </div>
          </div>
        </DashboardCard>
      )}

      {certifications.length === 0 ? (
        <EmptyState icon="Award" title="No certifications yet" description="Add your first certification" action={<button type="button" onClick={startCreate} className={btnPrimary}>Add Your First Certification</button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certifications.sort((a, b) => a.order - b.order).map((cert) => (
            <DashboardCard key={cert._id} hover>
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border" style={{ backgroundColor: `${cert.accentColor}15`, borderColor: `${cert.accentColor}30`, color: cert.accentColor }}>
                    <Icon name={cert.icon || "Award"} className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      isSelected={cert.isVisible}
                      onChange={() => toggleVisibility(cert._id, cert.isVisible)}
                    />
                    <span className="text-[12px] font-medium text-ink">Toggle visibility</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-[14px] text-ink line-clamp-2">{cert.title}</h3>
                  <p className="mt-1 text-[12px] text-muted">{cert.issuer}</p>
                  <p className="mt-0.5 text-[11px] text-muted">Year: {cert.year}</p>
                  {cert.credentialUrl && (
                    <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-[11px] text-accent hover:underline">
                      <Icon name="ExternalLink" className="h-3 w-3" /><span>View Credential</span>
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2 border-t border-line/50 pt-3">
                  <button type="button" onClick={() => startEdit(cert)} className={btnIcon}><Icon name="Edit" className="h-3.5 w-3.5" /><span className="ml-1 text-[12px]">Edit</span></button>
                  <button type="button" onClick={() => void handleDelete(cert._id)} className={btnDanger}><Icon name="Trash2" className="h-3.5 w-3.5" />Delete</button>
                </div>
              </div>
            </DashboardCard>
          ))}
        </div>
      )}

      <DashboardCard className="mt-8" icon="Lightbulb" title="Certification Tips">
        <ul className="space-y-2 text-[13px] text-muted">
          <li className="flex gap-2"><Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" /><span>Include <strong className="text-ink">credential URLs</strong> for verification</span></li>
          <li className="flex gap-2"><Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" /><span>Use <strong className="text-ink">brand colors</strong> matching the issuing organization</span></li>
        </ul>
      </DashboardCard>
    </div>
  );
}
