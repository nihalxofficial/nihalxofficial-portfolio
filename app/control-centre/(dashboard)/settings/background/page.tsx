"use client";

import { useEffect, useState } from "react";
import { DashboardCard, LoadingState, ErrorState } from "@/components/admin/dashboard-card";
import { Icon } from "@/components/ui/icon";
import { readContent, updateContent } from "@/lib/admin";
import { BACKGROUND_EFFECTS } from "@/lib/dashboard-config";
import { CmsSwitch } from "@/components/admin/ui";

interface BackgroundSettings {
  _id: string;
  background: {
    effect: "dna" | "rain" | "none";
    enabled: boolean;
    opacity: number; // 0.1-1.0
    speed: number; // 0.5-2.0
    density: number; // 0.5-2.0
    particleColor?: string;
  };
}

export default function BackgroundPage() {
  const [settings, setSettings] = useState<BackgroundSettings | null>(null);
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
      
      // Initialize background settings if they don't exist
      if (!data.background) {
        data.background = {
          effect: "dna",
          enabled: true,
          opacity: 0.4,
          speed: 1.0,
          density: 1.0,
          particleColor: "hsl(189 100% 50%)", // Default cyan
        };
      }
      
      setSettings(data as unknown as BackgroundSettings);
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
      
      const mode = settings.background.enabled ? settings.background.effect : "none";
      try {
        localStorage.setItem("portfolio_bg_mode", mode);
        localStorage.setItem("bg_mode", mode);
        window.dispatchEvent(new CustomEvent("portfolio_bg_change", { detail: mode }));
      } catch {}

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  function updateBackground(field: keyof BackgroundSettings["background"], value: string | number | boolean) {
    if (!settings) return;
    const nextBg = {
      ...settings.background,
      [field]: value,
    };
    setSettings({
      ...settings,
      background: nextBg,
    });

    if (field === "effect" || field === "enabled") {
      const mode = (field === "enabled" ? value : nextBg.enabled) ? (field === "effect" ? value : nextBg.effect) : "none";
      try {
        localStorage.setItem("portfolio_bg_mode", String(mode));
        localStorage.setItem("bg_mode", String(mode));
        window.dispatchEvent(new CustomEvent("portfolio_bg_change", { detail: String(mode) }));
      } catch {}
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-ink">Background Settings</h1>
        <LoadingState message="Loading background configuration..." />
      </div>
    );
  }

  if (error || !settings) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-ink">Background Settings</h1>
        <ErrorState message={error || "Settings not found"} retry={loadSettings} />
      </div>
    );
  }

  const selectedEffect = BACKGROUND_EFFECTS.find(e => e.value === settings.background.effect);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">Background Settings</h1>
        <p className="mt-2 text-[14px] text-muted">
          Configure animated background effects for your portfolio
        </p>
      </div>

      <div className="space-y-6">
        {/* Enable/Disable Background */}
        <DashboardCard 
          icon="Power" 
          title="Background Effect Status" 
          description="Toggle animated background on/off"
        >
          <div className="flex items-center justify-between rounded-lg border border-line/50 bg-surface-2/40 p-4">
            <div>
              <p className="text-[14px] font-semibold text-ink">
                Enable Background Animation
              </p>
              <p className="mt-1 text-[13px] text-muted">
                {settings.background.enabled 
                  ? "Background effects are currently active" 
                  : "Background effects are currently disabled"}
              </p>
            </div>
            <CmsSwitch
              checked={settings.background.enabled}
              onChange={(checked) => updateBackground("enabled", checked)}
              label={settings.background.enabled ? "Background effects are currently active" : "Background effects are currently disabled"}
              size="sm"
            />
          </div>
        </DashboardCard>

        {/* Effect Selection */}
        <DashboardCard 
          icon="Sparkles" 
          title="Background Effect Type" 
          description="Choose your animated background style"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {BACKGROUND_EFFECTS.map((effect) => (
              <button
                key={effect.value}
                onClick={() => updateBackground("effect", effect.value)}
                className={`group relative overflow-hidden rounded-lg border-2 p-5 text-left transition-all ${
                  settings.background.effect === effect.value
                    ? "border-accent bg-accent/10 shadow-lg shadow-accent/20"
                    : "border-line/50 bg-surface-2/40 hover:border-accent/50"
                }`}
              >
                {/* Icon */}
                <div 
                  className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg ${
                    settings.background.effect === effect.value
                      ? "bg-accent/20"
                      : "bg-muted/10"
                  }`}
                >
                  <Icon 
                    name={
                      effect.value === "dna" ? "Dna" :
                      effect.value === "rain" ? "CloudDrizzle" :
                      "Grid3x3"
                    } 
                    className={`h-6 w-6 ${
                      settings.background.effect === effect.value
                        ? "text-accent"
                        : "text-muted"
                    }`}
                  />
                </div>

                {/* Label */}
                <p className="text-[14px] font-bold text-ink">{effect.label}</p>
                <p className="mt-1 text-[12px] text-muted">{effect.description}</p>

                {/* Selected Badge */}
                {settings.background.effect === effect.value && (
                  <div className="absolute right-3 top-3 rounded-full bg-accent p-1">
                    <Icon name="Check" className="h-3 w-3 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </DashboardCard>

        {/* Effect Parameters */}
        {settings.background.enabled && settings.background.effect !== "none" && (
          <DashboardCard 
            icon="Sliders" 
            title="Effect Parameters" 
            description="Fine-tune the animation behavior"
          >
            <div className="space-y-6">
              {/* Opacity */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-[13px] font-medium text-ink">
                    Opacity
                  </label>
                  <span className="text-[13px] font-semibold text-accent">
                    {Math.round(settings.background.opacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={settings.background.opacity}
                  onChange={(e) => updateBackground("opacity", parseFloat(e.target.value))}
                  className="w-full accent-accent"
                />
                <div className="mt-2 flex justify-between text-[11px] text-muted">
                  <span>10% (Subtle)</span>
                  <span>50% (Balanced)</span>
                  <span>100% (Bold)</span>
                </div>
              </div>

              {/* Speed */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-[13px] font-medium text-ink">
                    Animation Speed
                  </label>
                  <span className="text-[13px] font-semibold text-accent">
                    {settings.background.speed.toFixed(1)}×
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={settings.background.speed}
                  onChange={(e) => updateBackground("speed", parseFloat(e.target.value))}
                  className="w-full accent-accent"
                />
                <div className="mt-2 flex justify-between text-[11px] text-muted">
                  <span>0.5× (Slow)</span>
                  <span>1.0× (Normal)</span>
                  <span>2.0× (Fast)</span>
                </div>
              </div>

              {/* Density */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-[13px] font-medium text-ink">
                    Particle Density
                  </label>
                  <span className="text-[13px] font-semibold text-accent">
                    {settings.background.density.toFixed(1)}×
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={settings.background.density}
                  onChange={(e) => updateBackground("density", parseFloat(e.target.value))}
                  className="w-full accent-accent"
                />
                <div className="mt-2 flex justify-between text-[11px] text-muted">
                  <span>0.5× (Sparse)</span>
                  <span>1.0× (Normal)</span>
                  <span>2.0× (Dense)</span>
                </div>
              </div>
            </div>
          </DashboardCard>
        )}

        {/* Visual Preview */}
        <DashboardCard 
          icon="Eye" 
          title="Effect Preview" 
          description="See how your background will look"
        >
          <div className="relative overflow-hidden rounded-lg border border-line/50 bg-[#0a0a0f] p-8">
            {/* Preview Content */}
            <div className="relative z-10 text-center">
              <div 
                className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full"
                style={{ 
                  backgroundColor: `${settings.background.particleColor || "hsl(189 100% 50%)"}20`,
                }}
              >
                <Icon 
                  name={selectedEffect?.value === "dna" ? "Dna" : selectedEffect?.value === "rain" ? "CloudDrizzle" : "Grid3x3"} 
                  className="h-8 w-8"
                  style={{ color: settings.background.particleColor || "hsl(189 100% 50%)" }}
                />
              </div>
              <h3 className="text-xl font-bold text-white">
                {selectedEffect?.label || "Background Effect"}
              </h3>
              <p className="mt-2 text-[13px] text-gray-400">
                {settings.background.enabled 
                  ? `Active at ${Math.round(settings.background.opacity * 100)}% opacity` 
                  : "Effect disabled"}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="rounded-full bg-accent/20 px-3 py-1 text-[11px] font-semibold text-accent">
                  Speed: {settings.background.speed}×
                </span>
                <span className="rounded-full bg-accent/20 px-3 py-1 text-[11px] font-semibold text-accent">
                  Density: {settings.background.density}×
                </span>
              </div>
            </div>

            {/* Effect Simulation Overlay */}
            {settings.background.enabled && settings.background.effect !== "none" && (
              <div 
                className="pointer-events-none absolute inset-0"
                style={{ 
                  opacity: settings.background.opacity,
                  background: settings.background.effect === "dna"
                    ? `radial-gradient(circle at 20% 50%, ${settings.background.particleColor || "hsl(189 100% 50%)"}20, transparent 50%),
                       radial-gradient(circle at 80% 50%, ${settings.background.particleColor || "hsl(189 100% 50%)"}15, transparent 50%)`
                    : settings.background.effect === "rain"
                    ? `linear-gradient(180deg, transparent 0%, ${settings.background.particleColor || "hsl(189 100% 50%)"}10 50%, transparent 100%)`
                    : "none",
                }}
              />
            )}
          </div>
        </DashboardCard>

        {/* Save Button */}
        <div className="flex items-center gap-3">
          <button type="button" onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/15 px-6 py-2.5 text-[14px] font-medium text-accent transition-all hover:bg-accent/25 disabled:opacity-60">
            {saving ? "Saving..." : (<><Icon name="Save" className="h-4 w-4" />Save Background Settings</>)}
          </button>

          {success && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-[13px] font-medium text-emerald-500">
              <Icon name="CheckCircle" className="h-4 w-4" />
              <span>Background saved successfully!</span>
            </div>
          )}
        </div>

        {/* Information Panel */}
        <DashboardCard icon="Info" title="About Background Effects">
          <ul className="space-y-2 text-[13px] text-muted">
            <li className="flex gap-2">
              <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
              <span><strong className="text-ink">DNA Helix</strong> creates a 3D particle constellation effect</span>
            </li>
            <li className="flex gap-2">
              <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
              <span><strong className="text-ink">Matrix Rain</strong> displays falling code-style animation</span>
            </li>
            <li className="flex gap-2">
              <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 text-accent shrink-0" />
              <span><strong className="text-ink">Minimal Grid</strong> shows a simple cyber grid pattern</span>
            </li>
            <li className="flex gap-2">
              <Icon name="Zap" className="h-4 w-4 mt-0.5 text-yellow-500 shrink-0" />
              <span>Lower opacity creates subtle ambiance, higher creates dramatic impact</span>
            </li>
            <li className="flex gap-2">
              <Icon name="Zap" className="h-4 w-4 mt-0.5 text-yellow-500 shrink-0" />
              <span>Background effects may impact performance on low-end devices</span>
            </li>
          </ul>
        </DashboardCard>
      </div>
    </div>
  );
}
