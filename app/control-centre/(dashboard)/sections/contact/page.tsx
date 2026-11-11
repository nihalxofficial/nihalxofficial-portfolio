"use client";

import { useEffect, useState } from "react";
import { DashboardCard, LoadingState, ErrorState } from "@/components/admin/dashboard-card";
import { Icon } from "@/components/ui/icon";
import { updateContent, listContent } from "@/lib/admin";
import { loadSettings } from "@/components/admin/settings/settings-utils";
import { CmsSwitch } from "@/components/admin/ui";

interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
}

interface ContactData {
  _id: string;
  contact?: {
    email?: string;
    phone?: string;
    location?: string;
    availability?: string;
  };
  socialLinks?: SocialLink[];
}

interface SectionMeta {
  _id: string;
  key: string;
  isVisible: boolean;
}

const SOCIAL_PLATFORMS = [
  { value: "github", label: "GitHub", icon: "Github" },
  { value: "linkedin", label: "LinkedIn", icon: "Linkedin" },
  { value: "twitter", label: "Twitter / X", icon: "Twitter" },
  { value: "instagram", label: "Instagram", icon: "Instagram" },
  { value: "youtube", label: "YouTube", icon: "Youtube" },
  { value: "discord", label: "Discord", icon: "MessageCircle" },
  { value: "facebook", label: "Facebook", icon: "Facebook" },
  { value: "dribbble", label: "Dribbble", icon: "Dribbble" },
  { value: "devto", label: "Dev.to", icon: "Code2" },
  { value: "medium", label: "Medium", icon: "BookOpen" },
  { value: "website", label: "Website", icon: "Globe" },
  { value: "other", label: "Other", icon: "Link" },
];

const inputCls =
  "w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30";
const labelCls = "block text-[12px] font-medium text-muted";

function Field({ label, children, description }: { label: string; children: React.ReactNode; description?: string }) {
  return (
    <div className="space-y-1">
      <label className={labelCls}>{label}</label>
      {children}
      {description && <p className="text-[11px] text-faint">{description}</p>}
    </div>
  );
}

export default function ContactManagementPage() {
  const [data, setData] = useState<ContactData | null>(null);
  const [sectionMeta, setSectionMeta] = useState<SectionMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [addingLink, setAddingLink] = useState(false);
  const [newSocial, setNewSocial] = useState<{ platform: string; url: string }>({ platform: "github", url: "" });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      setLoading(true); setError(null);
      const [settingsData, sectionsResult] = await Promise.all([
        loadSettings(),
        listContent("sections", { limit: 100 }),
      ]);
      const settings = settingsData as unknown as ContactData & { socialLinks?: SocialLink[] };
      setData({
        _id: String(settings._id ?? "current"),
        contact: settings.contact ?? {},
        socialLinks: Array.isArray(settings.socialLinks) ? settings.socialLinks : [],
      });
      const contactSection = (sectionsResult.items as unknown as SectionMeta[]).find((s) => s.key === "contact");
      if (contactSection) setSectionMeta(contactSection);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally { setLoading(false); }
  }

  async function handleSave() {
    if (!data) return;
    try {
      setSaving(true); setSuccess(false);
      await updateContent("settings", data._id || "current", data as unknown as Record<string, unknown>);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Save failed");
    } finally { setSaving(false); }
  }

  async function toggleVisibility() {
    if (!sectionMeta) return;
    await updateContent("sections", sectionMeta._id, { isVisible: !sectionMeta.isVisible });
    setSectionMeta((prev) => prev ? { ...prev, isVisible: !prev.isVisible } : prev);
  }

  function updateContact(field: string, value: string) {
    if (!data) return;
    setData({ ...data, contact: { ...data.contact, [field]: value } });
  }

  function addSocialLink() {
    if (!data || !newSocial.url) return;
    const platform = SOCIAL_PLATFORMS.find((p) => p.value === newSocial.platform);
    setData({ ...data, socialLinks: [...(data.socialLinks ?? []), { ...newSocial, icon: platform?.icon ?? "Link" }] });
    setNewSocial({ platform: "github", url: "" });
    setAddingLink(false);
  }

  function updateSocial(index: number, field: keyof SocialLink, value: string) {
    if (!data) return;
    const updated = [...(data.socialLinks ?? [])];
    updated[index] = { ...updated[index], [field]: value };
    if (field === "platform") updated[index].icon = SOCIAL_PLATFORMS.find((p) => p.value === value)?.icon ?? "Link";
    setData({ ...data, socialLinks: updated });
  }

  function removeSocial(index: number) {
    if (!data) return;
    const updated = [...(data.socialLinks ?? [])];
    updated.splice(index, 1);
    setData({ ...data, socialLinks: updated });
  }

  if (loading) return <div><h1 className="mb-6 text-2xl font-bold text-ink">Contact Section</h1><LoadingState message="Loading contact settings..." /></div>;
  if (error || !data) return <div><h1 className="mb-6 text-2xl font-bold text-ink">Contact Section</h1><ErrorState message={error || "Not found"} retry={loadData} /></div>;

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Contact Section</h1>
          <p className="mt-2 text-[14px] text-muted">Manage contact details, social links, and section visibility</p>
        </div>
        {sectionMeta && (
          <div className="flex items-center gap-2 rounded-lg border border-line bg-surface-2/40 px-3 py-2">
            <span className="text-[12px] text-muted">Visible</span>
            <CmsSwitch checked={sectionMeta.isVisible} onChange={() => void toggleVisibility()} label="Contact visibility" size="sm" />
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Contact Details */}
        <DashboardCard icon="Mail" title="Contact Details" description="Your contact information shown to visitors">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email Address">
              <input type="email" className={inputCls} placeholder="hello@example.com" value={data.contact?.email ?? ""} onChange={(e) => updateContact("email", e.target.value)} />
            </Field>
            <Field label="Phone Number">
              <input type="tel" className={inputCls} placeholder="+1 (555) 123-4567" value={data.contact?.phone ?? ""} onChange={(e) => updateContact("phone", e.target.value)} />
            </Field>
            <Field label="Location">
              <input type="text" className={inputCls} placeholder="Dhaka, Bangladesh" value={data.contact?.location ?? ""} onChange={(e) => updateContact("location", e.target.value)} />
            </Field>
            <Field label="Availability Status">
              <input type="text" className={inputCls} placeholder="Available for hire" value={data.contact?.availability ?? ""} onChange={(e) => updateContact("availability", e.target.value)} />
            </Field>
          </div>
        </DashboardCard>

        {/* Social Links */}
        <DashboardCard icon="Share2" title="Social Links" description="Profile links shown in contact section and footer">
          <div className="space-y-3">
            {(data.socialLinks ?? []).length === 0 && !addingLink && (
              <p className="rounded-lg border border-dashed border-line py-6 text-center text-[13px] text-faint">No social links added yet</p>
            )}

            {(data.socialLinks ?? []).map((link, i) => {
              const p = SOCIAL_PLATFORMS.find((x) => x.value === link.platform);
              return (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-line bg-surface-2/30 px-3 py-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-accent/10 text-accent">
                    <Icon name={p?.icon ?? "Link"} className="h-4 w-4" />
                  </div>
                  <select
                    className="w-36 shrink-0 rounded-lg border border-line bg-surface-2/40 px-2 py-1.5 text-[12px] text-ink focus:border-accent/50 focus:outline-none"
                    value={link.platform}
                    onChange={(e) => updateSocial(i, "platform", e.target.value)}
                  >
                    {SOCIAL_PLATFORMS.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
                  </select>
                  <input
                    type="url"
                    className="min-w-0 flex-1 rounded-lg border border-line bg-surface-2/40 px-3 py-1.5 text-[12px] text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                    placeholder="https://..."
                    value={link.url}
                    onChange={(e) => updateSocial(i, "url", e.target.value)}
                  />
                  <button type="button" onClick={() => removeSocial(i)} className="inline-flex items-center rounded-lg border border-transparent p-1.5 text-muted transition-all hover:border-danger/30 hover:bg-danger/5 hover:text-danger">
                    <Icon name="Trash2" className="h-4 w-4" />
                  </button>
                </div>
              );
            })}

            {addingLink && (
              <div className="rounded-lg border border-accent/20 bg-accent/5 p-3">
                <p className="mb-3 text-[12px] font-semibold text-accent">New Social Link</p>
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    className="w-40 shrink-0 rounded-lg border border-line bg-surface-2/40 px-2 py-2 text-[13px] text-ink focus:border-accent/50 focus:outline-none"
                    value={newSocial.platform}
                    onChange={(e) => setNewSocial((prev) => ({ ...prev, platform: e.target.value }))}
                  >
                    {SOCIAL_PLATFORMS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                  <input
                    type="url"
                    className="min-w-0 flex-1 rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                    placeholder="https://github.com/username"
                    value={newSocial.url}
                    onChange={(e) => setNewSocial((prev) => ({ ...prev, url: e.target.value }))}
                  />
                  <div className="flex shrink-0 gap-2">
                    <button type="button" onClick={addSocialLink} disabled={!newSocial.url} className="inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/15 px-3 py-2 text-[13px] font-medium text-accent transition-all hover:bg-accent/25 disabled:opacity-50">
                      <Icon name="Plus" className="h-4 w-4" />Add
                    </button>
                    <button type="button" onClick={() => setAddingLink(false)} className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] font-medium text-muted transition-all hover:text-ink">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!addingLink && (
              <button type="button" onClick={() => setAddingLink(true)} className="inline-flex items-center gap-2 rounded-lg border border-dashed border-accent/40 px-4 py-2 text-[13px] font-medium text-accent transition-all hover:border-accent hover:bg-accent/5">
                <Icon name="Plus" className="h-4 w-4" />Add Social Link
              </button>
            )}
          </div>
        </DashboardCard>

        {/* Preview */}
        <DashboardCard icon="Eye" title="Preview" description="How your contact info appears to visitors">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { key: "email", label: "Email", icon: "Mail", value: data.contact?.email },
              { key: "phone", label: "Phone", icon: "Phone", value: data.contact?.phone },
              { key: "location", label: "Location", icon: "MapPin", value: data.contact?.location },
              { key: "availability", label: "Status", icon: "CheckCircle", value: data.contact?.availability },
            ].filter((f) => f.value).map((f) => (
              <div key={f.key} className="flex items-center gap-3 rounded-lg border border-line/50 bg-surface-2/30 px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/20 bg-accent/10 text-accent">
                  <Icon name={f.icon} className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] text-faint">{f.label}</p>
                  <p className="text-[13px] font-medium text-ink">{f.value}</p>
                </div>
              </div>
            ))}
          </div>
          {(data.socialLinks ?? []).length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-line/50 pt-4">
              {(data.socialLinks ?? []).map((link, i) => {
                const p = SOCIAL_PLATFORMS.find((x) => x.value === link.platform);
                return (
                  <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-[12px] font-medium text-accent">
                    <Icon name={p?.icon ?? "Link"} className="h-3.5 w-3.5" />{p?.label ?? link.platform}
                  </span>
                );
              })}
            </div>
          )}
        </DashboardCard>

        {/* Save Bar */}
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => void handleSave()} disabled={saving} className="inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/15 px-5 py-2.5 text-[14px] font-medium text-accent transition-all hover:bg-accent/25 disabled:opacity-60">
            {saving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent/30 border-t-accent" /> : <Icon name="Save" className="h-4 w-4" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {success && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-[13px] font-medium text-emerald-500">
              <Icon name="CheckCircle" className="h-4 w-4" /><span>Contact settings saved!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
