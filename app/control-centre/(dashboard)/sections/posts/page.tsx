"use client";

import { useEffect, useState } from "react";
import { DashboardCard, LoadingState, ErrorState, EmptyState } from "@/components/admin/dashboard-card";
import { Icon } from "@/components/ui/icon";
import { listContent, createContent, updateContent, deleteContent } from "@/lib/admin";
import { Input, ListBoxItem, Select, Switch, TextArea } from "@heroui/react";
import { useConfirm } from "@/components/admin/ui";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  tags: string[];
  category: string;
  readingTime: string;
  isPublished: boolean;
  publishedAt?: string;
  seo?: {
    title?: string;
    description?: string;
  };
}

const CATEGORIES = [
  "Tutorial",
  "Guide",
  "Case Study",
  "Opinion",
  "News",
  "Review",
  "Tips & Tricks",
  "Industry Insights",
  "Other",
];

const inputCls = "w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30";
const labelCls = "block text-[12px] font-medium text-muted";
const btnPrimary = "inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/15 px-4 py-2 text-[13px] font-medium text-accent transition-all hover:bg-accent/25 disabled:opacity-60";
const btnSecondary = "inline-flex items-center gap-2 rounded-lg border border-line bg-surface-2/40 px-4 py-2 text-[13px] font-medium text-muted transition-all hover:border-line-strong hover:text-ink";
const btnGhost = "inline-flex items-center gap-1.5 rounded-lg border border-transparent px-2 py-1.5 text-[12px] font-medium text-muted transition-all hover:border-line hover:bg-surface-2 hover:text-ink";
const btnDanger = "inline-flex items-center gap-1.5 rounded-lg border border-transparent px-2 py-1.5 text-[12px] font-medium text-muted transition-all hover:border-danger/30 hover:bg-danger/5 hover:text-danger";

export default function PostsManagerPage() {
  const confirm = useConfirm();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<BlogPost>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    try {
      setLoading(true);
      setError(null);
      const result = await listContent("posts");
      setPosts(result.items as unknown as BlogPost[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load posts");
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

  function calculateReadingTime(content: string): string {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  }

  async function handleSave() {
    try {
      if (!formData.title || !formData.excerpt) {
        alert("Title and excerpt are required");
        return;
      }

      // Work on a copy so the form state is never mutated in place.
      const payload: Partial<BlogPost> = { ...formData };

      if (!payload.slug && payload.title) {
        payload.slug = generateSlug(payload.title);
      }

      if (payload.content) {
        payload.readingTime = calculateReadingTime(payload.content);
      }

      if (payload.isPublished && !payload.publishedAt) {
        payload.publishedAt = new Date().toISOString();
      }

      setSaving(true);

      if (editing) {
        await updateContent("posts", editing, payload as unknown as Record<string, unknown>);
      } else {
        // Respect the form's publish toggle on create.
        await createContent("posts", payload as Record<string, unknown>);
      }

      await loadPosts();
      setEditing(null);
      setCreating(false);
      setFormData({});
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save post");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const ok = await confirm({
      title: "Delete blog post?",
      message: "Are you sure you want to delete this blog post? This cannot be undone.",
      confirmLabel: "Delete",
      status: "danger",
    });
    if (!ok) return;
    try {
      await deleteContent("posts", id);
      await loadPosts();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete post");
    }
  }

  async function togglePublished(id: string, currentState: boolean) {
    try {
      const updates: Record<string, unknown> = { isPublished: !currentState };
      if (!currentState) {
        const post = posts.find((p) => p._id === id);
        if (post && !post.publishedAt) {
          updates.publishedAt = new Date().toISOString();
        }
      }
      await updateContent("posts", id, updates);
      setPosts((prev) =>
        prev.map((post) => (post._id === id ? { ...post, ...updates } : post))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update published status");
    }
  }

  function startEdit(post: BlogPost) {
    setEditing(post._id);
    setFormData(post);
    setCreating(false);
  }

  function startCreate() {
    setCreating(true);
    setEditing(null);
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      coverImageUrl: "",
      tags: [],
      category: "Tutorial",
      readingTime: "1 min read",
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
        <h1 className="mb-6 text-2xl font-bold text-ink">Blog Posts</h1>
        <LoadingState message="Loading posts..." />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-ink">Blog Posts</h1>
        <ErrorState message={error} retry={loadPosts} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Blog Posts</h1>
          <p className="mt-2 text-[14px] text-muted">
            Manage your blog content and articles
          </p>
        </div>
        <button type="button" onClick={startCreate} className={btnPrimary}>
          <Icon name="Plus" className="h-4 w-4" />
          New Post
        </button>
      </div>

      {/* Create/Edit Form */}
      {(creating || editing) && (
        <div className="mb-6 space-y-6">
          {/* Basic Info */}
          <DashboardCard icon="FileText" title="Post Information">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className={labelCls}>Post Title</label>
                <Input
                  className={inputCls}
                  placeholder="How to Build Amazing Projects with Next.js"
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
                  placeholder="how-to-build-amazing-projects"
                  value={formData.slug || ""}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
                <p className="text-[11px] text-faint">Auto-generated from title, but you can customize</p>
              </div>

              <div className="space-y-1">
                <label className={labelCls}>Excerpt</label>
                <TextArea
                  rows={4}
                  className={inputCls + " resize-none"}
                  placeholder="A brief summary of your post (shown in post cards)..."
                  value={formData.excerpt || ""}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                />
                <p className="text-[11px] text-faint">Keep it concise and engaging (150-200 characters recommended)</p>
              </div>

              <div className="space-y-1">
                <label className={labelCls}>Category</label>
                <Select
                  value={formData.category || "Tutorial"}
                  onChange={(next: unknown) => setFormData({ ...formData, category: String(next) })}
                  className={inputCls}
                >
                  {CATEGORIES.map((cat) => (
                    <ListBoxItem key={cat} value={cat}>{cat}</ListBoxItem>
                  ))}
                </Select>
              </div>

              <div className="space-y-1">
                <label className={labelCls}>Tags (comma-separated)</label>
                <TextArea
                  rows={2}
                  className={inputCls + " resize-none"}
                  placeholder="react, nextjs, typescript, tutorial"
                  value={formData.tags?.join(", ") || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tags: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>
            </div>
          </DashboardCard>

          {/* Cover Image */}
          <DashboardCard icon="Image" title="Cover Image">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className={labelCls}>Cover Image URL</label>
                <Input
                  className={inputCls}
                  placeholder="https://i.ibb.co/..."
                  value={formData.coverImageUrl || ""}
                  onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                />
                <p className="text-[11px] text-faint">Upload via Media Library and paste URL here (recommended: 1200x630px)</p>
              </div>
              {formData.coverImageUrl && (
                <div className="relative aspect-video overflow-hidden rounded-lg border border-line/50 bg-surface-2">
                  <img
                    src={formData.coverImageUrl}
                    alt="Cover preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>
          </DashboardCard>

          {/* Content */}
          <DashboardCard icon="FileEdit" title="Post Content">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className={labelCls}>Content</label>
                <TextArea
                  rows={15}
                  className={inputCls + " resize-y"}
                  placeholder={"Write your post content here...\n\nYou can use plain text or markdown formatting.\n\n## Heading\n**Bold text**\n*Italic text*\n- List item"}
                  value={formData.content || ""}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
                <p className="text-[11px] text-faint">
                  {(formData.content || "").split(/\s+/).length} words • {calculateReadingTime(formData.content || "")}
                </p>
              </div>
              <p className="text-[12px] text-muted">
                💡 Tip: Use markdown syntax for formatting. Reading time is calculated automatically.
              </p>
            </div>
          </DashboardCard>

          {/* SEO */}
          <DashboardCard icon="Search" title="SEO Settings">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className={labelCls}>SEO Title (optional)</label>
                <Input
                  className={inputCls}
                  placeholder="Custom title for search engines (defaults to post title)"
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
                  placeholder="Custom description for search engines and social sharing"
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

          {/* Publishing */}
          <DashboardCard icon="Send" title="Publishing">
            <div className="space-y-4">
              <Switch
                isSelected={formData.isPublished || false}
                onChange={(isSelected) => setFormData({ ...formData, isPublished: isSelected })}
              />
              {formData.isPublished && (
                <span className="text-[12px] font-medium text-ink">Published</span>
              )}
              {!formData.isPublished && (
                <span className="text-[12px] font-medium text-ink">Draft</span>
              )}
              {formData.publishedAt && (
                <p className="text-[12px] text-muted">
                  Published: {new Date(formData.publishedAt).toLocaleString()}
                </p>
              )}
            </div>
          </DashboardCard>

          {/* Actions */}
          <div className="flex gap-3">
            <button type="button" onClick={handleSave} disabled={saving} className={btnPrimary + " px-6 py-2.5 text-[14px]"}>
              {saving ? "Saving..." : editing ? "Update Post" : "Create Post"}
            </button>
            <button type="button" onClick={cancelEdit} className={btnSecondary + " px-6 py-2.5 text-[14px]"}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Posts List */}
      {!creating && !editing && (
        <>
          {posts.length === 0 ? (
            <EmptyState
              icon="FileText"
              title="No blog posts yet"
              description="Create your first blog post to share your knowledge"
              action={
                <button type="button" onClick={startCreate} className={btnPrimary}>
                  Write Your First Post
                </button>
              }
            />
          ) : (
            <div className="space-y-4">
              {posts
                .sort((a, b) => {
                  const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
                  const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
                  return dateB - dateA;
                })
                .map((post) => (
                  <DashboardCard key={post._id} hover>
                    <div className="flex flex-col gap-4 sm:flex-row">
                      {/* Cover Image */}
                      {post.coverImageUrl && (
                        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-surface-2 sm:w-48 shrink-0">
                          <img
                            src={post.coverImageUrl}
                            alt={post.title}
                            className="h-full w-full object-cover"
                          />
                          {!post.isPublished && (
                            <span className="absolute right-2 top-2 rounded-full bg-muted/90 px-2 py-1 text-[10px] font-bold text-white">
                              DRAFT
                            </span>
                          )}
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-3">
                        <div>
                          <h3 className="font-semibold text-[15px] text-ink line-clamp-2">
                            {post.title}
                          </h3>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted">
                            <span>{post.category}</span>
                            <span>•</span>
                            <span>{post.readingTime}</span>
                            {post.publishedAt && (
                              <>
                                <span>•</span>
                                <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                              </>
                            )}
                          </div>
                          <p className="mt-2 text-[13px] text-muted line-clamp-2">
                            {post.excerpt}
                          </p>
                          {post.tags && post.tags.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {post.tags.slice(0, 5).map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="rounded-md bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent ring-1 ring-accent/20"
                                >
                                  #{tag}
                                </span>
                              ))}
                              {post.tags.length > 5 && (
                                <span className="text-[10px] text-muted">
                                  +{post.tags.length - 5} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 border-t border-line/50 pt-3">
                          <div className="flex items-center gap-2">
                            <Switch
                              isSelected={post.isPublished}
                              onChange={() => togglePublished(post._id, post.isPublished)}
                            />
                            <span className="text-[12px] font-medium text-ink">Published</span>
                          </div>
                          <div className="flex-1" />
                          <button type="button" onClick={() => startEdit(post)} className={btnGhost}>
                            <Icon name="Pencil" className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button type="button" onClick={() => handleDelete(post._id)} className={btnDanger}>
                            <Icon name="Trash2" className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
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
        <DashboardCard className="mt-8" icon="Lightbulb" title="Blogging Tips">
          <ul className="space-y-2 text-[13px] text-muted">
            <li className="flex gap-2">
              <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
              <span>Write <strong className="text-ink">compelling titles</strong> that grab attention</span>
            </li>
            <li className="flex gap-2">
              <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
              <span>Use <strong className="text-ink">clear headings</strong> to structure your content</span>
            </li>
            <li className="flex gap-2">
              <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
              <span>Add <strong className="text-ink">relevant tags</strong> to improve discoverability</span>
            </li>
            <li className="flex gap-2">
              <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
              <span>Include <strong className="text-ink">cover images</strong> for better engagement (1200x630px)</span>
            </li>
          </ul>
        </DashboardCard>
      )}
    </div>
  );
}
