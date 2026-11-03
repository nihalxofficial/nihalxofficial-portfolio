"use client";

import { useEffect, useState } from "react";
import { DashboardCard, LoadingState, ErrorState, EmptyState } from "@/components/admin/dashboard-card";
import { Icon } from "@/components/ui/icon";
import { listContent, createContent, updateContent, deleteContent } from "@/lib/admin";
import { Input, Textarea, Button, Switch } from "@heroui/react";

interface Service {
  _id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  isVisible: boolean;
}

export default function ServicesManagerPage() {
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
        await updateContent("services", editing, formData);
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
    if (!confirm("Are you sure you want to delete this service?")) return;

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
    setFormData({
      title: "",
      description: "",
      icon: "Briefcase",
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
        <Button
          onPress={startCreate}
          color="primary"
          startContent={<Icon name="Plus" className="h-4 w-4" />}
        >
          Add Service
        </Button>
      </div>

      {/* Create/Edit Form */}
      {(creating || editing) && (
        <DashboardCard className="mb-6" icon="Edit" title={editing ? "Edit Service" : "Add Service"}>
          <div className="space-y-4">
            <Input
              label="Title"
              placeholder="Full-Stack Development, API Design, DevOps"
              value={formData.title || ""}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <Textarea
              label="Description"
              placeholder="Detailed description of this service..."
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              maxRows={6}
            />
            <Input
              label="Icon (Lucide name)"
              placeholder="Code, Database, Cloud, Shield"
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

      {/* Services List */}
      {services.length === 0 ? (
        <EmptyState
          icon="Briefcase"
          title="No services yet"
          description="Add your first service to showcase what you offer"
          action={
            <Button onPress={startCreate} color="primary">
              Add Your First Service
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {services
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
                    <Switch
                      size="sm"
                      isSelected={service.isVisible}
                      onValueChange={() => toggleVisibility(service._id, service.isVisible)}
                      aria-label="Toggle visibility"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 border-t border-line/50 pt-3">
                    <Button
                      size="sm"
                      variant="light"
                      onPress={() => startEdit(service)}
                      startContent={<Icon name="Edit" className="h-3.5 w-3.5" />}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="light"
                      color="danger"
                      onPress={() => handleDelete(service._id)}
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
