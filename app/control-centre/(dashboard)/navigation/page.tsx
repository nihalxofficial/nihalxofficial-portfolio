"use client";

import { useEffect, useState } from "react";
import { DashboardCard, LoadingState, ErrorState, EmptyState } from "@/components/admin/dashboard-card";
import { Icon } from "@/components/ui/icon";
import { listContent, createContent, updateContent, deleteContent } from "@/lib/admin";
import { Switch, Input, Button } from "@heroui/react";

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
  const [items, setItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      const result = await listContent("navigations");
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
        alert("Label and URL are required");
        return;
      }

      if (editing) {
        await updateContent("navigations", editing, formData);
      } else {
        await createContent("navigations", {
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
      alert(err instanceof Error ? err.message : "Failed to save navigation item");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this navigation item?")) return;

    try {
      await deleteContent("navigations", id);
      await loadNavigation();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete navigation item");
    }
  }

  async function toggleVisibility(id: string, currentState: boolean) {
    try {
      await updateContent("navigations", id, { isVisible: !currentState });
      setItems((prev) =>
        prev.map((item) => (item._id === id ? { ...item, isVisible: !currentState } : item))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update visibility");
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
        <Button
          onPress={startCreate}
          className="bg-gradient-to-r from-accent/20 to-accent/10 text-accent hover:from-accent/30 hover:to-accent/20"
          startContent={<Icon name="Plus" className="h-4 w-4" />}
        >
          Add Link
        </Button>
      </div>

      {/* Create/Edit Form */}
      {(creating || editing) && (
        <DashboardCard className="mb-6" icon="Edit" title={editing ? "Edit Navigation Item" : "Add Navigation Item"}>
          <div className="space-y-4">
            <Input
              label="Label"
              placeholder="e.g., About, Projects, Contact"
              value={formData.label || ""}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            />
            <Input
              label="URL / Href"
              placeholder="e.g., /#about, /projects, https://example.com"
              value={formData.href || ""}
              onChange={(e) => setFormData({ ...formData, href: e.target.value })}
            />
            <Input
              label="Icon (Lucide name)"
              placeholder="e.g., Home, User, Briefcase"
              value={formData.icon || ""}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            />
            
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <Switch
                  size="sm"
                  isSelected={formData.isPrimary || false}
                  onValueChange={(val) => setFormData({ ...formData, isPrimary: val })}
                />
                <span className="text-[13px] text-ink">Primary (show in mobile dock)</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <Switch
                  size="sm"
                  isSelected={formData.opensInNewTab || false}
                  onValueChange={(val) => setFormData({ ...formData, opensInNewTab: val })}
                />
                <span className="text-[13px] text-ink">Open in new tab</span>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onPress={handleSave} color="primary">
                {editing ? "Update" : "Create"}
              </Button>
              <Button onPress={cancelEdit} variant="bordered">
                Cancel
              </Button>
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
            <Button onPress={startCreate} color="primary">
              Add Navigation Link
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {items
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
                    <Switch
                      size="sm"
                      isSelected={item.isVisible}
                      onValueChange={() => toggleVisibility(item._id, item.isVisible)}
                      aria-label="Toggle visibility"
                    />
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => startEdit(item)}
                      aria-label="Edit"
                    >
                      <Icon name="Edit" className="h-4 w-4" />
                    </Button>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="danger"
                      onPress={() => handleDelete(item._id)}
                      aria-label="Delete"
                    >
                      <Icon name="Trash2" className="h-4 w-4" />
                    </Button>
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
