"use client";

import { useEffect, useState } from "react";
import { DashboardCard, LoadingState, ErrorState, EmptyState } from "@/components/admin/dashboard-card";
import { Icon } from "@/components/ui/icon";
import { listContent, createContent, updateContent, deleteContent } from "@/lib/admin";
import { Input, Switch, TextArea } from "@heroui/react";
import { useConfirm } from "@/components/admin/ui";

interface Testimonial {
  _id: string;
  name: string;
  role: string;
  message: string;
  rating: number;
  avatarUrl: string;
  order: number;
  isVisible: boolean;
}

const inputCls = "w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30";
const labelCls = "block text-[12px] font-medium text-muted";
const btnPrimary = "inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/15 px-4 py-2 text-[13px] font-medium text-accent transition-all hover:bg-accent/25 disabled:opacity-60";
const btnSecondary = "inline-flex items-center gap-2 rounded-lg border border-line bg-surface-2/40 px-4 py-2 text-[13px] font-medium text-muted transition-all hover:border-line-strong hover:text-ink";
const btnGhost = "inline-flex items-center gap-1.5 rounded-lg border border-transparent px-2 py-1.5 text-[12px] font-medium text-muted transition-all hover:border-line hover:bg-surface-2 hover:text-ink";
const btnDanger = "inline-flex items-center gap-1.5 rounded-lg border border-transparent px-2 py-1.5 text-[12px] font-medium text-muted transition-all hover:border-danger/30 hover:bg-danger/5 hover:text-danger";

export default function TestimonialsManagerPage() {
  const confirm = useConfirm();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Testimonial>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadTestimonials(); }, []);

  async function loadTestimonials() {
    try {
      setLoading(true); setError(null);
      const result = await listContent("testimonials");
      setTestimonials(result.items as unknown as Testimonial[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load testimonials");
    } finally { setLoading(false); }
  }

  async function handleSave() {
    try {
      if (!formData.name || !formData.message) {
        setActionError("Name and message are required");
        return;
      }
      setSaving(true);
      setActionError(null);
      if (editing) {
        await updateContent("testimonials", editing, formData as unknown as Record<string, unknown>);
      } else {
        await createContent("testimonials", { ...formData, order: testimonials.length, isVisible: true });
      }
      await loadTestimonials(); setEditing(null); setCreating(false); setFormData({});
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to save testimonial");
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    const ok = await confirm({
      title: "Delete testimonial?",
      message: "Are you sure you want to delete this testimonial? This cannot be undone.",
      confirmLabel: "Delete",
      status: "danger",
    });
    if (!ok) return;
    try { await deleteContent("testimonials", id); await loadTestimonials(); }
    catch (err) { setActionError(err instanceof Error ? err.message : "Failed to delete testimonial"); }
  }

  async function toggleVisibility(id: string, currentState: boolean) {
    try {
      await updateContent("testimonials", id, { isVisible: !currentState });
      setTestimonials((prev) => prev.map((t) => (t._id === id ? { ...t, isVisible: !currentState } : t)));
    } catch (err) { setActionError(err instanceof Error ? err.message : "Failed to update visibility"); }
  }

  function startEdit(test: Testimonial) { setEditing(test._id); setFormData(test); setCreating(false); }
  function startCreate() { setCreating(true); setEditing(null); setFormData({ name: "", role: "", message: "", rating: 5, avatarUrl: "" }); }
  function cancelEdit() { setEditing(null); setCreating(false); setFormData({}); }

  function renderStars(rating: number, interactive = false) {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} type="button" onClick={() => interactive && setFormData({ ...formData, rating: star })}
            className={`${interactive ? "cursor-pointer hover:scale-110" : ""} transition-transform`} disabled={!interactive}>
            <Icon name="Star" className={`h-5 w-5 ${star <= rating ? "fill-yellow-500 text-yellow-500" : "text-muted"}`} />
          </button>
        ))}
      </div>
    );
  }

  if (loading) return <div><h1 className="mb-6 text-2xl font-bold text-ink">Testimonials</h1><LoadingState message="Loading testimonials..." /></div>;
  if (error) return <div><h1 className="mb-6 text-2xl font-bold text-ink">Testimonials</h1><ErrorState message={error} retry={loadTestimonials} /></div>;

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Testimonials</h1>
          <p className="mt-2 text-[14px] text-muted">Manage client testimonials and reviews</p>
        </div>
        <button type="button" onClick={startCreate} className={btnPrimary}>
          <Icon name="Plus" className="h-4 w-4" /> Add Testimonial
        </button>
      </div>

      {actionError && (
        <p className="mb-6 rounded-xl border border-danger/30 bg-danger/10 px-4 py-2.5 text-[12.5px] text-danger">
          {actionError}
        </p>
      )}

      {(creating || editing) && (
        <DashboardCard className="mb-6" icon="Edit" title={editing ? "Edit Testimonial" : "Add Testimonial"}>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className={labelCls}>Name</label>
              <Input type="text" className={inputCls} placeholder="John Smith" value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Role / Company</label>
              <Input type="text" className={inputCls} placeholder="CEO at Acme Corp, Project Manager" value={formData.role || ""}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Testimonial Message</label>
              <TextArea rows={5} className={inputCls + " resize-y"} placeholder="Working with [Your Name] was an absolute pleasure..."
                value={formData.message || ""} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
              <p className="text-[11px] text-faint">{(formData.message || "").length} characters</p>
            </div>
            <div className="space-y-2">
              <label className={labelCls}>Rating</label>
              {renderStars(formData.rating || 5, true)}
              <p className="text-[12px] text-muted">Click stars to set rating (currently {formData.rating || 5}/5)</p>
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Avatar URL (optional)</label>
              <Input type="text" className={inputCls} placeholder="https://i.ibb.co/..." value={formData.avatarUrl || ""}
                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })} />
              <p className="text-[11px] text-faint">Upload via Media Library and paste URL here</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={handleSave} disabled={saving} className={btnPrimary}>
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </button>
              <button type="button" onClick={cancelEdit} className={btnSecondary}>Cancel</button>
            </div>
          </div>
        </DashboardCard>
      )}

      {testimonials.length === 0 ? (
        <EmptyState icon="MessageSquare" title="No testimonials yet" description="Add your first testimonial to showcase client feedback"
          action={<button type="button" onClick={startCreate} className={btnPrimary}>Add Your First Testimonial</button>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {[...testimonials].sort((a, b) => a.order - b.order).map((test) => (
            <DashboardCard key={test._id} hover>
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent/20 bg-gradient-to-br from-accent/15 to-accent/5 text-accent font-semibold text-[14px]">
                      {test.avatarUrl ? (
                        <img src={test.avatarUrl} alt={test.name} className="h-full w-full rounded-full object-cover" />
                      ) : (
                        test.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-[14px] text-ink">{test.name}</h3>
                      <p className="mt-0.5 text-[12px] text-muted">{test.role}</p>
                      <div className="mt-2">{renderStars(test.rating)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                      <Switch
                        isSelected={test.isVisible}
                        onChange={() => toggleVisibility(test._id, test.isVisible)}
                      />
                      <span className="text-[12px] font-medium text-ink">Visible</span>
                    </div>
                </div>
                <p className="text-[13px] text-muted line-clamp-3 italic">&quot;{test.message}&quot;</p>
                <div className="flex items-center gap-2 border-t border-line/50 pt-3">
                  <button type="button" onClick={() => startEdit(test)} className={btnGhost}>
                    <Icon name="Pencil" className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button type="button" onClick={() => handleDelete(test._id)} className={btnDanger}>
                    <Icon name="Trash2" className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            </DashboardCard>
          ))}
        </div>
      )}

      <DashboardCard className="mt-8" icon="Lightbulb" title="Testimonial Tips">
        <ul className="space-y-2 text-[13px] text-muted">
          <li className="flex gap-2"><Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" /><span><strong className="text-ink">Authentic testimonials</strong> are more impactful than generic ones</span></li>
          <li className="flex gap-2"><Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" /><span>Include <strong className="text-ink">specific details</strong> about the project or collaboration</span></li>
          <li className="flex gap-2"><Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" /><span>Add <strong className="text-ink">avatars</strong> to make testimonials more personal</span></li>
          <li className="flex gap-2"><Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" /><span>Keep messages <strong className="text-ink">concise</strong> (150-300 characters ideal)</span></li>
        </ul>
      </DashboardCard>
    </div>
  );
}
