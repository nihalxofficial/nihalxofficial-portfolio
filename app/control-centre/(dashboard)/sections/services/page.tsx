"use client";

import { useEffect, useState } from "react";
import { DashboardCard, LoadingState, ErrorState, EmptyState } from "@/components/admin/dashboard-card";
import { Icon } from "@/components/ui/icon";
import { listContent, createContent, updateContent, deleteContent } from "@/lib/admin";
import { Input, Switch, TextArea } from "@heroui/react";
import { useConfirm } from "@/components/admin/ui";

interface Service {
  _id: string;
  title: string;
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

export default function ServicesManagerPage() {
  const confirm = useConfirm();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Service>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    try {
      setLoading(true);
      setError(null);
      const result = await listContent("services");
      setServices(result.items as unknown as Service[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load services");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      if (!formData.title || !formData.description) {
        alert("Title and description are required");
        return;
      }
      setSaving(true);
      if (editing) {
        await updateContent("services", editing, formData as unknown as Record<string, unknown>);
      } else {
        await createContent("services", {
          ...formData,
          order: services.length,
          isVisible: true,
        });
      }
      await loadServices();
      setEditing(null);
      setCreating(false);
      setFormData({});
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save service");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const ok = await confirm({
      title: "Delete service?",
      message: "Are you sure you want to delete this service? This cannot be undone.",
      confirmLabel: "Delete",
      status: "danger",
    });
    if (!ok) return;
    try {
      await deleteContent("services", id);
      await loadServices();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete service");
    }
  }

  async function toggleVisibility(id: string, currentState: boolean) {
    try {
      await updateContent("services", id, { isVisible: !currentState });
      setServices((prev) =>
        prev.map((service) => (service._id === id ? { ...service, isVisible: !currentState } : service))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update visibility");
    }
  }

  function startEdit(service: Service) {
    setEditing(service._id);
    setFormData(service);
    setCreating(false);
  }

  function startCreate() {
    setCreating(true);
    setEditing(null);
    setFormData({ title: "", description: "", icon: "Briefcase" });
  }

  function cancelEdit() {
    setEditing(null);
    setCreating(false);
    setFormData({});
  }

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-ink">Services</h1>
        <LoadingState message="Loading services..." />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-ink">Services</h1>
        <ErrorState message={error} retry={loadServices} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Services</h1>
          <p className="mt-2 text-[14px] text-muted">
            Manage your service offerings and expertise areas
          </p>
        </div>
        <button type="button" onClick={startCreate} className={btnPrimary}>
          <Icon name="Plus" className="h-4 w-4" />
          Add Service
        </button>
      </div>

      {/* Create/Edit Form */}
      {(creating || editing) && (
        <DashboardCard className="mb-6" icon="Edit" title={editing ? "Edit Service" : "Add Service"}>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className={labelCls}>Title</label>
              <Input
                className={inputCls}
                placeholder="Full-Stack Development, API Design, DevOps"
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Description</label>
              <TextArea
                rows={6}
                className={inputCls + " resize-y"}
                placeholder="Detailed description of this service..."
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Icon (Lucide name)</label>
              <Input
                className={inputCls}
                placeholder="Code, Database, Cloud, Shield"
                value={formData.icon || ""}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              />
              <p className="text-[11px] text-faint">Choose an icon from lucide.dev</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={handleSave} disabled={saving} className={btnPrimary}>
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </button>
              <button type="button" onClick={cancelEdit} className={btnSecondary}>
                Cancel
              </button>
            </div>
          </div>
        </DashboardCard>
      )}

      {/* Services List */}
      {services.length === 0 ? (
        <EmptyState
          icon="Briefcase"
          title="No services yet"
          description="Add your first service to showcase what you offer"
          action={
            <button type="button" onClick={startCreate} className={btnPrimary}>
              Add Your First Service
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {[...services]
            .sort((a, b) => a.order - b.order)
            .map((service) => (
              <DashboardCard key={service._id} hover>
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-gradient-to-br from-accent/15 to-accent/5 text-accent">
                        <Icon name={service.icon || "Briefcase"} className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-[15px] text-ink">{service.title}</h3>
                        <p className="mt-2 text-[13px] text-muted line-clamp-3">
                          {service.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        isSelected={service.isVisible}
                        onChange={() => toggleVisibility(service._id, service.isVisible)}
                      />
                      <span className="text-[12px] font-medium text-ink">Visible</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 border-t border-line/50 pt-3">
                    <button type="button" onClick={() => startEdit(service)} className={btnGhost}>
                      <Icon name="Pencil" className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button type="button" onClick={() => handleDelete(service._id)} className={btnDanger}>
                      <Icon name="Trash2" className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </DashboardCard>
            ))}
        </div>
      )}

      {/* Tips */}
      <DashboardCard className="mt-8" icon="Lightbulb" title="Service Tips">
        <ul className="space-y-2 text-[13px] text-muted">
          <li className="flex gap-2">
            <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
            <span><strong className="text-ink">Be specific</strong> about what each service includes</span>
          </li>
          <li className="flex gap-2">
            <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
            <span><strong className="text-ink">Highlight benefits</strong> rather than just technical details</span>
          </li>
          <li className="flex gap-2">
            <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
            <span>Use <strong className="text-ink">relevant icons</strong> that represent each service area</span>
          </li>
          <li className="flex gap-2">
            <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
            <span>Keep descriptions <strong className="text-ink">concise but informative</strong></span>
          </li>
        </ul>
      </DashboardCard>
    </div>
  );
}
