"use client";

import { useEffect, useState } from "react";
import { DashboardCard, LoadingState, ErrorState, EmptyState } from "@/components/admin/dashboard-card";
import { Icon } from "@/components/ui/icon";
import { listContent, createContent, updateContent, deleteContent } from "@/lib/admin";
import { Input, Textarea, Button, Switch } from "@heroui/react";

interface Statistic {
  _id: string;
  value: string;
  label: string;
  description: string;
  icon: string;
  order: number;
  isVisible: boolean;
}

export default function StatisticsManagerPage() {
  const [stats, setStats] = useState<Statistic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Statistic>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

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
        await updateContent("statistics", editing, formData);
      } else {
        await createContent("statistics", {
          ...formData,
          order: stats.length,
          isVisible: true,
        });
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
      setStats((prev) =>
        prev.map((stat) => (stat._id === id ? { ...stat, isVisible: !currentState } : stat))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update visibility");
    }
  }

  function startEdit(stat: Statistic) {
    setEditing(stat._id);
    setFormData(stat);
    setCreating(false);
  }

  function startCreate() {
    setCreating(true);
    setEditing(null);
    setFormData({
      value: "",
      label: "",
      description: "",
      icon: "BarChart",
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
        <h1 className="mb-6 text-2xl font-bold text-ink">Statistics</h1>
        <LoadingState message="Loading statistics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-ink">Statistics</h1>
        <ErrorState message={error} retry={loadStats} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Statistics / Numbers Speak</h1>
          <p className="mt-2 text-[14px] text-muted">
            Manage your key metrics and achievement numbers
          </p>
        </div>
        <Button
          onPress={startCreate}
          color="primary"
          startContent={<Icon name="Plus" className="h-4 w-4" />}
        >
          Add Statistic
        </Button>
      </div>

      {/* Create/Edit Form */}
      {(creating || editing) && (
        <DashboardCard className="mb-6" icon="Edit" title={editing ? "Edit Statistic" : "Add Statistic"}>
          <div className="space-y-4">
            <Input
              label="Value"
              placeholder="5+, 100%, 50K+"
              description="The number or metric to display (e.g., '5+', '100%', '50K+')"
              value={formData.value || ""}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            />
            <Input
              label="Label"
              placeholder="Years Experience, Projects Completed, Happy Clients"
              value={formData.label || ""}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            />
            <Textarea
              label="Description"
              placeholder="Brief description of this metric"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              maxRows={3}
            />
            <Input
              label="Icon (Lucide name)"
              placeholder="BarChart, Users, TrendingUp, Award"
              description="Choose an icon from lucide.dev"
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

      {/* Statistics List */}
      {stats.length === 0 ? (
        <EmptyState
          icon="BarChart"
          title="No statistics yet"
          description="Add your first statistic to showcase your achievements"
          action={
            <Button onPress={startCreate} color="primary">
              Add Your First Statistic
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats
            .sort((a, b) => a.order - b.order)
            .map((stat) => (
              <DashboardCard key={stat._id} hover>
                <div className="space-y-3">
                  {/* Icon and Value */}
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-accent/20 bg-gradient-to-br from-accent/15 to-accent/5 text-accent">
                      <Icon name={stat.icon || "BarChart"} className="h-6 w-6" />
                    </div>
                    <Switch
                      size="sm"
                      isSelected={stat.isVisible}
                      onValueChange={() => toggleVisibility(stat._id, stat.isVisible)}
                      aria-label="Toggle visibility"
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <p className="text-3xl font-bold text-ink">{stat.value}</p>
                    <p className="mt-1 text-[14px] font-semibold text-ink">{stat.label}</p>
                    {stat.description && (
                      <p className="mt-1 text-[12px] text-muted line-clamp-2">{stat.description}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="light"
                      onPress={() => startEdit(stat)}
                      startContent={<Icon name="Edit" className="h-3.5 w-3.5" />}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="light"
                      color="danger"
                      onPress={() => handleDelete(stat._id)}
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
      <DashboardCard className="mt-8" icon="Lightbulb" title="Statistics Tips">
        <ul className="space-y-2 text-[13px] text-muted">
          <li className="flex gap-2">
            <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
            <span>Use <strong className="text-ink">+ signs</strong> for ongoing counts (e.g., "5+ Years")</span>
          </li>
          <li className="flex gap-2">
            <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
            <span>Keep values <strong className="text-ink">short and impactful</strong> for visual appeal</span>
          </li>
          <li className="flex gap-2">
            <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
            <span>Choose <strong className="text-ink">relevant icons</strong> that match your metrics</span>
          </li>
          <li className="flex gap-2">
            <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
            <span>Reorder by dragging cards (coming soon)</span>
          </li>
        </ul>
      </DashboardCard>
    </div>
  );
}
