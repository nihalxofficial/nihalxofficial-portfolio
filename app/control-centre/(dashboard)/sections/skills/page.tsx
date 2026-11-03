"use client";

import { useEffect, useState } from "react";
import { DashboardCard, LoadingState, ErrorState, EmptyState } from "@/components/admin/dashboard-card";
import { Icon } from "@/components/ui/icon";
import { listContent, updateContent } from "@/lib/admin";
import { Input, Select, SelectItem, Button } from "@heroui/react";

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
  { value: "learning", label: "Learning", color: "hsl(0 0% 60%)" },
  { value: "familiar", label: "Familiar", color: "hsl(189 100% 50%)" },
  { value: "advanced", label: "Advanced", color: "hsl(142 76% 56%)" },
  { value: "expert", label: "Expert", color: "hsl(328 86% 58%)" },
];

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
      
      // Assuming skills endpoint accepts the full array
      // You might need to adjust based on your API structure
      for (const group of skillGroups) {
        // This is a simplified save - adjust based on your actual API
        await updateContent("skills", group.category, group);
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

    setSkillGroups([
      ...skillGroups,
      {
        category: newCategoryName.trim(),
        skills: [],
      },
    ]);
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
                  proficiency: "familiar",
                },
              ],
            }
          : g
      )
    );
  }

  function updateSkill(
    category: string,
    skillId: string,
    updates: Partial<Skill>
  ) {
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
          ? {
              ...g,
              skills: g.skills.filter((s) => s.id !== skillId),
            }
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
          <Input
            placeholder="e.g., Frontend, Backend, DevOps, Tools"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addCategory()}
          />
          <Button
            onPress={addCategory}
            color="primary"
            startContent={<Icon name="Plus" className="h-4 w-4" />}
          >
            Add Category
          </Button>
        </div>
      </DashboardCard>

      {/* Skill Groups */}
      {skillGroups.length === 0 ? (
        <EmptyState
          icon="Code"
          title="No skill categories yet"
          description="Add your first skill category to start organizing your technical skills"
          action={
            <Button onPress={() => setNewCategoryName("Frontend")}>
              Add Your First Category
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {skillGroups.map((group) => (
            <DashboardCard
              key={group.category}
              icon="Folder"
              title={
                editingCategory === group.category ? (
                  <Input
                    value={group.category}
                    onChange={(e) => renameCategory(group.category, e.target.value)}
                    onBlur={() => setEditingCategory(null)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        setEditingCategory(null);
                      }
                    }}
                    autoFocus
                    size="sm"
                  />
                ) : (
                  group.category
                )
              }
              description={`${group.skills.length} skills`}
              action={
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="light"
                    onPress={() => setEditingCategory(group.category)}
                    startContent={<Icon name="Edit" className="h-3.5 w-3.5" />}
                  >
                    Rename
                  </Button>
                  <Button
                    size="sm"
                    variant="light"
                    color="danger"
                    onPress={() => removeCategory(group.category)}
                    startContent={<Icon name="Trash2" className="h-3.5 w-3.5" />}
                  >
                    Delete
                  </Button>
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
                        updateSkill(group.category, skill.id, {
                          brandColor: e.target.value,
                        })
                      }
                      className="h-10 w-10 cursor-pointer rounded-lg border border-line shrink-0"
                      title="Brand color"
                    />

                    {/* Fields */}
                    <div className="flex-1 grid gap-3 sm:grid-cols-3">
                      <Input
                        size="sm"
                        placeholder="React, Node.js, Docker"
                        value={skill.name}
                        onChange={(e) =>
                          updateSkill(group.category, skill.id, {
                            name: e.target.value,
                          })
                        }
                        label="Skill Name"
                      />
                      <Input
                        size="sm"
                        placeholder="SiReact, SiNodedotjs"
                        value={skill.icon}
                        onChange={(e) =>
                          updateSkill(group.category, skill.id, {
                            icon: e.target.value,
                          })
                        }
                        label="Icon (Simple Icons)"
                        description="From react-icons/si"
                      />
                      <Select
                        size="sm"
                        label="Proficiency"
                        selectedKeys={[skill.proficiency]}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0] as Skill["proficiency"];
                          updateSkill(group.category, skill.id, {
                            proficiency: selected,
                          });
                        }}
                      >
                        {PROFICIENCY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>

                    {/* Remove Button */}
                    <Button
                      size="sm"
                      isIconOnly
                      variant="light"
                      color="danger"
                      onPress={() => removeSkill(group.category, skill.id)}
                      aria-label="Remove skill"
                    >
                      <Icon name="X" className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {/* Add Skill Button */}
                <Button
                  size="sm"
                  variant="bordered"
                  onPress={() => addSkill(group.category)}
                  startContent={<Icon name="Plus" className="h-4 w-4" />}
                  className="w-full"
                >
                  Add Skill to {group.category}
                </Button>
              </div>
            </DashboardCard>
          ))}
        </div>
      )}

      {/* Save Button */}
      <div className="mt-8 flex items-center gap-3">
        <Button
          onPress={handleSave}
          isLoading={saving}
          color="primary"
          size="lg"
          startContent={!saving ? <Icon name="Save" className="h-4 w-4" /> : undefined}
        >
          {saving ? "Saving..." : "Save All Changes"}
        </Button>

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
            <span>
              Use <strong className="text-ink">brand colors</strong> matching official technology branding
            </span>
          </li>
          <li className="flex gap-2">
            <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
            <span>
              Organize skills into <strong className="text-ink">logical categories</strong> like Frontend, Backend, DevOps
            </span>
          </li>
          <li className="flex gap-2">
            <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
            <span>
              Set accurate <strong className="text-ink">proficiency levels</strong> to reflect your expertise
            </span>
          </li>
        </ul>
      </DashboardCard>
    </div>
  );
}
