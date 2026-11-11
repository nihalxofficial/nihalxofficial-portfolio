"use client";

import { useEffect, useState } from "react";
import { DashboardCard, LoadingState, ErrorState, EmptyState } from "@/components/admin/dashboard-card";
import { Icon } from "@/components/ui/icon";
import { listContent, createContent, updateContent, deleteContent } from "@/lib/admin";
import { Input, Switch, TextArea } from "@heroui/react";

interface Statistic {
  _id: string;
  value: string;
  label: string;
  description: string;
  icon: string;
  order: number;
  isVisible: boolean;
}

const inputCls = "w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30";
const labelCls = "block text-[12px] font-medium text-muted";
const btnPrimary = "inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/15 px-4 py-2 text-[13px] font-medium text-accent transition-all hover:bg-accent/25 disabled:opacity-60";
const btnSecondary = "inline-flex items-center gap-2 rounded-lg border border-line bg-surface-2/40 px-4 py-2 text-[13px] font-medium text-muted transition-all hover:border-line-strong hover:text-ink";
const btnGhost = "inline-flex items-center gap-1.5 rounded-lg border border-transparent px-2 py-1.5 text-[12px] font-medium text-muted transition-all hover:border-line hover:bg-surface-2 hover:text-ink";
const btnDanger = "inline-flex items-center gap-1.5 rounded-lg border border-transparent px-2 py-1.5 text-[12px] font-medium text-muted transition-all hover:border-danger/30 hover:bg-danger/5 hover:text-danger";

export default function StatisticsManagerPage() {
  const [stats, setStats] = useState<Statistic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Statistic>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadStats(); }, []);

  async function loadStats() {
    try {
      setLoading(true);
      setError(null);
      const result = await listContent("statistics");
      setStats(result.items as unknown as Statistic[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load statistics");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      if (!formData.value || !formData.label) {
        alert("Value and label are required");
        return;
      }
      setSaving(true);
      if (editing) {
        await updateContent("statistics", editing, formData as unknown as Record<string, unknown>);
      } else {
        await createContent("statistics", { ...formData, order: stats.length, isVisible: true });
      }
      await loadStats();
      setEditing(null);
      setCreating(false);
      setFormData({});
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save statistic");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this statistic?")) return;
    try {
      await deleteContent("statistics", id);
      await loadStats();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete statistic");
    }
  }

  async function toggleVisibility(id: string, currentState: boolean) {
    try {
      await updateContent("statistics", id, { isVisible: !currentState });
      setStats((prev) => prev.map((s) => (s._id === id ? { ...s, isVisible: !currentState } : s)));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update visibility");
    }
  }

  function startEdit(stat: Statistic) { setEditing(stat._id); setFormData(stat); setCreating(false); }
  function startCreate() {
    setCreating(true); setEditing(null);
    setFormData({ value: "", label: "", description: "", icon: "BarChart" });
  }
  function cancelEdit() { setEditing(null); setCreating(false); setFormData({}); }

  if (loading) return <div><h1 className="mb-6 text-2xl font-bold text-ink">Statistics</h1><LoadingState message="Loading statistics..." /></div>;
  if (error) return <div><h1 className="mb-6 text-2xl font-bold text-ink">Statistics</h1><ErrorState message={error} retry={loadStats} /></div>;

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Statistics / Numbers Speak</h1>
          <p className="mt-2 text-[14px] text-muted">Manage your key metrics and achievement numbers</p>
        </div>
        <button type="button" onClick={startCreate} className={btnPrimary}>
          <Icon name="Plus" className="h-4 w-4" /> Add Statistic
        </button>
      </div>

      {(creating || editing) && (
        <DashboardCard className="mb-6" icon="Edit" title={editing ? "Edit Statistic" : "Add Statistic"}>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className={labelCls}>Value</label>
              <Input type="text" className={inputCls} placeholder="5+, 100%, 50K+" value={formData.value || ""}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })} />
              <p className="text-[11px] text-faint">The number or metric to display (e.g., &apos;5+&apos;, &apos;100%&apos;, &apos;50K+&apos;)</p>
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Label</label>
              <Input type="text" className={inputCls} placeholder="Years Experience, Projects Completed" value={formData.label || ""}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Description</label>
              <TextArea rows={3} className={inputCls + " resize-none"} placeholder="Brief description of this metric"
                value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Icon (Lucide name)</label>
              <Input type="text" className={inputCls} placeholder="BarChart, Users, TrendingUp, Award" value={formData.icon || ""}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })} />
              <p className="text-[11px] text-faint">Choose an icon from lucide.dev</p>
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

      {stats.length === 0 ? (
        <EmptyState icon="BarChart" title="No statistics yet" description="Add your first statistic to showcase your achievements"
          action={<button type="button" onClick={startCreate} className={btnPrimary}>Add Your First Statistic</button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.sort((a, b) => a.order - b.order).map((stat) => (
            <DashboardCard key={stat._id} hover>
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-accent/20 bg-gradient-to-br from-accent/15 to-accent/5 text-accent">
                    <Icon name={stat.icon || "BarChart"} className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      isSelected={stat.isVisible}
                      onChange={() => toggleVisibility(stat._id, stat.isVisible)}
                    />
                    <span className="text-[12px] font-medium text-ink">Visible</span>
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-ink">{stat.value}</p>
                  <p className="mt-1 text-[14px] font-semibold text-ink">{stat.label}</p>
                  {stat.description && <p className="mt-1 text-[12px] text-muted line-clamp-2">{stat.description}</p>}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button type="button" onClick={() => startEdit(stat)} className={btnGhost}>
                    <Icon name="Edit" className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button type="button" onClick={() => handleDelete(stat._id)} className={btnDanger}>
                    <Icon name="Trash2" className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            </DashboardCard>
          ))}
        </div>
      )}

      <DashboardCard className="mt-8" icon="Lightbulb" title="Statistics Tips">
        <ul className="space-y-2 text-[13px] text-muted">
          <li className="flex gap-2"><Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" /><span>Use <strong className="text-ink">+ signs</strong> for ongoing counts (e.g., &quot;5+ Years&quot;)</span></li>
          <li className="flex gap-2"><Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" /><span>Keep values <strong className="text-ink">short and impactful</strong> for visual appeal</span></li>
          <li className="flex gap-2"><Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" /><span>Choose <strong className="text-ink">relevant icons</strong> that match your metrics</span></li>
        </ul>
      </DashboardCard>
    </div>
  );
}
