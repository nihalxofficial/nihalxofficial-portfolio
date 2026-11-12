"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { DashboardCard } from "@/components/admin/dashboard-card";
import { CmsSwitch } from "@/components/admin/ui";
import { Icon } from "@/components/ui/icon";
import { createContent } from "@/lib/admin";
import { uploadImageFile } from "@/components/admin/settings/settings-utils";

const CATEGORIES = [
  "Full-Stack System",
  "Web Application",
  "Mobile App",
  "E-Commerce",
  "Dashboard",
  "Portfolio",
  "API / Backend",
  "Cloud & DevOps",
  "AI / ML Tool",
  "Other",
];

const inputCls =
  "dashboard-input w-full rounded-lg border border-line bg-surface-2/60 px-3.5 py-2.5 text-[13px] text-ink placeholder:text-slate-500 outline-none transition-all focus:border-accent/60 focus:ring-1 focus:ring-accent/20";
const labelCls = "font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5";
const helperCls = "font-mono text-[10px] text-slate-500 mt-1 block";

export function ProjectAddPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Web Application");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [newScreenshotUrl, setNewScreenshotUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [techStack, setTechStack] = useState<string[]>([]);
  const [techInput, setTechInput] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState("");
  const [challenges, setChallenges] = useState("");
  const [improvements, setImprovements] = useState("");

  function handleTitleChange(val: string) {
    setTitle(val);
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(val));
    }
  }

  function generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function addTech() {
    const trimmed = techInput.trim();
    if (trimmed && !techStack.includes(trimmed)) {
      setTechStack([...techStack, trimmed]);
      setTechInput("");
    }
  }

  function removeTech(index: number) {
    setTechStack(techStack.filter((_, i) => i !== index));
  }

  function addFeature() {
    const trimmed = featureInput.trim();
    if (trimmed && !features.includes(trimmed)) {
      setFeatures([...features, trimmed]);
      setFeatureInput("");
    }
  }

  function removeFeature(index: number) {
    setFeatures(features.filter((_, i) => i !== index));
  }

  function addScreenshotUrl() {
    const trimmed = newScreenshotUrl.trim();
    if (trimmed && !screenshots.includes(trimmed)) {
      setScreenshots([...screenshots, trimmed]);
      setNewScreenshotUrl("");
    }
  }

  function removeScreenshot(index: number) {
    setScreenshots(screenshots.filter((_, i) => i !== index));
  }

  async function handleThumbnailUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingThumb(true);
      setError(null);
      const url = await uploadImageFile(file, "projects", "thumbnail");
      setThumbnailUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Thumbnail upload failed");
    } finally {
      setUploadingThumb(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleScreenshotUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingScreenshot(true);
      setError(null);
      const url = await uploadImageFile(file, "projects", "screenshot");
      setScreenshots((prev) => [...prev, url]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Screenshot upload failed");
    } finally {
      setUploadingScreenshot(false);
      if (screenshotInputRef.current) screenshotInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      setError("Project title is required");
      return;
    }
    if (!shortDescription.trim()) {
      setError("Short description is required");
      return;
    }

    setSaving(true);
    setError(null);

    const projectPayload = {
      title: title.trim(),
      slug: slug.trim() || generateSlug(title),
      category,
      shortDescription: shortDescription.trim(),
      description: description.trim(),
      thumbnailUrl: thumbnailUrl.trim(),
      screenshots,
      liveUrl: liveUrl.trim(),
      sourceUrl: sourceUrl.trim(),
      techStack,
      features,
      challenges: challenges.trim(),
      improvements: improvements.trim(),
      isFeatured,
      isPublished,
      order: 0,
    };

    try {
      await createContent("projects", projectPayload);
      router.push("/control-centre/sections/projects");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-2 font-mono text-xs">
            <span className="text-acc tracking-widest uppercase">{"// protocol · project deployment engine"}</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-mono text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              READY
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Create <span className="text-grad">New Project</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Configure metadata, screenshots, tech stack, and publish directly to your live portfolio.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/control-centre/sections/projects"
            className="btn-ghost !rounded-xl flex items-center gap-2 px-4 py-2 text-xs font-mono font-medium text-slate-300 hover:text-white"
          >
            <Icon name="ArrowLeft" className="h-3.5 w-3.5" />
            <span>Cancel</span>
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold disabled:opacity-60"
          >
            {saving ? (
              <>
                <Icon name="Loader" className="h-4 w-4 animate-spin" />
                <span>Deploying…</span>
              </>
            ) : (
              <>
                <Icon name="Check" className="h-4 w-4" />
                <span>Deploy Project</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="hud !rounded-xl !border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300 flex items-center gap-3">
          <Icon name="AlertTriangle" className="h-5 w-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid: Left Column (Core Info) & Right Column (Assets & Links) */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2 Cols) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Core Info Card */}
          <DashboardCard icon="FolderCode" title="Project Identity" description="Title, slug, category, and overview">
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>
                    Title <span className="text-acc">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Distributed Task Orchestrator"
                    className={inputCls}
                  />
                  <span className={helperCls}>Primary project headline</span>
                </div>

                <div>
                  <label className={labelCls}>
                    URL Slug <span className="text-acc">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. task-orchestrator"
                    className={inputCls}
                  />
                  <span className={helperCls}>Unique route identifier</span>
                </div>
              </div>

              <div>
                <label className={labelCls}>Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`${inputCls} cursor-pointer appearance-none bg-surface-2/80`}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-surface text-ink">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>
                  Short Description <span className="text-acc">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={300}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="A high-performance asynchronous job queue built with Go and Redis..."
                  className={inputCls}
                />
                <div className="flex justify-between items-center mt-1">
                  <span className={helperCls}>Summary card teaser</span>
                  <span className="font-mono text-[10px] text-slate-500">{shortDescription.length}/300</span>
                </div>
              </div>

              <div>
                <label className={labelCls}>Full Case Study & Description</label>
                <textarea
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed breakdown of architecture, technical challenges, and implementation details..."
                  className={`${inputCls} resize-y min-h-[140px]`}
                />
                <span className={helperCls}>Supports markdown formatting</span>
              </div>
            </div>
          </DashboardCard>

          {/* Technical Architecture */}
          <DashboardCard icon="Cpu" title="Tech Stack & Features" description="Technologies, key capabilities, and problem-solving">
            <div className="space-y-5">
              {/* Tech Stack Tags */}
              <div>
                <label className={labelCls}>Tech Stack Tags</label>
                <div className="flex gap-2 mb-2.5">
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTech();
                      }
                    }}
                    placeholder="e.g. Next.js 15, PostgreSQL, Docker..."
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={addTech}
                    className="btn-ghost !rounded-lg px-4 text-xs font-mono font-semibold"
                  >
                    Add
                  </button>
                </div>
                {techStack.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {techStack.map((tech, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-acc/30 bg-acc/10 px-2.5 py-1 font-mono text-[11px] text-acc"
                      >
                        {tech}
                        <button
                          type="button"
                          onClick={() => removeTech(idx)}
                          className="hover:text-white transition-colors"
                        >
                          <Icon name="X" className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="font-mono text-[11px] text-slate-500">No technologies added yet.</p>
                )}
              </div>

              {/* Key Features */}
              <div>
                <label className={labelCls}>Key Features</label>
                <div className="flex gap-2 mb-2.5">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addFeature();
                      }
                    }}
                    placeholder="e.g. Real-time WebSocket event synchronization"
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="btn-ghost !rounded-lg px-4 text-xs font-mono font-semibold"
                  >
                    Add
                  </button>
                </div>
                {features.length > 0 ? (
                  <ul className="space-y-1.5">
                    {features.map((feat, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-xs text-ink"
                      >
                        <span className="flex items-center gap-2">
                          <Icon name="Check" className="h-3.5 w-3.5 text-acc" />
                          {feat}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFeature(idx)}
                          className="text-slate-500 hover:text-rose-400"
                        >
                          <Icon name="Trash2" className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="font-mono text-[11px] text-slate-500">No features specified yet.</p>
                )}
              </div>

              {/* Challenges & Improvements */}
              <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-white/5">
                <div>
                  <label className={labelCls}>Challenges & Solutions</label>
                  <textarea
                    rows={3}
                    value={challenges}
                    onChange={(e) => setChallenges(e.target.value)}
                    placeholder="Key architectural hurdles overcome during development..."
                    className={`${inputCls} resize-y`}
                  />
                </div>
                <div>
                  <label className={labelCls}>Planned Improvements</label>
                  <textarea
                    rows={3}
                    value={improvements}
                    onChange={(e) => setImprovements(e.target.value)}
                    placeholder="Upcoming milestones or feature roadmap..."
                    className={`${inputCls} resize-y`}
                  />
                </div>
              </div>
            </div>
          </DashboardCard>
        </div>

        {/* Right Column (1 Col) */}
        <div className="space-y-6">
          {/* Publication Status */}
          <DashboardCard icon="Radio" title="Deployment Status" description="Visibility & feature flags">
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-line bg-surface-2/40 p-3.5">
                <div>
                  <p className="text-[13px] font-bold text-white">Publish on Live Site</p>
                  <p className="font-mono text-[10.5px] text-slate-400">Visible to portfolio visitors</p>
                </div>
                <CmsSwitch label="Publish on live site" checked={isPublished} onChange={setIsPublished} size="sm" />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-line bg-surface-2/40 p-3.5">
                <div>
                  <p className="text-[13px] font-bold text-white">Featured Project</p>
                  <p className="font-mono text-[10.5px] text-slate-400">Highlights in hero showcase</p>
                </div>
                <CmsSwitch label="Featured project" checked={isFeatured} onChange={setIsFeatured} size="sm" />
              </div>
            </div>
          </DashboardCard>

          {/* Primary Thumbnail */}
          <DashboardCard icon="Image" title="Thumbnail Asset" description="Card cover image">
            <div className="space-y-3">
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-line bg-[#070d30] flex items-center justify-center">
                {thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumbnailUrl} alt="Thumbnail preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <Icon name="Image" className="mx-auto h-8 w-8 text-slate-600 mb-1" />
                    <span className="font-mono text-[10px] text-slate-500">No thumbnail selected</span>
                  </div>
                )}
                {uploadingThumb && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <span className="h-6 w-6 animate-spin rounded-full border-2 border-acc border-t-transparent" />
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleThumbnailUpload}
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingThumb}
                  className="btn-ghost !rounded-lg flex-1 py-2 text-xs font-mono font-medium flex items-center justify-center gap-1.5"
                >
                  <Icon name="Upload" className="h-3.5 w-3.5" />
                  <span>{uploadingThumb ? "Uploading…" : "Upload Image"}</span>
                </button>
              </div>

              <input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="Or paste direct image URL (https://…)"
                className={inputCls}
              />
            </div>
          </DashboardCard>

          {/* Screenshots Gallery */}
          <DashboardCard icon="Layers" title="Screenshots Gallery" description="Multi-angle showcase images">
            <div className="space-y-3">
              <input
                ref={screenshotInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleScreenshotUpload}
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => screenshotInputRef.current?.click()}
                  disabled={uploadingScreenshot}
                  className="btn-ghost !rounded-lg w-full py-2 text-xs font-mono font-medium flex items-center justify-center gap-1.5"
                >
                  <Icon name="Plus" className="h-3.5 w-3.5" />
                  <span>{uploadingScreenshot ? "Uploading…" : "Upload Screenshot"}</span>
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="url"
                  value={newScreenshotUrl}
                  onChange={(e) => setNewScreenshotUrl(e.target.value)}
                  placeholder="Or paste screenshot URL…"
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={addScreenshotUrl}
                  className="btn-ghost !rounded-lg px-3 text-xs font-mono font-semibold"
                >
                  Add
                </button>
              </div>

              {screenshots.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {screenshots.map((url, idx) => (
                    <div key={idx} className="group relative aspect-video rounded-lg overflow-hidden border border-line bg-surface-2/40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Screenshot ${idx + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeScreenshot(idx)}
                        className="absolute top-1 right-1 h-6 w-6 rounded bg-black/70 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <Icon name="Trash2" className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-mono text-[10.5px] text-slate-500">No screenshots added yet.</p>
              )}
            </div>
          </DashboardCard>

          {/* External Links */}
          <DashboardCard icon="ExternalLink" title="Deployment Links" description="Live site & source repository">
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Live Deployment URL</label>
                <div className="relative">
                  <input
                    type="url"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    placeholder="https://my-project.com"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Source Code URL</label>
                <div className="relative">
                  <input
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://github.com/username/project"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </form>
  );
}

