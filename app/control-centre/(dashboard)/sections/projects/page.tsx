"use client";

import { useEffect, useState } from "react";
import { DashboardCard, LoadingState, ErrorState, EmptyState } from "@/components/admin/dashboard-card";
import { Icon } from "@/components/ui/icon";
import { listContent, createContent, updateContent, deleteContent } from "@/lib/admin";
import { Input, Textarea, Button, Switch, Select, SelectItem } from "@heroui/react";

interface Project {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  thumbnailUrl: string;
  screenshots: string[];
  category: string;
  techStack: string[];
  features: string[];
  challenges: string;
  improvements: string;
  liveUrl: string;
  sourceUrl: string;
  isFeatured: boolean;
  isPublished: boolean;
  order: number;
  seo?: {
    title?: string;
    description?: string;
  };
}

const CATEGORIES = [
  "Web Application",
  "Mobile App",
  "E-Commerce",
  "Dashboard",
  "Portfolio",
  "Landing Page",
  "API/Backend",
  "Desktop App",
  "Other",
];

export default function ProjectsManagerPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Project>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      setLoading(true);
      setError(null);
      const result = await listContent("projects");
      setProjects(result.items as unknown as Project[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  function generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async function handleSave() {
    try {
      if (!formData.title || !formData.shortDescription) {
        alert("Title and short description are required");
        return;
      }

      // Auto-generate slug if not provided
      if (!formData.slug && formData.title) {
        formData.slug = generateSlug(formData.title);
      }

      setSaving(true);

      if (editing) {
        await updateContent("projects", editing, formData);
      } else {
        await createContent("projects", {
          ...formData,
          order: projects.length,
          isPublished: false,
          isFeatured: false,
        });
      }

      await loadProjects();
      setEditing(null);
      setCreating(false);
      setFormData({});
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save project");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      await deleteContent("projects", id);
      await loadProjects();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete project");
    }
  }

  async function togglePublished(id: string, currentState: boolean) {
    try {
      await updateContent("projects", id, { isPublished: !currentState });
      setProjects((prev) =>
        prev.map((proj) => (proj._id === id ? { ...proj, isPublished: !currentState } : proj))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update published status");
    }
  }

  async function toggleFeatured(id: string, currentState: boolean) {
    try {
      await updateContent("projects", id, { isFeatured: !currentState });
      setProjects((prev) =>
        prev.map((proj) => (proj._id === id ? { ...proj, isFeatured: !currentState } : proj))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update featured status");
    }
  }

  function startEdit(project: Project) {
    setEditing(project._id);
    setFormData(project);
    setCreating(false);
  }

  function startCreate() {
    setCreating(true);
    setEditing(null);
    setFormData({
      title: "",
      slug: "",
      shortDescription: "",
      description: "",
      thumbnailUrl: "",
      screenshots: [],
      category: "Web Application",
      techStack: [],
      features: [],
      challenges: "",
      improvements: "",
      liveUrl: "",
      sourceUrl: "",
      seo: {},
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
        <h1 className="mb-6 text-2xl font-bold text-ink">Projects</h1>
        <LoadingState message="Loading projects..." />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-ink">Projects</h1>
        <ErrorState message={error} retry={loadProjects} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Projects</h1>
          <p className="mt-2 text-[14px] text-muted">
            Manage your portfolio projects and case studies
          </p>
        </div>
        <Button
          onPress={startCreate}
          color="primary"
          startContent={<Icon name="Plus" className="h-4 w-4" />}
        >
          Add Project
        </Button>
      </div>

      {/* Create/Edit Form */}
      {(creating || editing) && (
        <div className="mb-6 space-y-6">
          {/* Basic Info */}
          <DashboardCard icon="FileText" title="Basic Information">
            <div className="space-y-4">
              <Input
                label="Project Title"
                placeholder="My Awesome Project"
                value={formData.title || ""}
                onChange={(e) => {
                  setFormData({ 
                    ...formData, 
                    title: e.target.value,
                    slug: generateSlug(e.target.value)
                  });
                }}
              />

              <Input
                label="URL Slug"
                placeholder="my-awesome-project"
                description="Auto-generated from title, but you can customize"
                value={formData.slug || ""}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />

              <Textarea
                label="Short Description"
                placeholder="A brief one-liner about this project..."
                description="Shown in project cards (keep it concise)"
                value={formData.shortDescription || ""}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                maxRows={3}
              />

              <Textarea
                label="Full Description"
                placeholder="Detailed description of the project, its purpose, and your role..."
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                minRows={6}
                maxRows={12}
              />

              <Select
                label="Category"
                selectedKeys={formData.category ? [formData.category] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setFormData({ ...formData, category: selected });
                }}
              >
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </DashboardCard>

          {/* Images */}
          <DashboardCard icon="Image" title="Images & Media">
            <div className="space-y-4">
              <Input
                label="Thumbnail URL"
                placeholder="https://i.ibb.co/..."
                description="Main project thumbnail (recommended: 1200x800px)"
                value={formData.thumbnailUrl || ""}
                onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
              />

              <Textarea
                label="Screenshot URLs (one per line)"
                placeholder="https://i.ibb.co/screenshot1.png&#10;https://i.ibb.co/screenshot2.png"
                description="Additional project screenshots"
                value={formData.screenshots?.join("\n") || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    screenshots: e.target.value.split("\n").filter(Boolean),
                  })
                }
                maxRows={6}
              />
            </div>
          </DashboardCard>

          {/* Tech Stack & Features */}
          <DashboardCard icon="Code" title="Technical Details">
            <div className="space-y-4">
              <Textarea
                label="Tech Stack (one per line)"
                placeholder="React&#10;Next.js&#10;TypeScript&#10;Tailwind CSS&#10;PostgreSQL"
                value={formData.techStack?.join("\n") || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    techStack: e.target.value.split("\n").filter(Boolean),
                  })
                }
                maxRows={8}
              />

              <Textarea
                label="Key Features (one per line)"
                placeholder="User authentication&#10;Real-time updates&#10;Responsive design&#10;API integration"
                value={formData.features?.join("\n") || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    features: e.target.value.split("\n").filter(Boolean),
                  })
                }
                maxRows={8}
              />

              <Textarea
                label="Challenges & Solutions"
                placeholder="Describe technical challenges you faced and how you solved them..."
                value={formData.challenges || ""}
                onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                maxRows={5}
              />

              <Textarea
                label="Future Improvements"
                placeholder="What you'd like to add or improve in the future..."
                value={formData.improvements || ""}
                onChange={(e) => setFormData({ ...formData, improvements: e.target.value })}
                maxRows={5}
              />
            </div>
          </DashboardCard>

          {/* Links & SEO */}
          <DashboardCard icon="Link" title="Links & SEO">
            <div className="space-y-4">
              <Input
                label="Live Demo URL"
                placeholder="https://example.com"
                value={formData.liveUrl || ""}
                onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
              />

              <Input
                label="Source Code URL"
                placeholder="https://github.com/username/repo"
                value={formData.sourceUrl || ""}
                onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
              />

              <div className="h-px bg-line/50" />

              <Input
                label="SEO Title (optional)"
                placeholder="Custom title for SEO (defaults to project title)"
                value={formData.seo?.title || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    seo: { ...formData.seo, title: e.target.value },
                  })
                }
              />

              <Textarea
                label="SEO Description (optional)"
                placeholder="Custom description for search engines"
                value={formData.seo?.description || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    seo: { ...formData.seo, description: e.target.value },
                  })
                }
                maxRows={3}
              />
            </div>
          </DashboardCard>

          {/* Settings */}
          <DashboardCard icon="Settings" title="Project Settings">
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <Switch
                  size="sm"
                  isSelected={formData.isFeatured || false}
                  onValueChange={(val) => setFormData({ ...formData, isFeatured: val })}
                />
                <span className="text-[13px] text-ink">Featured Project</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <Switch
                  size="sm"
                  isSelected={formData.isPublished || false}
                  onValueChange={(val) => setFormData({ ...formData, isPublished: val })}
                />
                <span className="text-[13px] text-ink">Published</span>
              </label>
            </div>
          </DashboardCard>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onPress={handleSave} color="primary" size="lg" isLoading={saving}>
              {saving ? "Saving..." : editing ? "Update Project" : "Create Project"}
            </Button>
            <Button onPress={cancelEdit} variant="bordered" size="lg">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Projects List */}
      {!creating && !editing && (
        <>
          {projects.length === 0 ? (
            <EmptyState
              icon="FolderKanban"
              title="No projects yet"
              description="Add your first project to showcase your work"
              action={
                <Button onPress={startCreate} color="primary">
                  Add Your First Project
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects
                .sort((a, b) => a.order - b.order)
                .map((project) => (
                  <DashboardCard key={project._id} hover>
                    <div className="space-y-3">
                      {/* Thumbnail */}
                      {project.thumbnailUrl && (
                        <div className="relative aspect-video overflow-hidden rounded-lg bg-surface-2">
                          <img
                            src={project.thumbnailUrl}
                            alt={project.title}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute right-2 top-2 flex gap-2">
                            {project.isFeatured && (
                              <span className="rounded-full bg-accent/90 px-2 py-1 text-[10px] font-bold text-white">
                                FEATURED
                              </span>
                            )}
                            {!project.isPublished && (
                              <span className="rounded-full bg-muted/90 px-2 py-1 text-[10px] font-bold text-white">
                                DRAFT
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Content */}
                      <div>
                        <h3 className="font-semibold text-[15px] text-ink line-clamp-1">
                          {project.title}
                        </h3>
                        <p className="mt-1 text-[12px] text-muted">{project.category}</p>
                        <p className="mt-2 text-[13px] text-muted line-clamp-2">
                          {project.shortDescription}
                        </p>
                        {project.techStack && project.techStack.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {project.techStack.slice(0, 3).map((tech, idx) => (
                              <span
                                key={idx}
                                className="rounded-md bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent ring-1 ring-accent/20"
                              >
                                {tech}
                              </span>
                            ))}
                            {project.techStack.length > 3 && (
                              <span className="rounded-md bg-muted/10 px-2 py-0.5 text-[10px] font-medium text-muted">
                                +{project.techStack.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Toggles */}
                      <div className="flex items-center justify-between border-t border-line/50 pt-3">
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <Switch
                              size="sm"
                              isSelected={project.isFeatured}
                              onValueChange={() => toggleFeatured(project._id, project.isFeatured)}
                            />
                            <span className="text-[11px] text-muted">Featured</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <Switch
                              size="sm"
                              isSelected={project.isPublished}
                              onValueChange={() => togglePublished(project._id, project.isPublished)}
                            />
                            <span className="text-[11px] text-muted">Published</span>
                          </label>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="light"
                          onPress={() => startEdit(project)}
                          startContent={<Icon name="Edit" className="h-3.5 w-3.5" />}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="light"
                          color="danger"
                          onPress={() => handleDelete(project._id)}
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
        </>
      )}

      {/* Tips */}
      {!creating && !editing && (
        <DashboardCard className="mt-8" icon="Lightbulb" title="Project Tips">
          <ul className="space-y-2 text-[13px] text-muted">
            <li className="flex gap-2">
              <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
              <span>Use <strong className="text-ink">high-quality screenshots</strong> (1200x800px recommended)</span>
            </li>
            <li className="flex gap-2">
              <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
              <span>Write <strong className="text-ink">compelling descriptions</strong> that highlight your role</span>
            </li>
            <li className="flex gap-2">
              <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
              <span>Mark your <strong className="text-ink">best projects as featured</strong> to showcase them</span>
            </li>
            <li className="flex gap-2">
              <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
              <span>Include <strong className="text-ink">live demo and source links</strong> when possible</span>
            </li>
          </ul>
        </DashboardCard>
      )}
    </div>
  );
}
