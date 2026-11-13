"use client";

import { useEffect, useState } from "react";
import { DashboardCard, LoadingState, ErrorState, EmptyState } from "@/components/admin/dashboard-card";
import { Icon } from "@/components/ui/icon";
import { listContent, createContent, updateContent, deleteContent } from "@/lib/admin";
import { Input, Switch } from "@heroui/react";
import { FormAlert, useConfirm } from "@/components/admin/ui";

interface NavItem {
  _id: string;
  label: string;
  href: string;
  icon?: string;
  isPrimary?: boolean;
  opensInNewTab?: boolean;
  order: number;
  isVisible: boolean;
}

export default function NavigationManagerPage() {
  const confirm = useConfirm();
  const [items, setItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<NavItem>>({});

  useEffect(() => {
    loadNavigation();
  }, []);

  async function loadNavigation() {
    try {
      setLoading(true);
      setError(null);
      const result = await listContent("navigation");
      setItems(result.items as unknown as NavItem[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load navigation");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      if (!formData.label || !formData.href) {
        setActionError("Label and URL are required");
        return;
      }

      setActionError(null);
      if (editing) {
        await updateContent("navigation", editing, formData);
      } else {
        await createContent("navigation", {
          ...formData,
          order: items.length,
          isVisible: true,
        });
      }

      await loadNavigation();
      setEditing(null);
      setCreating(false);
      setFormData({});
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to save navigation item");
    }
  }

  async function handleDelete(id: string) {
    const ok = await confirm({
      title: "Delete navigation item?",
      message: "Are you sure you want to delete this navigation item? This cannot be undone.",
      confirmLabel: "Delete",
      status: "danger",
    });
    if (!ok) return;

    try {
      await deleteContent("navigation", id);
      await loadNavigation();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to delete navigation item");
    }
  }

  async function toggleVisibility(id: string, currentState: boolean) {
    try {
      await updateContent("navigation", id, { isVisible: !currentState });
      setItems((prev) =>
        prev.map((item) => (item._id === id ? { ...item, isVisible: !currentState } : item))
      );
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to update visibility");
    }
  }

  function startEdit(item: NavItem) {
    setEditing(item._id);
    setFormData(item);
    setCreating(false);
  }

  function startCreate() {
    setCreating(true);
    setEditing(null);
    setFormData({
      label: "",
      href: "",
      icon: "Link",
      isPrimary: false,
      opensInNewTab: false,
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
        <h1 className="mb-6 text-2xl font-bold text-ink">Navigation Manager</h1>
        <LoadingState message="Loading navigation..." />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-ink">Navigation Manager</h1>
        <ErrorState message={error} retry={loadNavigation} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Navigation Manager</h1>
          <p className="mt-2 text-[14px] text-muted">
            Manage your website navigation links and menu items
          </p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/15 px-4 py-2 text-[13px] font-medium text-accent transition-all hover:bg-accent/25"
        >
          <Icon name="Plus" className="h-4 w-4" />
          Add Link
        </button>
      </div>

      {/* Action Error Banner */}
      {actionError && <FormAlert message={actionError} className="mb-6" />}

      {/* Create/Edit Form */}
      {(creating || editing) && (
        <DashboardCard className="mb-6" icon="Edit" title={editing ? "Edit Navigation Item" : "Add Navigation Item"}>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[12px] font-medium text-muted">Label</label>
              <Input
                placeholder="e.g., About, Projects, Contact"
                value={formData.label || ""}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[12px] font-medium text-muted">URL / Href</label>
              <Input
                placeholder="e.g., /#about, /projects, https://example.com"
                value={formData.href || ""}
                onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                className="w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[12px] font-medium text-muted">Icon (Lucide name)</label>
              <Input
                placeholder="e.g., Home, User, Briefcase"
                value={formData.icon || ""}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Switch
                    isSelected={formData.isPrimary || false}
                    onChange={(val) => setFormData({ ...formData, isPrimary: val })}
                  />
                  <span className="text-[13px] text-ink">Primary (show in mobile dock)</span>
                </div>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Switch
                    isSelected={formData.opensInNewTab || false}
                    onChange={(val) => setFormData({ ...formData, opensInNewTab: val })}
                  />
                  <span className="text-[13px] text-ink">Open in new tab</span>
                </div>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => void handleSave()}
                className="inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/15 px-4 py-2 text-[13px] font-medium text-accent transition-all hover:bg-accent/25"
              >
                {editing ? "Update" : "Create"}
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

      {/* Navigation Items */}
      {items.length === 0 ? (
        <EmptyState
          icon="Navigation"
          title="No navigation items"
          description="Create your first navigation link to get started"
          action={
            <button
              type="button"
              onClick={startCreate}
              className="inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/15 px-4 py-2 text-[13px] font-medium text-accent transition-all hover:bg-accent/25"
            >
              <Icon name="Plus" className="h-4 w-4" />
              Add Navigation Link
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {[...items]
            .sort((a, b) => a.order - b.order)
            .map((item) => (
              <DashboardCard key={item._id} hover>
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-gradient-to-br from-accent/15 to-accent/5 text-accent">
                    <Icon name={item.icon || "Link"} className="h-5 w-5" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[14px] text-ink">{item.label}</h3>
                      {item.isPrimary && (
                        <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent ring-1 ring-accent/20">
                          PRIMARY
                        </span>
                      )}
                      {item.opensInNewTab && (
                        <Icon name="ExternalLink" className="h-3.5 w-3.5 text-muted" />
                      )}
                    </div>
                    <p className="mt-0.5 text-[12px] text-muted truncate">{item.href}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <Switch
                        isSelected={item.isVisible}
                        onChange={() => toggleVisibility(item._id, item.isVisible)}
                      />
                      <span className="text-[12px] font-medium text-ink">Visible</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      className="inline-flex items-center rounded-lg border border-transparent p-1.5 text-muted transition-all hover:border-line hover:bg-surface-2/60 hover:text-accent"
                    >
                      <Icon name="Pencil" className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(item._id)}
                      className="inline-flex items-center rounded-lg border border-transparent p-1.5 text-muted transition-all hover:border-danger/30 hover:bg-danger/5 hover:text-danger"
                    >
                      <Icon name="Trash2" className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </DashboardCard>
            ))}
        </div>
      )}

      {/* Info */}
      <DashboardCard className="mt-8" icon="Info" title="Navigation Tips">
        <ul className="space-y-2 text-[13px] text-muted">
          <li className="flex gap-2">
            <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
            <span><strong className="text-ink">Internal links</strong> start with / or # (e.g., /#about, /projects)</span>
          </li>
          <li className="flex gap-2">
            <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
            <span><strong className="text-ink">External links</strong> include the full URL (e.g., https://github.com)</span>
          </li>
          <li className="flex gap-2">
            <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
            <span><strong className="text-ink">Primary links</strong> appear in the mobile dock navigation</span>
          </li>
          <li className="flex gap-2">
            <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
            <span>Use <strong className="text-ink">Lucide icon names</strong> for consistent styling (Home, User, Mail, etc.)</span>
          </li>
        </ul>
      </DashboardCard>
    </div>
  );
}
