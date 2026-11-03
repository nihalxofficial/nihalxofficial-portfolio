"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardCard, LoadingState, ErrorState } from "@/components/admin/dashboard-card";
import { Icon } from "@/components/ui/icon";
import { listContent, updateContent } from "@/lib/admin";
import { HOMEPAGE_COMPONENTS } from "@/lib/dashboard-config";
import { Switch } from "@heroui/react";

interface ComponentVisibilityItem {
  _id: string;
  key: string;
  label: string;
  description: string;
  isVisible: boolean;
  order: number;
}

export default function ComponentVisibilityPage() {
  const [sections, setSections] = useState<ComponentVisibilityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadSections();
  }, []);

  async function loadSections() {
    try {
      setLoading(true);
      setError(null);
      const result = await listContent("sections");
      setSections(result.items as unknown as ComponentVisibilityItem[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load components");
    } finally {
      setLoading(false);
    }
  }

  async function toggleVisibility(id: string, currentState: boolean) {
    try {
      setUpdating(id);
      await updateContent("sections", id, { isVisible: !currentState });
      setSections((prev) =>
        prev.map((s) => (s._id === id ? { ...s, isVisible: !currentState } : s))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update visibility");
    } finally {
      setUpdating(null);
    }
  }

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-ink">Component Visibility</h1>
          <p className="mt-2 text-[14px] text-muted">
            Enable or disable homepage sections
          </p>
        </div>
        <LoadingState message="Loading components..." />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-ink">Component Visibility</h1>
        </div>
        <ErrorState message={error} retry={loadSections} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">Component Visibility</h1>
        <p className="mt-2 text-[14px] text-muted">
          Control which sections appear on your homepage. Disabled sections are hidden from
          visitors.
        </p>
      </div>

      {/* Components Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sections
          .sort((a, b) => a.order - b.order)
          .map((section) => {
            const config = HOMEPAGE_COMPONENTS.find((c) => c.key === section.key);
            const isUpdating = updating === section._id;

            return (
              <DashboardCard
                key={section._id}
                hover
                className={isUpdating ? "opacity-60 pointer-events-none" : ""}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Icon and Info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-gradient-to-br from-accent/15 to-accent/5 text-accent">
                      <Icon
                        name={config?.icon || "Box"}
                        className="h-5 w-5"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-[14px] text-ink truncate">
                        {section.label}
                      </h3>
                      <p className="mt-1 text-[12px] text-muted line-clamp-2">
                        {section.description || config?.description}
                      </p>
                    </div>
                  </div>

                  {/* Toggle */}
                  <div className="shrink-0">
                    <Switch
                      isSelected={section.isVisible}
                      onValueChange={() => toggleVisibility(section._id, section.isVisible)}
                      size="sm"
                      color="primary"
                      aria-label={`Toggle ${section.label}`}
                    />
                  </div>
                </div>

                {/* Management Link */}
                {config?.hasCustomPage && (
                  <Link
                    href={config.route}
                    className="mt-4 flex items-center gap-2 text-[12px] font-medium text-accent hover:underline"
                  >
                    <Icon name="Settings" className="h-3.5 w-3.5" />
                    <span>Manage Content</span>
                  </Link>
                )}

                {/* Status Badge */}
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      section.isVisible
                        ? "bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20"
                        : "bg-muted/10 text-muted ring-1 ring-muted/20"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        section.isVisible ? "bg-emerald-500" : "bg-muted"
                      }`}
                    />
                    {section.isVisible ? "Visible" : "Hidden"}
                  </span>
                </div>
              </DashboardCard>
            );
          })}
      </div>

      {/* Info Card */}
      <DashboardCard className="mt-8" icon="Info" title="About Component Visibility">
        <div className="space-y-3 text-[13px] text-muted">
          <p>
            <strong className="text-ink">Visible components</strong> appear on your public
            homepage in the order specified by their order value.
          </p>
          <p>
            <strong className="text-ink">Hidden components</strong> are removed from the
            homepage but their content is preserved. You can re-enable them anytime.
          </p>
          <p>
            Click <strong className="text-ink">Manage Content</strong> on any component to
            edit its content, images, and settings.
          </p>
        </div>
      </DashboardCard>
    </div>
  );
}
