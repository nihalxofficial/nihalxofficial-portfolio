"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardCard, LoadingState, ErrorState, EmptyState } from "@/components/admin/dashboard-card";
import { Icon } from "@/components/ui/icon";
import { listContent, createContent, updateContent, deleteContent } from "@/lib/admin";
import { Input, ListBoxItem, Select, Switch, TextArea } from "@heroui/react";
import { useConfirm } from "@/components/admin/ui";

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

const inputCls = "w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30";
const labelCls = "block text-[12px] font-medium text-muted";
const btnPrimary = "inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/15 px-4 py-2 text-[13px] font-medium text-accent transition-all hover:bg-accent/25 disabled:opacity-60";
const btnSecondary = "inline-flex items-center gap-2 rounded-lg border border-line bg-surface-2/40 px-4 py-2 text-[13px] font-medium text-muted transition-all hover:border-line-strong hover:text-ink";
const btnGhost = "inline-flex items-center gap-1.5 rounded-lg border border-transparent px-2 py-1.5 text-[12px] font-medium text-muted transition-all hover:border-line hover:bg-surface-2 hover:text-ink";
const btnDanger = "inline-flex items-center gap-1.5 rounded-lg border border-transparent px-2 py-1.5 text-[12px] font-medium text-muted transition-all hover:border-danger/30 hover:bg-danger/5 hover:text-danger";

export default function ProjectsManagerPage() {
  const confirm = useConfirm();
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

      if (!formData.slug && formData.title) {
        formData.slug = generateSlug(formData.title);
      }

      setSaving(true);

      if (editing) {
        await updateContent("projects", editing, formData as unknown as Record<string, unknown>);
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
    const ok = await confirm({
      title: "Delete project?",
      message: "Are you sure you want to delete this project? This cannot be undone.",
      confirmLabel: "Delete",
      status: "danger",
    });
    if (!ok) return;
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
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Projects</h1>
          <p className="mt-2 text-[14px] text-muted">
            Manage your portfolio projects and case studies
          </p>
        </div>
        <Link href="/control-centre/sections/projects/add" className={btnPrimary}>
          <Icon name="Plus" className="h-4 w-4" />
          Add Project
        </Link>
      </div>

      {/* Create/Edit Form */}
      {(creating || editing) && (
        <div className="mb-6 space-y-6">
          {/* Basic Info */}
          <DashboardCard icon="FileText" title="Basic Information">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className={labelCls}>Project Title</label>
                <Input
                  className={inputCls}
                  placeholder="My Awesome Project"
                  value={formData.title || ""}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      title: e.target.value,
                      slug: generateSlug(e.target.value),
                    });
                  }}
                />
              </div>

              <div className="space-y-1">
                <label className={labelCls}>URL Slug</label>
                <Input
                  className={inputCls}
                  placeholder="my-awesome-project"
                  value={formData.slug || ""}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
                <p className="text-[11px] text-faint">Auto-generated from title, but you can customize</p>
              </div>

              <div className="space-y-1">
                <label className={labelCls}>Short Description</label>
                <TextArea
                  rows={3}
                  className={inputCls + " resize-none"}
                  placeholder="A brief one-liner about this project..."
                  value={formData.shortDescription || ""}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                />
                <p className="text-[11px] text-faint">Shown in project cards (keep it concise)</p>
              </div>

              <div className="space-y-1">
                <label className={labelCls}>Full Description</label>
                <TextArea
                  rows={6}
                  className={inputCls + " resize-y"}
                  placeholder="Detailed description of the project, its purpose, and your role..."
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className={labelCls}>Category</label>
                <Select
                  value={formData.category || "Web Application"}
                  onChange={(next: unknown) => setFormData({ ...formData, category: String(next) })}
                  className={inputCls}
                >
                  {CATEGORIES.map((cat) => (
                    <ListBoxItem key={cat} value={cat}>{cat}</ListBoxItem>
                  ))}
                </Select>
              </div>
            </div>
          </DashboardCard>

          {/* Images */}
          <DashboardCard icon="Image" title="Images & Media">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className={labelCls}>Thumbnail URL</label>
                <Input
                  className={inputCls}
                  placeholder="https://i.ibb.co/..."
                  value={formData.thumbnailUrl || ""}
                  onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                />
                <p className="text-[11px] text-faint">Main project thumbnail (recommended: 1200x800px)</p>
              </div>

              <div className="space-y-1">
                <label className={labelCls}>Screenshot URLs (one per line)</label>
                <TextArea
                  rows={6}
                  className={inputCls + " resize-y"}
                  placeholder={"https://i.ibb.co/screenshot1.png\nhttps://i.ibb.co/screenshot2.png"}
                  value={formData.screenshots?.join("\n") || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      screenshots: e.target.value.split("\n").filter(Boolean),
                    })
                  }
                />
                <p className="text-[11px] text-faint">Additional project screenshots</p>
              </div>
            </div>
          </DashboardCard>

          {/* Tech Stack & Features */}
          <DashboardCard icon="Code" title="Technical Details">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className={labelCls}>Tech Stack (one per line)</label>
                <TextArea
                  rows={8}
                  className={inputCls + " resize-y"}
                  placeholder={"React\nNext.js\nTypeScript\nTailwind CSS\nPostgreSQL"}
                  value={formData.techStack?.join("\n") || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      techStack: e.target.value.split("\n").filter(Boolean),
                    })
                  }
                />
              </div>

              <div className="space-y-1">
                <label className={labelCls}>Key Features (one per line)</label>
                <TextArea
                  rows={8}
                  className={inputCls + " resize-y"}
                  placeholder={"User authentication\nReal-time updates\nResponsive design\nAPI integration"}
                  value={formData.features?.join("\n") || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      features: e.target.value.split("\n").filter(Boolean),
                    })
                  }
                />
              </div>

              <div className="space-y-1">
                <label className={labelCls}>Challenges & Solutions</label>
                <TextArea
                  rows={5}
                  className={inputCls + " resize-y"}
                  placeholder="Describe technical challenges you faced and how you solved them..."
                  value={formData.challenges || ""}
                  onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className={labelCls}>Future Improvements</label>
                <TextArea
                  rows={5}
                  className={inputCls + " resize-y"}
                  placeholder="What you'd like to add or improve in the future..."
                  value={formData.improvements || ""}
                  onChange={(e) => setFormData({ ...formData, improvements: e.target.value })}
                />
              </div>
            </div>
          </DashboardCard>

          {/* Links & SEO */}
          <DashboardCard icon="Link" title="Links & SEO">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className={labelCls}>Live Demo URL</label>
                <Input
                  className={inputCls}
                  placeholder="https://example.com"
                  value={formData.liveUrl || ""}
                  onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className={labelCls}>Source Code URL</label>
                <Input
                  className={inputCls}
                  placeholder="https://github.com/username/repo"
                  value={formData.sourceUrl || ""}
                  onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                />
              </div>

              <div className="h-px bg-line/50" />

              <div className="space-y-1">
                <label className={labelCls}>SEO Title (optional)</label>
                <Input
                  className={inputCls}
                  placeholder="Custom title for SEO (defaults to project title)"
                  value={formData.seo?.title || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seo: { ...formData.seo, title: e.target.value },
                    })
                  }
                />
              </div>

              <div className="space-y-1">
                <label className={labelCls}>SEO Description (optional)</label>
                <TextArea
                  rows={3}
                  className={inputCls + " resize-none"}
                  placeholder="Custom description for search engines"
                  value={formData.seo?.description || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seo: { ...formData.seo, description: e.target.value },
                    })
                  }
                />
              </div>
            </div>
          </DashboardCard>

          {/* Settings */}
          <DashboardCard icon="Settings" title="Project Settings">
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  isSelected={formData.isFeatured || false}
                  onChange={(isSelected) => setFormData({ ...formData, isFeatured: isSelected })}
                />
                <span className="text-[13px] font-medium text-ink">Featured Project</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  isSelected={formData.isPublished || false}
                  onChange={(isSelected) => setFormData({ ...formData, isPublished: isSelected })}
                />
                <span className="text-[13px] font-medium text-ink">Published</span>
              </div>
            </div>
          </DashboardCard>

          {/* Actions */}
          <div className="flex gap-3">
            <button type="button" onClick={handleSave} disabled={saving} className={btnPrimary + " px-6 py-2.5 text-[14px]"}>
              {saving ? "Saving..." : editing ? "Update Project" : "Create Project"}
            </button>
            <button type="button" onClick={cancelEdit} className={btnSecondary + " px-6 py-2.5 text-[14px]"}>
              Cancel
            </button>
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
                <Link href="/control-centre/sections/projects/add" className={btnPrimary}>
                  Add Your First Project
                </Link>
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
                      <div className="flex items-center gap-4 border-t border-line/50 pt-3">
                        <div className="flex items-center gap-2">
                          <Switch
                            isSelected={project.isFeatured}
                            onChange={() => toggleFeatured(project._id, project.isFeatured)}
                          />
                          <span className="text-[12px] font-medium text-ink">Featured</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            isSelected={project.isPublished}
                            onChange={() => togglePublished(project._id, project.isPublished)}
                          />
                          <span className="text-[12px] font-medium text-ink">Published</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => startEdit(project)} className={btnGhost}>
                          <Icon name="Pencil" className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button type="button" onClick={() => handleDelete(project._id)} className={btnDanger}>
                          <Icon name="Trash2" className="h-3.5 w-3.5" /> Delete
                        </button>
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
