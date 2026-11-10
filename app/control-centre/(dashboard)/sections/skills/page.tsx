"use client";

import { useEffect, useState } from "react";
import { DashboardCard, LoadingState, ErrorState, EmptyState } from "@/components/admin/dashboard-card";
import { Icon } from "@/components/ui/icon";
import { listContent, updateContent } from "@/lib/admin";

interface Skill {
  id: string;
  name: string;
  icon: string;
  brandColor: string;
  proficiency: "learning" | "familiar" | "advanced" | "expert";
}

interface SkillGroup {
  category: string;
  skills: Skill[];
}

const PROFICIENCY_OPTIONS = [
  { value: "learning", label: "Learning" },
  { value: "familiar", label: "Familiar" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
];

const inputCls = "w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30";
const labelCls = "block text-[12px] font-medium text-muted";
const btnPrimary = "inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/15 px-4 py-2 text-[13px] font-medium text-accent transition-all hover:bg-accent/25 disabled:opacity-60";
const btnOutline = "inline-flex items-center gap-2 rounded-lg border border-line bg-surface-2/40 px-3 py-1.5 text-[12px] font-medium text-muted transition-all hover:border-line-strong hover:text-ink";
const btnGhost = "inline-flex items-center gap-1.5 rounded-lg border border-transparent px-2 py-1.5 text-[12px] font-medium text-muted transition-all hover:border-line hover:bg-surface-2 hover:text-ink";
const btnDanger = "inline-flex items-center gap-1.5 rounded-lg border border-transparent px-2 py-1.5 text-[12px] font-medium text-muted transition-all hover:border-danger/30 hover:bg-danger/5 hover:text-danger";

export default function SkillsManagerPage() {
  const [skillGroups, setSkillGroups] = useState<SkillGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    loadSkills();
  }, []);

  async function loadSkills() {
    try {
      setLoading(true);
      setError(null);
      const result = await listContent("skills");
      setSkillGroups(result.items as unknown as SkillGroup[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load skills");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      setSuccess(false);
      for (const group of skillGroups) {
        await updateContent("skills", group.category, group as unknown as Record<string, unknown>);
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save skills");
    } finally {
      setSaving(false);
    }
  }

  function addCategory() {
    if (!newCategoryName.trim()) {
      alert("Please enter a category name");
      return;
    }
    const exists = skillGroups.some(
      (g) => g.category.toLowerCase() === newCategoryName.toLowerCase()
    );
    if (exists) {
      alert("This category already exists");
      return;
    }
    setSkillGroups([...skillGroups, { category: newCategoryName.trim(), skills: [] }]);
    setNewCategoryName("");
  }

  function removeCategory(category: string) {
    if (!confirm(`Delete the "${category}" category and all its skills?`)) return;
    setSkillGroups(skillGroups.filter((g) => g.category !== category));
  }

  function renameCategory(oldCategory: string, newCategory: string) {
    if (!newCategory.trim()) return;
    setSkillGroups(
      skillGroups.map((g) =>
        g.category === oldCategory ? { ...g, category: newCategory.trim() } : g
      )
    );
    setEditingCategory(null);
  }

  function addSkill(category: string) {
    setSkillGroups(
      skillGroups.map((g) =>
        g.category === category
          ? {
              ...g,
              skills: [
                ...g.skills,
                {
                  id: `skill-${Date.now()}`,
                  name: "",
                  icon: "SiReact",
                  brandColor: "#61DAFB",
                  proficiency: "familiar" as const,
                },
              ],
            }
          : g
      )
    );
  }

  function updateSkill(category: string, skillId: string, updates: Partial<Skill>) {
    setSkillGroups(
      skillGroups.map((g) =>
        g.category === category
          ? {
              ...g,
              skills: g.skills.map((s) =>
                s.id === skillId ? { ...s, ...updates } : s
              ),
            }
          : g
      )
    );
  }

  function removeSkill(category: string, skillId: string) {
    setSkillGroups(
      skillGroups.map((g) =>
        g.category === category
          ? { ...g, skills: g.skills.filter((s) => s.id !== skillId) }
          : g
      )
    );
  }

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-ink">Skills</h1>
        <LoadingState message="Loading skills..." />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-ink">Skills</h1>
        <ErrorState message={error} retry={loadSkills} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">Skills & Technologies</h1>
        <p className="mt-2 text-[14px] text-muted">
          Manage your technical skills organized by category
        </p>
      </div>

      {/* Add Category */}
      <DashboardCard className="mb-6" icon="FolderPlus" title="Add New Category">
        <div className="flex gap-3">
          <input
            type="text"
            className={inputCls}
            placeholder="e.g., Frontend, Backend, DevOps, Tools"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCategory()}
          />
          <button type="button" onClick={addCategory} className={btnPrimary + " shrink-0"}>
            <Icon name="Plus" className="h-4 w-4" />
            Add Category
          </button>
        </div>
      </DashboardCard>

      {/* Skill Groups */}
      {skillGroups.length === 0 ? (
        <EmptyState
          icon="Code"
          title="No skill categories yet"
          description="Add your first skill category to start organizing your technical skills"
          action={
            <button type="button" onClick={() => setNewCategoryName("Frontend")} className={btnPrimary}>
              Add Your First Category
            </button>
          }
        />
      ) : (
        <div className="space-y-6">
          {skillGroups.map((group) => (
            <DashboardCard
              key={group.category}
              icon="Folder"
              title={group.category}
              description={`${group.skills.length} skills`}
              action={
                <div className="flex items-center gap-2">
                  {editingCategory === group.category ? (
                    <input
                      type="text"
                      className="rounded-lg border border-accent/40 bg-surface-2/40 px-2 py-1 text-[12px] text-ink focus:border-accent/50 focus:outline-none"
                      defaultValue={group.category}
                      autoFocus
                      onBlur={(e) => renameCategory(group.category, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          renameCategory(group.category, (e.target as HTMLInputElement).value);
                        }
                        if (e.key === "Escape") setEditingCategory(null);
                      }}
                    />
                  ) : (
                    <button type="button" onClick={() => setEditingCategory(group.category)} className={btnGhost}>
                      <Icon name="Edit" className="h-3.5 w-3.5" /> Rename
                    </button>
                  )}
                  <button type="button" onClick={() => removeCategory(group.category)} className={btnDanger}>
                    <Icon name="Trash2" className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              }
            >
              <div className="space-y-3">
                {group.skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="flex items-start gap-3 rounded-lg border border-line/50 bg-surface/30 p-3"
                  >
                    {/* Color Picker */}
                    <input
                      type="color"
                      value={skill.brandColor}
                      onChange={(e) =>
                        updateSkill(group.category, skill.id, { brandColor: e.target.value })
                      }
                      className="h-10 w-10 cursor-pointer rounded-lg border border-line shrink-0"
                      title="Brand color"
                    />

                    {/* Fields */}
                    <div className="flex-1 grid gap-3 sm:grid-cols-3">
                      <div className="space-y-1">
                        <label className={labelCls}>Skill Name</label>
                        <input
                          type="text"
                          className={inputCls}
                          placeholder="React, Node.js, Docker"
                          value={skill.name}
                          onChange={(e) =>
                            updateSkill(group.category, skill.id, { name: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <label className={labelCls}>Icon (Simple Icons)</label>
                        <input
                          type="text"
                          className={inputCls}
                          placeholder="SiReact, SiNodedotjs"
                          value={skill.icon}
                          onChange={(e) =>
                            updateSkill(group.category, skill.id, { icon: e.target.value })
                          }
                        />
                        <p className="text-[11px] text-faint">From react-icons/si</p>
                      </div>
                      <div className="space-y-1">
                        <label className={labelCls}>Proficiency</label>
                        <select
                          className={inputCls}
                          value={skill.proficiency}
                          onChange={(e) =>
                            updateSkill(group.category, skill.id, {
                              proficiency: e.target.value as Skill["proficiency"],
                            })
                          }
                        >
                          {PROFICIENCY_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => removeSkill(group.category, skill.id)}
                      aria-label="Remove skill"
                      className={btnDanger + " shrink-0 p-1.5"}
                    >
                      <Icon name="X" className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {/* Add Skill Button */}
                <button
                  type="button"
                  onClick={() => addSkill(group.category)}
                  className={btnOutline + " w-full justify-center"}
                >
                  <Icon name="Plus" className="h-4 w-4" />
                  Add Skill to {group.category}
                </button>
              </div>
            </DashboardCard>
          ))}
        </div>
      )}

      {/* Save Button */}
      <div className="mt-8 flex items-center gap-3">
        <button type="button" onClick={handleSave} disabled={saving} className={btnPrimary + " px-6 py-2.5 text-[14px]"}>
          {saving ? (
            "Saving..."
          ) : (
            <>
              <Icon name="Save" className="h-4 w-4" />
              Save All Changes
            </>
          )}
        </button>

        {success && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-[13px] font-medium text-emerald-500">
            <Icon name="CheckCircle" className="h-4 w-4" />
            <span>Skills saved successfully!</span>
          </div>
        )}
      </div>

      {/* Tips */}
      <DashboardCard className="mt-8" icon="Lightbulb" title="Skills Tips">
        <ul className="space-y-2 text-[13px] text-muted">
          <li className="flex gap-2">
            <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
            <span>
              Use <strong className="text-ink">Simple Icons</strong> names (e.g., SiReact, SiNodedotjs)
              from <a href="https://react-icons.github.io/react-icons/icons/si/" target="_blank" rel="noopener" className="text-accent hover:underline">react-icons/si</a>
            </span>
          </li>
          <li className="flex gap-2">
            <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
            <span>Use <strong className="text-ink">brand colors</strong> matching official technology branding</span>
          </li>
          <li className="flex gap-2">
            <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
            <span>Organize skills into <strong className="text-ink">logical categories</strong> like Frontend, Backend, DevOps</span>
          </li>
          <li className="flex gap-2">
            <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
            <span>Set accurate <strong className="text-ink">proficiency levels</strong> to reflect your expertise</span>
          </li>
        </ul>
      </DashboardCard>
    </div>
  );
}
