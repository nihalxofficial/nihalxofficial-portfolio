"use client";

import { useEffect, useState } from "react";
import { DashboardCard, LoadingState, ErrorState } from "@/components/admin/dashboard-card";
import { Icon } from "@/components/ui/icon";
import { FormAlert } from "@/components/admin/ui";
import { AdminApiError, readContent, updateContent } from "@/lib/admin";
import { Input, TextArea } from "@heroui/react";

interface FooterCopy {
  tagline: string;
  description: string;
  navigationHeading: string;
  elsewhereHeading: string;
  resumeLabel: string;
  ctaLabel: string;
  copyright: string;
  builtWith: string;
  stack: string[];
}

const inputCls =
  "w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30";
const labelCls = "block text-[12px] font-medium text-muted";

function Field({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className={labelCls}>{label}</label>
      {children}
      {description && <p className="text-[11px] text-faint">{description}</p>}
    </div>
  );
}

/** Every field is optional in the database; empty means "use the built-in default". */
function normaliseFooter(raw: Partial<FooterCopy> | undefined): FooterCopy {
  return {
    tagline: raw?.tagline ?? "",
    description: raw?.description ?? "",
    navigationHeading: raw?.navigationHeading ?? "",
    elsewhereHeading: raw?.elsewhereHeading ?? "",
    resumeLabel: raw?.resumeLabel ?? "",
    ctaLabel: raw?.ctaLabel ?? "",
    copyright: raw?.copyright ?? "",
    builtWith: raw?.builtWith ?? "",
    stack: Array.isArray(raw?.stack) ? raw.stack : [],
  };
}

export default function FooterManagementPage() {
  const [footer, setFooter] = useState<FooterCopy | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    void loadFooter();
  }, []);

  async function loadFooter() {
    try {
      setLoading(true);
      setError(null);
      // A site that has never been saved is a normal first run, not an error.
      const settings = await readContent("settings", "current").catch((cause: unknown) => {
        if (cause instanceof AdminApiError && cause.status === 404) return {} as Record<string, unknown>;
        throw cause;
      });
      setFooter(normaliseFooter(settings.footer as Partial<FooterCopy> | undefined));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load footer copy");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!footer) return;
    try {
      setSaving(true);
      setSuccess(false);
      setSaveError(null);
      await updateContent("settings", "current", { footer });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save footer copy");
    } finally {
      setSaving(false);
    }
  }

  function update<K extends keyof FooterCopy>(key: K, value: FooterCopy[K]) {
    setFooter((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-ink">Footer</h1>
        <LoadingState message="Loading footer copy..." />
      </div>
    );
  }

  if (error || !footer) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-ink">Footer</h1>
        <ErrorState message={error || "Footer copy is unavailable"} retry={loadFooter} />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Footer</h1>
          <p className="mt-2 text-[14px] text-muted">
            Footer copy, column headings and the bottom bar. Leave a field empty to use the built-in
            default.
          </p>
        </div>
        <a
          href="/#contact"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-[12px] font-medium text-muted transition-colors hover:border-accent/40 hover:text-accent"
        >
          <Icon name="Eye" className="h-4 w-4" />
          Preview
        </a>
      </div>

      <div className="space-y-6">
        <DashboardCard icon="Type" title="Brand & Tagline" description="Shown under the logo">
          <div className="space-y-4">
            <Field label="Tagline" description='Default: "Full-Stack Developer"'>
              <Input
                placeholder="Full-Stack Developer"
                value={footer.tagline}
                onChange={(e) => update("tagline", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field
              label="About text"
              description="Falls back to the Meta Description in Global Settings."
            >
              <TextArea
                rows={3}
                placeholder="Building fast, accessible products..."
                value={footer.description}
                onChange={(e) => update("description", e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>
        </DashboardCard>

        <DashboardCard icon="ListChecks" title="Link Columns" description="Headings and link labels">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Navigation column heading" description='Default: "Navigate"'>
              <Input
                placeholder="Navigate"
                value={footer.navigationHeading}
                onChange={(e) => update("navigationHeading", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Elsewhere column heading" description='Default: "Elsewhere"'>
              <Input
                placeholder="Elsewhere"
                value={footer.elsewhereHeading}
                onChange={(e) => update("elsewhereHeading", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Résumé link label" description='Default: "Résumé / CV"'>
              <Input
                placeholder="Résumé / CV"
                value={footer.resumeLabel}
                onChange={(e) => update("resumeLabel", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Contact link label" description='Default: "Start a project"'>
              <Input
                placeholder="Start a project"
                value={footer.ctaLabel}
                onChange={(e) => update("ctaLabel", e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>
        </DashboardCard>

        <DashboardCard icon="PanelBottom" title="Bottom Bar" description="Copyright and tech stack">
          <div className="space-y-4">
            <Field
              label="Copyright line"
              description='Tokens: {year} and {name}. Default: "© {year} {name} — all rights reserved"'
            >
              <Input
                placeholder="© {year} {name} — all rights reserved"
                value={footer.copyright}
                onChange={(e) => update("copyright", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Built-with prefix" description='Default: "Built with"'>
              <Input
                placeholder="Built with"
                value={footer.builtWith}
                onChange={(e) => update("builtWith", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Tech stack" description="One item per line. Empty uses the default list.">
              <TextArea
                rows={5}
                placeholder={"Next.js\nNode.js\nMongoDB"}
                value={footer.stack.join("\n")}
                onChange={(e) =>
                  update(
                    "stack",
                    e.target.value
                      .split("\n")
                      .map((line) => line.trim())
                      .filter(Boolean),
                  )
                }
                className={inputCls}
              />
            </Field>
          </div>
        </DashboardCard>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/15 px-5 py-2.5 text-[14px] font-medium text-accent transition-all hover:bg-accent/25 disabled:opacity-60"
          >
            {saving ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
            ) : (
              <Icon name="Save" className="h-4 w-4" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {success && (
            <span className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-[13px] font-medium text-emerald-500">
              <Icon name="CheckCircle" className="h-4 w-4" />
              Footer saved!
            </span>
          )}
          {saveError && <FormAlert message={saveError} className="mb-0" />}
        </div>
      </div>
    </div>
  );
}
