"use client";

import { useEffect, useState } from "react";
import { DashboardCard, LoadingState, ErrorState } from "@/components/admin/dashboard-card";
import { Icon } from "@/components/ui/icon";
import { readContent, updateContent } from "@/lib/admin";

import { ACCENT_PRESETS } from "@/lib/dashboard-config";

interface ThemeSettings {
  _id: string;
  theme: {
    mode: "dark" | "light" | "auto";
    accentPrimary: string;
    accentSecondary: string;
    accentPreset: string;
    customColors?: {
      background?: string;
      foreground?: string;
      border?: string;
    };
  };
}

export default function ThemePage() {
  const [settings, setSettings] = useState<ThemeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [customMode, setCustomMode] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      setError(null);
      const data = await readContent("settings", "default");
      const d = data as Record<string, unknown>;
      
      // Initialize theme settings if they don't exist
      if (!d.theme) {
        d.theme = {
          mode: "dark",
          accentPrimary: "hsl(189 100% 50%)", // Cyan
          accentSecondary: "hsl(189 100% 70%)",
          accentPreset: "cyan",
        };
      }
      
      setSettings(d as unknown as ThemeSettings);
      setCustomMode((d.theme as Record<string, unknown>).accentPreset === "custom");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!settings) return;

    try {
      setSaving(true);
      setSuccess(false);
      await updateContent("settings", settings._id, settings as unknown as Record<string, unknown>);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  function selectPreset(presetId: string) {
    if (!settings) return;
    
    const preset = ACCENT_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    setSettings({
      ...settings,
      theme: {
        ...settings.theme,
        accentPreset: presetId,
        accentPrimary: preset.primary,
        accentSecondary: preset.secondary,
      },
    });
    setCustomMode(false);
  }

  function enableCustomColors() {
    if (!settings) return;
    setSettings({
      ...settings,
      theme: {
        ...settings.theme,
        accentPreset: "custom",
      },
    });
    setCustomMode(true);
  }

  function updateTheme(field: keyof ThemeSettings["theme"], value: string) {
    if (!settings) return;
    setSettings({
      ...settings,
      theme: {
        ...settings.theme,
        [field]: value,
      },
    });
  }

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-ink">Theme & Colors</h1>
        <LoadingState message="Loading theme configuration..." />
      </div>
    );
  }

  if (error || !settings) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-ink">Theme & Colors</h1>
        <ErrorState message={error || "Settings not found"} retry={loadSettings} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">Theme & Colors</h1>
        <p className="mt-2 text-[14px] text-muted">
          Customize your portfolio's color palette and theme mode
        </p>
      </div>

      <div className="space-y-6">
        {/* Accent Color Presets */}
        <DashboardCard 
          icon="Palette" 
          title="Accent Color Presets" 
          description="Choose from curated color palettes"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ACCENT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => selectPreset(preset.id)}
                className={`group relative overflow-hidden rounded-lg border-2 p-4 transition-all ${
                  settings.theme.accentPreset === preset.id
                    ? "border-accent bg-accent/10 shadow-lg shadow-accent/20"
                    : "border-line/50 bg-surface-2/40 hover:border-accent/50"
                }`}
              >
                {/* Color Swatches */}
                <div className="mb-3 flex gap-2">
                  <div
                    className="h-10 w-10 rounded-md shadow-md"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <div
                    className="h-10 w-10 rounded-md shadow-md"
                    style={{ backgroundColor: preset.secondary }}
                  />
                </div>

                {/* Label */}
                <p className="text-[13px] font-semibold text-ink">{preset.label}</p>

                {/* Selected Badge */}
                {settings.theme.accentPreset === preset.id && (
                  <div className="absolute right-2 top-2 rounded-full bg-accent p-1">
                    <Icon name="Check" className="h-3 w-3 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Custom Colors Button */}
          <div className="mt-4 border-t border-line/30 pt-4">
            <button
              onClick={enableCustomColors}
              className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                customMode
                  ? "border-accent bg-accent/10"
                  : "border-dashed border-line/50 bg-surface-2/20 hover:border-accent/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/20">
                  <Icon name="Pipette" className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-ink">Custom Colors</p>
                  <p className="text-[12px] text-muted">Define your own accent palette</p>
                </div>
                {customMode && (
                  <div className="ml-auto rounded-full bg-accent px-2 py-1 text-[11px] font-semibold text-white">
                    Active
                  </div>
                )}
              </div>
            </button>
          </div>
        </DashboardCard>

        {/* Custom Color Inputs */}
        {customMode && (
          <DashboardCard 
            icon="Pipette" 
            title="Custom Accent Colors" 
            description="Define your own color values"
          >
            <div className="space-y-4">
              {/* Primary Accent */}
              <div>
                <label className="mb-2 block text-[13px] font-medium text-ink">
                  Primary Accent
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={
                      settings.theme.accentPrimary.startsWith("hsl")
                        ? "#00d9ff" // Default fallback
                        : settings.theme.accentPrimary
                    }
                    onChange={(e) => updateTheme("accentPrimary", e.target.value)}
                    className="h-12 w-16 cursor-pointer rounded-lg border border-line/50"
                  />
                  <input
                    type="text"
                    value={settings.theme.accentPrimary}
                    onChange={(e) => updateTheme("accentPrimary", e.target.value)}
                    placeholder="hsl(189 100% 50%) or #00d9ff"
                    className="flex-1 rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                  />
                </div>
                <p className="mt-1 text-[12px] text-muted">
                  Used for buttons, links, and highlights
                </p>
              </div>

              {/* Secondary Accent */}
              <div>
                <label className="mb-2 block text-[13px] font-medium text-ink">
                  Secondary Accent
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={
                      settings.theme.accentSecondary.startsWith("hsl")
                        ? "#66e4ff" // Default fallback
                        : settings.theme.accentSecondary
                    }
                    onChange={(e) => updateTheme("accentSecondary", e.target.value)}
                    className="h-12 w-16 cursor-pointer rounded-lg border border-line/50"
                  />
                  <input
                    type="text"
                    value={settings.theme.accentSecondary}
                    onChange={(e) => updateTheme("accentSecondary", e.target.value)}
                    placeholder="hsl(189 100% 70%) or #66e4ff"
                    className="flex-1 rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                  />
                </div>
                <p className="mt-1 text-[12px] text-muted">
                  Used for hover states and secondary elements
                </p>
              </div>

              {/* Format Help */}
              <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
                <div className="flex gap-2">
                  <Icon name="Info" className="h-4 w-4 mt-0.5 text-blue-500 shrink-0" />
                  <div className="text-[12px] text-blue-500">
                    <p className="font-semibold">Supported Formats:</p>
                    <ul className="mt-1 space-y-0.5 opacity-90">
                      <li>• HSL: <code>hsl(189 100% 50%)</code></li>
                      <li>• Hex: <code>#00d9ff</code></li>
                      <li>• RGB: <code>rgb(0 217 255)</code></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </DashboardCard>
        )}

        {/* Live Preview */}
        <DashboardCard 
          icon="Eye" 
          title="Color Preview" 
          description="See how your accent colors look"
        >
          <div 
            className="rounded-lg border border-line/50 p-6"
            style={{
              background: `linear-gradient(135deg, ${settings.theme.accentPrimary}15, ${settings.theme.accentSecondary}15)`,
            }}
          >
            <div className="space-y-4">
              {/* Heading */}
              <h3 
                className="text-2xl font-bold"
                style={{ color: settings.theme.accentPrimary }}
              >
                Welcome to My Portfolio
              </h3>

              {/* Paragraph with Link */}
              <p className="text-[14px] text-muted">
                This is how your content will look.{" "}
                <span 
                  className="font-semibold underline cursor-pointer"
                  style={{ color: settings.theme.accentPrimary }}
                >
                  Links and highlights
                </span>{" "}
                use the primary accent color.
              </p>

              {/* Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  className="rounded-lg px-6 py-2.5 text-[14px] font-semibold text-white shadow-lg transition-all hover:scale-105"
                  style={{ backgroundColor: settings.theme.accentPrimary }}
                >
                  Primary Button
                </button>
                <button
                  className="rounded-lg border-2 px-6 py-2.5 text-[14px] font-semibold transition-all hover:scale-105"
                  style={{ 
                    borderColor: settings.theme.accentPrimary,
                    color: settings.theme.accentPrimary,
                  }}
                >
                  Outline Button
                </button>
                <button
                  className="rounded-lg px-6 py-2.5 text-[14px] font-semibold transition-all hover:scale-105"
                  style={{ 
                    backgroundColor: `${settings.theme.accentSecondary}20`,
                    color: settings.theme.accentPrimary,
                  }}
                >
                  Secondary Button
                </button>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <span 
                  className="rounded-full px-3 py-1 text-[12px] font-semibold"
                  style={{ 
                    backgroundColor: `${settings.theme.accentPrimary}20`,
                    color: settings.theme.accentPrimary,
                  }}
                >
                  React
                </span>
                <span 
                  className="rounded-full px-3 py-1 text-[12px] font-semibold"
                  style={{ 
                    backgroundColor: `${settings.theme.accentSecondary}20`,
                    color: settings.theme.accentSecondary,
                  }}
                >
                  TypeScript
                </span>
                <span 
                  className="rounded-full border px-3 py-1 text-[12px] font-semibold"
                  style={{ 
                    borderColor: settings.theme.accentPrimary,
                    color: settings.theme.accentPrimary,
                  }}
                >
                  Next.js
                </span>
              </div>

              {/* Card */}
              <div 
                className="rounded-lg border p-4"
                style={{ 
                  borderColor: `${settings.theme.accentPrimary}30`,
                  background: `linear-gradient(135deg, ${settings.theme.accentPrimary}10, transparent)`,
                }}
              >
                <div className="flex items-start gap-3">
                  <div 
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${settings.theme.accentPrimary}20` }}
                  >
                    <Icon name="Sparkles" className="h-5 w-5" style={{ color: settings.theme.accentPrimary }} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[14px] font-semibold text-ink">
                      Featured Project
                    </h4>
                    <p className="mt-1 text-[13px] text-muted">
                      Card components will use your accent colors for borders and icons.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DashboardCard>

        {/* Save Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/15 px-6 py-2.5 text-[14px] font-medium text-accent transition-all hover:bg-accent/25 disabled:opacity-60"
          >
            {saving ? "Saving..." : (
              <><Icon name="Save" className="h-4 w-4" />Save Theme Settings</>
            )}
          </button>

          {success && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-[13px] font-medium text-emerald-500">
              <Icon name="CheckCircle" className="h-4 w-4" />
              <span>Theme saved successfully!</span>
            </div>
          )}
        </div>

        {/* Information Panel */}
        <DashboardCard icon="Info" title="About Theme Settings">
          <ul className="space-y-2 text-[13px] text-muted">
            <li className="flex gap-2">
              <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
              <span><strong className="text-ink">Accent colors</strong> apply to buttons, links, icons, and highlights</span>
            </li>
            <li className="flex gap-2">
              <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
              <span><strong className="text-ink">Primary accent</strong> is used for main interactive elements</span>
            </li>
            <li className="flex gap-2">
              <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
              <span><strong className="text-ink">Secondary accent</strong> is used for hover states and secondary UI</span>
            </li>
            <li className="flex gap-2">
              <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
              <span>Presets provide professionally-balanced color combinations</span>
            </li>
            <li className="flex gap-2">
              <Icon name="Zap" className="h-4 w-4 mt-0.5 text-yellow-500 shrink-0" />
              <span>Custom colors allow full creative control over your brand identity</span>
            </li>
          </ul>
        </DashboardCard>
      </div>
    </div>
  );
}
