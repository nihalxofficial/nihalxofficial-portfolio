"use client";

import { useEffect, useState } from "react";
import { DashboardCard, LoadingState, ErrorState, EmptyState } from "@/components/admin/dashboard-card";
import { Icon } from "@/components/ui/icon";
import { listContent, createContent, updateContent, deleteContent } from "@/lib/admin";
import { CmsSwitch } from "@/components/admin/ui";

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

const inputCls = "w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30";
const labelCls = "block text-[12px] font-medium text-muted";
const btnPrimary = "inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/15 px-4 py-2 text-[13px] font-medium text-accent transition-all hover:bg-accent/25 disabled:opacity-60";
const btnSecondary = "inline-flex items-center gap-2 rounded-lg border border-line bg-surface-2/40 px-4 py-2 text-[13px] font-medium text-muted transition-all hover:border-line-strong hover:text-ink";
const btnIcon = "inline-flex items-center gap-1 rounded-lg border border-transparent px-2 py-1.5 text-[12px] text-muted transition-all hover:border-line hover:bg-surface-2/60 hover:text-accent";
const btnDanger = "inline-flex items-center gap-1 rounded-lg border border-transparent px-2 py-1.5 text-[12px] text-muted transition-all hover:border-danger/30 hover:bg-danger/5 hover:text-danger";

export default function EducationManagerPage() {
  const [education, setEducation] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Education>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadEducation(); }, []);

  async function loadEducation() {
    try {
      setLoading(true); setError(null);
      const result = await listContent("educations");
      setEducation(result.items as unknown as Education[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load education");
    } finally { setLoading(false); }
  }

  async function handleSave() {
    try {
      if (!formData.degree || !formData.institution) { alert("Degree and institution are required"); return; }
      setSaving(true);
      if (editing) {
        await updateContent("educations", editing, formData as Record<string, unknown>);
      } else {
        await createContent("educations", { ...formData, order: education.length, isVisible: true } as Record<string, unknown>);
      }
      await loadEducation();
      setEditing(null); setCreating(false); setFormData({});
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save education");
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure?")) return;
    try { await deleteContent("educations", id); await loadEducation(); }
    catch (err) { alert(err instanceof Error ? err.message : "Failed to delete"); }
  }

  async function toggleVisibility(id: string, currentState: boolean) {
    try {
      await updateContent("educations", id, { isVisible: !currentState });
      setEducation((prev) => prev.map((e) => (e._id === id ? { ...e, isVisible: !currentState } : e)));
    } catch (err) { alert(err instanceof Error ? err.message : "Failed to update"); }
  }

  function startEdit(edu: Education) { setEditing(edu._id); setFormData(edu); setCreating(false); }
  function startCreate() {
    setCreating(true); setEditing(null);
    setFormData({ degree: "", institution: "", field: "", period: "", description: "", highlights: [], icon: "GraduationCap" });
  }
  function cancelEdit() { setEditing(null); setCreating(false); setFormData({}); }

  if (loading) return <div><h1 className="mb-6 text-2xl font-bold text-ink">Education</h1><LoadingState message="Loading education..." /></div>;
  if (error) return <div><h1 className="mb-6 text-2xl font-bold text-ink">Education</h1><ErrorState message={error} retry={loadEducation} /></div>;

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Education</h1>
          <p className="mt-2 text-[14px] text-muted">Manage your academic background and qualifications</p>
        </div>
        <button type="button" onClick={startCreate} className={btnPrimary}>
          <Icon name="Plus" className="h-4 w-4" />Add Education
        </button>
      </div>

      {(creating || editing) && (
        <DashboardCard className="mb-6" icon="Edit" title={editing ? "Edit Education" : "Add Education"}>
          <div className="space-y-4">
            {[
              { label: "Degree", key: "degree", placeholder: "Bachelor of Science, Master's, PhD" },
              { label: "Institution", key: "institution", placeholder: "University of California, MIT" },
              { label: "Field of Study", key: "field", placeholder: "Computer Science, Software Engineering" },
              { label: "Period", key: "period", placeholder: "2015 - 2019" },
              { label: "Icon (Lucide name)", key: "icon", placeholder: "GraduationCap, BookOpen, Award" },
            ].map(({ label, key, placeholder }) => (
              <div key={key} className="space-y-1">
                <label className={labelCls}>{label}</label>
                <input placeholder={placeholder} value={(formData as Record<string, string>)[key] ?? ""} onChange={(e) => setFormData({ ...formData, [key]: e.target.value })} className={inputCls} />
              </div>
            ))}
            <div className="space-y-1">
              <label className={labelCls}>Description</label>
              <textarea placeholder="Brief overview of your studies..." value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} className={inputCls} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Highlights (one per line)</label>
              <textarea placeholder={"GPA: 3.9/4.0\nDean's List\nGraduated with Honors"} value={formData.highlights?.join("\n") || ""} onChange={(e) => setFormData({ ...formData, highlights: e.target.value.split("\n").filter(Boolean) })} rows={6} className={inputCls} />
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

      {education.length === 0 ? (
        <EmptyState icon="GraduationCap" title="No education entries yet" description="Add your academic background" action={<button type="button" onClick={startCreate} className={btnPrimary}>Add Your First Education</button>} />
      ) : (
        <div className="space-y-4">
          {education.sort((a, b) => a.order - b.order).map((edu) => (
            <DashboardCard key={edu._id} hover>
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-gradient-to-br from-accent/15 to-accent/5 text-accent">
                      <Icon name={edu.icon || "GraduationCap"} className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-[15px] text-ink">{edu.degree}</h3>
                      <p className="mt-0.5 text-[13px] text-muted">{edu.institution}</p>
                      {edu.field && <p className="mt-1 text-[12px] text-muted">Field: {edu.field}</p>}
                      <p className="mt-1 text-[12px] text-muted">{edu.period}</p>
                    </div>
                  </div>
                  <CmsSwitch checked={edu.isVisible} onChange={() => void toggleVisibility(edu._id, edu.isVisible)} label="Toggle visibility" size="sm" />
                </div>
                <div className="flex items-center gap-2 border-t border-line/50 pt-3">
                  <button type="button" onClick={() => startEdit(edu)} className={btnIcon}><Icon name="Edit" className="h-3.5 w-3.5" />Edit</button>
                  <button type="button" onClick={() => void handleDelete(edu._id)} className={btnDanger}><Icon name="Trash2" className="h-3.5 w-3.5" />Delete</button>
                </div>
              </div>
            </DashboardCard>
          ))}
        </div>
      )}

      <DashboardCard className="mt-8" icon="Lightbulb" title="Education Tips">
        <ul className="space-y-2 text-[13px] text-muted">
          <li className="flex gap-2"><Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" /><span>Include <strong className="text-ink">relevant coursework</strong> if it relates to your career</span></li>
          <li className="flex gap-2"><Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" /><span>List most <strong className="text-ink">recent education first</strong></span></li>
        </ul>
      </DashboardCard>
    </div>
  );
}
