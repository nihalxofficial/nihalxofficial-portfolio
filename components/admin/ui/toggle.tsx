"use client";

/**
 * Accessible on/off switch.
 *
 * Mirrors the visual toggle already used across the dashboard while exposing the
 * `role="switch"` semantics every management page needs for visibility flags.
 */
export function Toggle({
  checked,
  onChange,
  disabled,
  label,
  size = "md",
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  /** Required for screen readers; e.g. "Show hero section". */
  label: string;
  size?: "sm" | "md";
}) {
  const dims = size === "sm" ? "h-5 w-9" : "h-6 w-11";
  const knob = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const onLeft = size === "sm" ? "left-5" : "left-6";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative shrink-0 rounded-full border transition-colors disabled:opacity-60 ${dims} ${
        checked ? "border-accent/50 bg-accent/25" : "border-line bg-surface-2"
      }`}
    >
      <span
        className={`absolute top-1/2 -translate-y-1/2 rounded-full transition-all ${knob} ${
          checked ? `${onLeft} bg-accent` : "left-1 bg-faint"
        }`}
      />
    </button>
  );
}
