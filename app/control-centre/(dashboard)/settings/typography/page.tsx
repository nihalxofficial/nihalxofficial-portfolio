"use client";

import { useEffect, useState } from "react";
import { DashboardCard, LoadingState, ErrorState } from "@/components/admin/dashboard-card";
import { Icon } from "@/components/ui/icon";
import { readContent, updateContent } from "@/lib/admin";
import { FONT_OPTIONS } from "@/lib/dashboard-config";

interface TypographySettings {
  _id: string;
  typography: {
    fontSans: string;
    fontDisplay: string;
    fontMono: string;
    baseFontSize: number; // 14-18px
    headingScale: number; // 1.2-1.5
  };
}

export default function TypographyPage() {
  const [settings, setSettings] = useState<TypographySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      setError(null);
      const data = await readContent("settings", "default");
      
      // Initialize typography settings if they don't exist
      if (!data.typography) {
        data.typography = {
          fontSans: "inter",
          fontDisplay: "outfit",
          fontMono: "jetbrains-mono",
          baseFontSize: 16,
          headingScale: 1.25,
        };
      }
      
      setSettings(data as unknown as TypographySettings);
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

  function updateTypography(field: keyof TypographySettings["typography"], value: string | number) {
    if (!settings) return;
    setSettings({
      ...settings,
      typography: {
        ...settings.typography,
        [field]: value,
      },
    });
  }

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-ink">Typography Settings</h1>
        <LoadingState message="Loading typography configuration..." />
      </div>
    );
  }

  if (error || !settings) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-ink">Typography Settings</h1>
        <ErrorState message={error || "Settings not found"} retry={loadSettings} />
      </div>
    );
  }

  const selectedSansFont = FONT_OPTIONS.sans.find(f => f.value === settings.typography.fontSans);
  const selectedDisplayFont = FONT_OPTIONS.sans.find(f => f.value === settings.typography.fontDisplay);
  const selectedMonoFont = FONT_OPTIONS.mono.find(f => f.value === settings.typography.fontMono);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">Typography Settings</h1>
        <p className="mt-2 text-[14px] text-muted">
          Configure font families and text sizing for your portfolio
        </p>
      </div>

      <div className="space-y-6">
        {/* Font Families */}
        <DashboardCard 
          icon="Type" 
          title="Font Families" 
          description="Choose fonts for different text types"
        >
          <div className="space-y-5">
            {/* Sans Serif (Body) */}
            <div>
              <label className="mb-2 block text-[13px] font-medium text-ink">
                Body Font (Sans Serif)
              </label>
              <select
                className="w-full max-w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                value={settings.typography.fontSans}
                onChange={(e) => updateTypography("fontSans", e.target.value)}
              >
                {FONT_OPTIONS.sans.map((font) => (
                  <option key={font.value} value={font.value}>{font.label}</option>
                ))}
              </select>
              {selectedSansFont && (
                <p className="mt-2 text-[12px] text-muted">
                  Preview: <span style={{ fontFamily: selectedSansFont.label }} className="text-ink">
                    The quick brown fox jumps over the lazy dog
                  </span>
                </p>
              )}
            </div>

            {/* Display Font (Headings) */}
            <div>
              <label className="mb-2 block text-[13px] font-medium text-ink">
                Display Font (Headings)
              </label>
              <select
                className="w-full max-w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                value={settings.typography.fontDisplay}
                onChange={(e) => updateTypography("fontDisplay", e.target.value)}
              >
                {FONT_OPTIONS.sans.map((font) => (
                  <option key={font.value} value={font.value}>{font.label}</option>
                ))}
              </select>
              {selectedDisplayFont && (
                <p className="mt-2 text-[12px] text-muted">
                  Preview: <span style={{ fontFamily: selectedDisplayFont.label, fontSize: "18px", fontWeight: 700 }} className="text-ink">
                    Building Digital Experiences
                  </span>
                </p>
              )}
            </div>

            {/* Monospace (Code) */}
            <div>
              <label className="mb-2 block text-[13px] font-medium text-ink">
                Monospace Font (Code)
              </label>
              <select
                className="w-full max-w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[13px] text-ink focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                value={settings.typography.fontMono}
                onChange={(e) => updateTypography("fontMono", e.target.value)}
              >
                {FONT_OPTIONS.mono.map((font) => (
                  <option key={font.value} value={font.value}>{font.label}</option>
                ))}
              </select>
              {selectedMonoFont && (
                <p className="mt-2 text-[12px] text-muted">
                  Preview: <span style={{ fontFamily: selectedMonoFont.label }} className="text-ink">
                    const greeting = "Hello World";
                  </span>
                </p>
              )}
            </div>
          </div>
        </DashboardCard>

        {/* Font Sizing */}
        <DashboardCard 
          icon="Ruler" 
          title="Text Sizing" 
          description="Control base font size and heading scale"
        >
          <div className="space-y-5">
            {/* Base Font Size */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="text-[13px] font-medium text-ink">
                  Base Font Size
                </label>
                <span className="text-[13px] font-semibold text-accent">
                  {settings.typography.baseFontSize}px
                </span>
              </div>
              <input
                type="range"
                min="14"
                max="18"
                step="1"
                value={settings.typography.baseFontSize}
                onChange={(e) => updateTypography("baseFontSize", parseInt(e.target.value))}
                className="w-full accent-accent"
              />
              <div className="mt-2 flex justify-between text-[11px] text-muted">
                <span>14px (Compact)</span>
                <span>16px (Standard)</span>
                <span>18px (Large)</span>
              </div>
            </div>

            {/* Heading Scale */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="text-[13px] font-medium text-ink">
                  Heading Scale Multiplier
                </label>
                <span className="text-[13px] font-semibold text-accent">
                  {settings.typography.headingScale.toFixed(2)}×
                </span>
              </div>
              <input
                type="range"
                min="1.15"
                max="1.5"
                step="0.05"
                value={settings.typography.headingScale}
                onChange={(e) => updateTypography("headingScale", parseFloat(e.target.value))}
                className="w-full accent-accent"
              />
              <div className="mt-2 flex justify-between text-[11px] text-muted">
                <span>1.15× (Tight)</span>
                <span>1.25× (Balanced)</span>
                <span>1.5× (Dramatic)</span>
              </div>
            </div>

            {/* Size Preview */}
            <div className="rounded-lg border border-line/50 bg-surface-2/40 p-4">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted">
                Scale Preview
              </p>
              <div className="space-y-2">
                <p 
                  style={{ 
                    fontSize: `${settings.typography.baseFontSize * Math.pow(settings.typography.headingScale, 3)}px`,
                    fontFamily: selectedDisplayFont?.label || "inherit",
                    fontWeight: 700,
                  }} 
                  className="text-ink"
                >
                  H1 Heading
                </p>
                <p 
                  style={{ 
                    fontSize: `${settings.typography.baseFontSize * Math.pow(settings.typography.headingScale, 2)}px`,
                    fontFamily: selectedDisplayFont?.label || "inherit",
                    fontWeight: 700,
                  }} 
                  className="text-ink"
                >
                  H2 Heading
                </p>
                <p 
                  style={{ 
                    fontSize: `${settings.typography.baseFontSize * settings.typography.headingScale}px`,
                    fontFamily: selectedDisplayFont?.label || "inherit",
                    fontWeight: 600,
                  }} 
                  className="text-ink"
                >
                  H3 Heading
                </p>
                <p 
                  style={{ 
                    fontSize: `${settings.typography.baseFontSize}px`,
                    fontFamily: selectedSansFont?.label || "inherit",
                  }} 
                  className="text-muted"
                >
                  Body paragraph text with normal weight
                </p>
                <p 
                  style={{ 
                    fontSize: `${settings.typography.baseFontSize * 0.875}px`,
                    fontFamily: selectedMonoFont?.label || "inherit",
                  }} 
                  className="text-muted"
                >
                  <code>Code snippet with monospace font</code>
                </p>
              </div>
            </div>
          </div>
        </DashboardCard>

        {/* Save Button */}
        <div className="flex items-center gap-3">
          <button type="button" onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/15 px-6 py-2.5 text-[14px] font-medium text-accent transition-all hover:bg-accent/25 disabled:opacity-60">
            {saving ? "Saving..." : (<><Icon name="Save" className="h-4 w-4" />Save Typography Settings</>)}
          </button>

          {success && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-[13px] font-medium text-emerald-500">
              <Icon name="CheckCircle" className="h-4 w-4" />
              <span>Typography saved successfully!</span>
            </div>
          )}
        </div>

        {/* Information Panel */}
        <DashboardCard icon="Info" title="About Typography">
          <ul className="space-y-2 text-[13px] text-muted">
            <li className="flex gap-2">
              <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
              <span><strong className="text-ink">Body Font</strong> applies to paragraphs, descriptions, and UI text</span>
            </li>
            <li className="flex gap-2">
              <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
              <span><strong className="text-ink">Display Font</strong> applies to headings, titles, and hero text</span>
            </li>
            <li className="flex gap-2">
              <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
              <span><strong className="text-ink">Monospace Font</strong> applies to code blocks and terminal displays</span>
            </li>
            <li className="flex gap-2">
              <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
              <span><strong className="text-ink">Base Font Size</strong> sets the foundation for all text scaling</span>
            </li>
            <li className="flex gap-2">
              <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
              <span><strong className="text-ink">Heading Scale</strong> determines the size ratio between heading levels</span>
            </li>
            <li className="flex gap-2">
              <Icon name="Zap" className="h-4 w-4 mt-0.5 text-yellow-500 shrink-0" />
              <span>Changes apply site-wide instantly — test on different devices</span>
            </li>
          </ul>
        </DashboardCard>
      </div>
    </div>
  );
}
