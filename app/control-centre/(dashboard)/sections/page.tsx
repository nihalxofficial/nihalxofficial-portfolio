"use client";

import { useEffect, useState } from "react";
import { DashboardCard, LoadingState, ErrorState, EmptyState } from "@/components/admin/dashboard-card";
import { Icon } from "@/components/ui/icon";
import { listContent, createContent, updateContent, deleteContent } from "@/lib/admin";
import { Input, Switch, TextArea } from "@heroui/react";
import { useConfirm } from "@/components/admin/ui";

export interface SectionRecord {
  _id: string;
  key: string;
  label?: string;
  heading?: string;
  description?: string;
  items?: string[];
  order?: number;
  isVisible?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const inputCls =
  "w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30";
const labelCls = "block text-[12px] font-medium text-muted";
const btnPrimary =
  "inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/15 px-4 py-2 text-[13px] font-medium text-accent transition-all hover:bg-accent/25 disabled:opacity-60";
const btnSecondary =
  "inline-flex items-center gap-2 rounded-lg border border-line bg-surface-2/40 px-4 py-2 text-[13px] font-medium text-muted transition-all hover:border-line-strong hover:text-ink";
const btnGhost =
  "inline-flex items-center gap-1.5 rounded-lg border border-transparent px-2 py-1.5 text-[12px] font-medium text-muted transition-all hover:border-line hover:bg-surface-2 hover:text-ink";
const btnDanger =
  "inline-flex items-center gap-1.5 rounded-lg border border-transparent px-2 py-1.5 text-[12px] font-medium text-muted transition-all hover:border-danger/30 hover:bg-danger/5 hover:text-danger";

export default function SectionsManagerPage() {
  const confirm = useConfirm();
  const [sections, setSections] = useState<SectionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Section create / edit state
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<SectionRecord>>({});
  const [formItems, setFormItems] = useState<string[]>([]);
  const [newFormItemInput, setNewFormItemInput] = useState("");
  const [saving, setSaving] = useState(false);

  // Quick-add item state for existing sections
  const [quickItemInputs, setQuickItemInputs] = useState<Record<string, string>>({});
  const [savingItemId, setSavingItemId] = useState<string | null>(null);

  useEffect(() => {
    void loadSections();
  }, []);

  async function loadSections() {
    try {
      setLoading(true);
      setError(null);
      const result = await listContent("sections", { limit: 100 });
      setSections(result.items as unknown as SectionRecord[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sections");
    } finally {
      setLoading(false);
    }
  }

  function startCreate() {
    setCreating(true);
    setEditingId(null);
    setFormData({
      key: "",
      label: "",
      heading: "",
      description: "",
      order: sections.length,
      isVisible: true,
    });
    setFormItems([]);
    setNewFormItemInput("");
  }

  function startEdit(section: SectionRecord) {
    setEditingId(section._id);
    setCreating(false);
    setFormData({ ...section });
    setFormItems(Array.isArray(section.items) ? [...section.items] : []);
    setNewFormItemInput("");
  }

  function cancelForm() {
    setCreating(false);
    setEditingId(null);
    setFormData({});
    setFormItems([]);
    setNewFormItemInput("");
  }

  function addFormItem() {
    const trimmed = newFormItemInput.trim();
    if (!trimmed) return;
    setFormItems((prev) => [...prev, trimmed]);
    setNewFormItemInput("");
  }

  function removeFormItem(index: number) {
    setFormItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateFormItem(index: number, val: string) {
    setFormItems((prev) => prev.map((item, i) => (i === index ? val : item)));
  }

  async function handleSaveSection() {
    try {
      if (!formData.key?.trim()) {
        alert("Section key/slug is required");
        return;
      }

      setSaving(true);
      const payload: Record<string, unknown> = {
        ...formData,
        key: formData.key.trim().toLowerCase().replace(/\s+/g, "-"),
        items: formItems.filter((item) => item.trim().length > 0),
      };

      if (editingId) {
        await updateContent("sections", editingId, payload);
      } else {
        await createContent("sections", payload);
      }

      await loadSections();
      cancelForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save section");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteSection(section: SectionRecord) {
    const ok = await confirm({
      title: "Delete Section?",
      message: `Are you sure you want to delete section “${section.label || section.key}”? This action cannot be undone.`,
      confirmLabel: "Delete",
      status: "danger",
    });
    if (!ok) return;

    try {
      await deleteContent("sections", section._id);
      await loadSections();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete section");
    }
  }

  async function toggleSectionVisibility(section: SectionRecord) {
    try {
      const nextVisible = !section.isVisible;
      await updateContent("sections", section._id, { isVisible: nextVisible });
      setSections((prev) =>
        prev.map((s) => (s._id === section._id ? { ...s, isVisible: nextVisible } : s)),
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to toggle visibility");
    }
  }

  // Quick item management directly on section card
  async function handleQuickAddItem(section: SectionRecord) {
    const inputVal = (quickItemInputs[section._id] || "").trim();
    if (!inputVal) return;

    try {
      setSavingItemId(section._id);
      const currentItems = Array.isArray(section.items) ? section.items : [];
      const updatedItems = [...currentItems, inputVal];

      await updateContent("sections", section._id, { items: updatedItems });
      setSections((prev) =>
        prev.map((s) => (s._id === section._id ? { ...s, items: updatedItems } : s)),
      );
      setQuickItemInputs((prev) => ({ ...prev, [section._id]: "" }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add item to section");
    } finally {
      setSavingItemId(null);
    }
  }

  async function handleDeleteItem(section: SectionRecord, itemIndex: number) {
    const currentItems = Array.isArray(section.items) ? section.items : [];
    const itemText = currentItems[itemIndex] || `item ${itemIndex + 1}`;

    const ok = await confirm({
      title: "Delete Item?",
      message: `Are you sure you want to remove “${itemText}” from section “${section.label || section.key}”?`,
      confirmLabel: "Delete",
      status: "danger",
    });
    if (!ok) return;

    try {
      const updatedItems = currentItems.filter((_, i) => i !== itemIndex);
      await updateContent("sections", section._id, { items: updatedItems });
      setSections((prev) =>
        prev.map((s) => (s._id === section._id ? { ...s, items: updatedItems } : s)),
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete item");
    }
  }

  async function handleMoveItem(section: SectionRecord, itemIndex: number, direction: -1 | 1) {
    const currentItems = Array.isArray(section.items) ? [...section.items] : [];
    const targetIndex = itemIndex + direction;
    if (targetIndex < 0 || targetIndex >= currentItems.length) return;

    const [removed] = currentItems.splice(itemIndex, 1);
    currentItems.splice(targetIndex, 0, removed);

    try {
      await updateContent("sections", section._id, { items: currentItems });
      setSections((prev) =>
        prev.map((s) => (s._id === section._id ? { ...s, items: currentItems } : s)),
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to reorder items");
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-ink">Sections & Section Items</h1>
        <LoadingState message="Loading sections and items..." />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-ink">Sections & Section Items</h1>
        <ErrorState message={error} retry={loadSections} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Sections & Section Items</h1>
          <p className="mt-1 text-[13px] text-muted">
            Manage page sections, copy, order, visibility, and add options for sections and their items.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void loadSections()}
            className="grid h-9 w-9 place-items-center rounded-lg border border-line text-faint transition-colors hover:border-line-strong hover:text-accent"
            title="Reload sections"
          >
            <Icon name="RefreshCw" className="h-4 w-4" />
          </button>
          <button type="button" onClick={startCreate} className={btnPrimary}>
            <Icon name="Plus" className="h-4 w-4" />
            Add Section
          </button>
        </div>
      </div>

      {/* Add / Edit Section Form Modal/Card */}
      {(creating || editingId) && (
        <DashboardCard
          icon={creating ? "Plus" : "Pencil"}
          title={creating ? "Add New Section" : `Edit Section · ${formData.key || ""}`}
          className="border-accent/40 bg-surface-1 shadow-xl"
        >
          <div className="space-y-4 pt-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className={labelCls}>
                  Section Key / Slug <span className="text-danger">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. hero, skills, goals, custom-block"
                  value={formData.key || ""}
                  disabled={Boolean(editingId)}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  className={inputCls}
                />
                <p className="text-[11px] text-faint">Unique identifier matching the template or page anchor.</p>
              </div>

              <div className="space-y-1">
                <label className={labelCls}>Display Label</label>
                <Input
                  type="text"
                  placeholder="e.g. My Skills, Featured Work"
                  value={formData.label || ""}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className={labelCls}>Heading</label>
              <Input
                type="text"
                placeholder="e.g. Tools of the trade & core strengths"
                value={formData.heading || ""}
                onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
                className={inputCls}
              />
            </div>

            <div className="space-y-1">
              <label className={labelCls}>Description / Intro Text</label>
              <TextArea
                rows={3}
                placeholder="Brief summary or narrative for this section..."
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={inputCls + " resize-none"}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className={labelCls}>Display Order</label>
                <Input
                  type="number"
                  value={String(formData.order ?? 0)}
                  onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                  className={inputCls}
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <Switch
                  isSelected={formData.isVisible ?? true}
                  onChange={(val) => setFormData({ ...formData, isVisible: val })}
                />
                <span className="text-[13px] font-medium text-ink">
                  {formData.isVisible ?? true ? "Visible on page" : "Hidden"}
                </span>
              </div>
            </div>

            {/* Section Items Manager inside Form */}
            <div className="rounded-xl border border-line bg-surface-2/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[13px] font-semibold text-ink">Section Items</h4>
                  <p className="text-[11px] text-muted">
                    List items, bullet points, or highlights rendered by this section.
                  </p>
                </div>
                <span className="mono rounded-full border border-line bg-surface-1 px-2.5 py-0.5 text-[10px] text-faint">
                  {formItems.length} {formItems.length === 1 ? "item" : "items"}
                </span>
              </div>

              {/* Add item input row */}
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Type an item or highlight and click Add..."
                  value={newFormItemInput}
                  onChange={(e) => setNewFormItemInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addFormItem();
                    }
                  }}
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={addFormItem}
                  className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/20 px-3 text-[12px] font-medium text-accent hover:bg-accent/30"
                >
                  <Icon name="Plus" className="h-3.5 w-3.5" />
                  Add item
                </button>
              </div>

              {/* Existing items list in form */}
              {formItems.length === 0 ? (
                <p className="py-2 text-[12px] text-faint italic">No items added to this section yet.</p>
              ) : (
                <div className="space-y-2 pt-1">
                  {formItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="mono text-[10px] text-faint w-5 text-right">{idx + 1}.</span>
                      <Input
                        type="text"
                        value={item}
                        onChange={(e) => updateFormItem(idx, e.target.value)}
                        className={inputCls}
                      />
                      <button
                        type="button"
                        onClick={() => removeFormItem(idx)}
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line text-faint transition-colors hover:border-danger/40 hover:text-danger"
                        title="Remove item"
                      >
                        <Icon name="Trash2" className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2.5 pt-2 border-t border-line">
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleSaveSection()}
                className={btnPrimary}
              >
                {saving ? (
                  <>
                    <Icon name="RefreshCw" className="h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Icon name={editingId ? "Save" : "Plus"} className="h-4 w-4" />
                    {editingId ? "Save Changes" : "Create Section"}
                  </>
                )}
              </button>
              <button type="button" disabled={saving} onClick={cancelForm} className={btnSecondary}>
                Cancel
              </button>
            </div>
          </div>
        </DashboardCard>
      )}

      {/* Sections List */}
      {sections.length === 0 ? (
        <EmptyState
          icon="ListChecks"
          title="No sections found"
          description="Create your first section and add its items to power your site layout."
          action={
            <button type="button" onClick={startCreate} className={btnPrimary}>
              <Icon name="Plus" className="h-4 w-4" />
              Add First Section
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {[...sections]
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((section) => {
              const items = Array.isArray(section.items) ? section.items : [];
              const quickInput = quickItemInputs[section._id] || "";
              const isSavingThisItem = savingItemId === section._id;

              return (
                <DashboardCard key={section._id} hover className="overflow-hidden">
                  <div className="space-y-4">
                    {/* Section Header */}
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2.5">
                          <span className="mono rounded-md border border-accent/30 bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">
                            #{section.key}
                          </span>
                          <h3 className="text-[15px] font-semibold text-ink truncate">
                            {section.label || section.key}
                          </h3>
                        </div>

                        {section.heading && (
                          <p className="mt-1 text-[13px] font-medium text-slate-300">
                            {section.heading}
                          </p>
                        )}
                        {section.description && (
                          <p className="mt-1 text-[12px] text-muted line-clamp-2">
                            {section.description}
                          </p>
                        )}
                      </div>

                      {/* Header Controls: Visibility, Edit, Delete */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-2 mr-2">
                          <Switch
                            isSelected={section.isVisible ?? true}
                            onChange={() => void toggleSectionVisibility(section)}
                          />
                          <span className="text-[12px] font-medium text-ink">
                            {section.isVisible ?? true ? "Visible" : "Hidden"}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => startEdit(section)}
                          className={btnGhost}
                          title="Edit section"
                        >
                          <Icon name="Pencil" className="h-3.5 w-3.5" />
                          <span className="text-[12px]">Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => void handleDeleteSection(section)}
                          className={btnDanger}
                          title="Delete section"
                        >
                          <Icon name="Trash2" className="h-3.5 w-3.5" />
                          <span className="text-[12px]">Delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Section Items Block */}
                    <div className="rounded-xl border border-line/60 bg-surface-2/30 p-3.5 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Icon name="ListChecks" className="h-4 w-4 text-accent" />
                          <span className="text-[12px] font-semibold text-ink">
                            Section Items ({items.length})
                          </span>
                        </div>
                      </div>

                      {/* Quick Add Item Input */}
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          placeholder={`Add a new item to #${section.key}…`}
                          value={quickInput}
                          onChange={(e) =>
                            setQuickItemInputs((prev) => ({
                              ...prev,
                              [section._id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              void handleQuickAddItem(section);
                            }
                          }}
                          className={inputCls}
                        />
                        <button
                          type="button"
                          disabled={!quickInput.trim() || isSavingThisItem}
                          onClick={() => void handleQuickAddItem(section)}
                          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/20 px-3 text-[12px] font-medium text-accent hover:bg-accent/30 disabled:opacity-50"
                        >
                          {isSavingThisItem ? (
                            <Icon name="RefreshCw" className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Icon name="Plus" className="h-3.5 w-3.5" />
                          )}
                          Add Item
                        </button>
                      </div>

                      {/* Existing Items Render */}
                      {items.length === 0 ? (
                        <p className="py-1 text-[11.5px] text-faint italic">
                          No items added yet. Use the field above to add items.
                        </p>
                      ) : (
                        <div className="divide-y divide-line/40 rounded-lg border border-line/50 bg-surface-1/40">
                          {items.map((item, itemIdx) => (
                            <div
                              key={itemIdx}
                              className="flex items-center justify-between gap-3 px-3 py-2 text-[12.5px] text-ink hover:bg-surface-2/40 transition-colors"
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <span className="mono text-[10px] text-faint shrink-0 w-4">
                                  {itemIdx + 1}.
                                </span>
                                <span className="truncate">{item}</span>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  disabled={itemIdx === 0}
                                  onClick={() => void handleMoveItem(section, itemIdx, -1)}
                                  className="grid h-7 w-6 place-items-center rounded border border-line text-faint hover:text-accent disabled:opacity-30"
                                  title="Move up"
                                >
                                  <Icon name="ChevronUp" className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  disabled={itemIdx === items.length - 1}
                                  onClick={() => void handleMoveItem(section, itemIdx, 1)}
                                  className="grid h-7 w-6 place-items-center rounded border border-line text-faint hover:text-accent disabled:opacity-30"
                                  title="Move down"
                                >
                                  <Icon name="ChevronDown" className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void handleDeleteItem(section, itemIdx)}
                                  className="grid h-7 w-7 place-items-center rounded border border-line text-faint hover:border-danger/40 hover:text-danger ml-1"
                                  title="Delete item"
                                >
                                  <Icon name="Trash2" className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </DashboardCard>
              );
            })}
        </div>
      )}
    </div>
  );
}
