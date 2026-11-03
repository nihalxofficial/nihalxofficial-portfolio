"use client";

import { useEffect, useState } from "react";
import { DashboardCard, LoadingState, ErrorState, EmptyState } from "@/components/admin/dashboard-card";
import { Icon } from "@/components/ui/icon";
import { listContent, createContent, updateContent, deleteContent } from "@/lib/admin";
import { Input, Textarea, Button, Switch } from "@heroui/react";

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

export default function TestimonialsManagerPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Testimonial>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTestimonials();
  }, []);

  async function loadTestimonials() {
    try {
      setLoading(true);
      setError(null);
      const result = await listContent("testimonials");
      setTestimonials(result.items as unknown as Testimonial[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      if (!formData.name || !formData.message) {
        alert("Name and message are required");
        return;
      }

      setSaving(true);

      if (editing) {
        await updateContent("testimonials", editing, formData);
      } else {
        await createContent("testimonials", {
          ...formData,
          order: testimonials.length,
          isVisible: true,
        });
      }

      await loadTestimonials();
      setEditing(null);
      setCreating(false);
      setFormData({});
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save testimonial");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;

    try {
      await deleteContent("testimonials", id);
      await loadTestimonials();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete testimonial");
    }
  }

  async function toggleVisibility(id: string, currentState: boolean) {
    try {
      await updateContent("testimonials", id, { isVisible: !currentState });
      setTestimonials((prev) =>
        prev.map((test) => (test._id === id ? { ...test, isVisible: !currentState } : test))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update visibility");
    }
  }

  function startEdit(test: Testimonial) {
    setEditing(test._id);
    setFormData(test);
    setCreating(false);
  }

  function startCreate() {
    setCreating(true);
    setEditing(null);
    setFormData({
      name: "",
      role: "",
      message: "",
      rating: 5,
      avatarUrl: "",
    });
  }

  function cancelEdit() {
    setEditing(null);
    setCreating(false);
    setFormData({});
  }

  function renderStars(rating: number, interactive = false) {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && setFormData({ ...formData, rating: star })}
            className={`${interactive ? "cursor-pointer hover:scale-110" : ""} transition-transform`}
            disabled={!interactive}
          >
            <Icon
              name="Star"
              className={`h-5 w-5 ${
                star <= rating
                  ? "fill-yellow-500 text-yellow-500"
                  : "text-muted"
              }`}
            />
          </button>
        ))}
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-ink">Testimonials</h1>
        <LoadingState message="Loading testimonials..." />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-ink">Testimonials</h1>
        <ErrorState message={error} retry={loadTestimonials} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Testimonials</h1>
          <p className="mt-2 text-[14px] text-muted">
            Manage client testimonials and reviews
          </p>
        </div>
        <Button
          onPress={startCreate}
          color="primary"
          startContent={<Icon name="Plus" className="h-4 w-4" />}
        >
          Add Testimonial
        </Button>
      </div>

      {/* Create/Edit Form */}
      {(creating || editing) && (
        <DashboardCard className="mb-6" icon="Edit" title={editing ? "Edit Testimonial" : "Add Testimonial"}>
          <div className="space-y-4">
            <Input
              label="Name"
              placeholder="John Smith"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <Input
              label="Role / Company"
              placeholder="CEO at Acme Corp, Project Manager"
              value={formData.role || ""}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            />

            <Textarea
              label="Testimonial Message"
              placeholder="Working with [Your Name] was an absolute pleasure..."
              description={`${(formData.message || "").length} characters`}
              value={formData.message || ""}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              minRows={4}
              maxRows={8}
            />

            <div className="space-y-2">
              <label className="text-[13px] font-medium text-ink">Rating</label>
              {renderStars(formData.rating || 5, true)}
              <p className="text-[12px] text-muted">
                Click stars to set rating (currently {formData.rating || 5}/5)
              </p>
            </div>

            <Input
              label="Avatar URL (optional)"
              placeholder="https://i.ibb.co/..."
              description="Upload via Media Library and paste URL here"
              value={formData.avatarUrl || ""}
              onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
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

      {/* Testimonials List */}
      {testimonials.length === 0 ? (
        <EmptyState
          icon="MessageSquare"
          title="No testimonials yet"
          description="Add your first testimonial to showcase client feedback"
          action={
            <Button onPress={startCreate} color="primary">
              Add Your First Testimonial
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {testimonials
            .sort((a, b) => a.order - b.order)
            .map((test) => (
              <DashboardCard key={test._id} hover>
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent/20 bg-gradient-to-br from-accent/15 to-accent/5 text-accent font-semibold text-[14px]">
                        {test.avatarUrl ? (
                          <img
                            src={test.avatarUrl}
                            alt={test.name}
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          test.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-[14px] text-ink">{test.name}</h3>
                        <p className="mt-0.5 text-[12px] text-muted">{test.role}</p>
                        <div className="mt-2">
                          {renderStars(test.rating)}
                        </div>
                      </div>
                    </div>
                    <Switch
                      size="sm"
                      isSelected={test.isVisible}
                      onValueChange={() => toggleVisibility(test._id, test.isVisible)}
                      aria-label="Toggle visibility"
                    />
                  </div>

                  {/* Message */}
                  <p className="text-[13px] text-muted line-clamp-3 italic">
                    "{test.message}"
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-2 border-t border-line/50 pt-3">
                    <Button
                      size="sm"
                      variant="light"
                      onPress={() => startEdit(test)}
                      startContent={<Icon name="Edit" className="h-3.5 w-3.5" />}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="light"
                      color="danger"
                      onPress={() => handleDelete(test._id)}
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
      <DashboardCard className="mt-8" icon="Lightbulb" title="Testimonial Tips">
        <ul className="space-y-2 text-[13px] text-muted">
          <li className="flex gap-2">
            <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
            <span><strong className="text-ink">Authentic testimonials</strong> are more impactful than generic ones</span>
          </li>
          <li className="flex gap-2">
            <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
            <span>Include <strong className="text-ink">specific details</strong> about the project or collaboration</span>
          </li>
          <li className="flex gap-2">
            <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
            <span>Add <strong className="text-ink">avatars</strong> to make testimonials more personal</span>
          </li>
          <li className="flex gap-2">
            <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
            <span>Keep messages <strong className="text-ink">concise</strong> (150-300 characters ideal)</span>
          </li>
        </ul>
      </DashboardCard>
    </div>
  );
}
