"use client";

/**
 * Simple toggle switch wrapping a native checkbox styled as a switch.
 * Provides the same simple props used across dashboard pages.
 * No @heroui/react dependency.
 */
export function CmsSwitch({
  checked,
  onChange,
  size = "sm",
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  size?: "sm" | "md" | "lg";
  label: string;
}) {
  const sizeClasses = {
    sm: { track: "h-4 w-7", thumb: "h-3 w-3", translate: "translate-x-3" },
    md: { track: "h-5 w-9", thumb: "h-4 w-4", translate: "translate-x-4" },
    lg: { track: "h-6 w-11", thumb: "h-5 w-5", translate: "translate-x-5" },
  }[size];

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40 focus:ring-offset-1 ${sizeClasses.track} ${checked ? "bg-accent" : "bg-line"}`}
    >
      <span
        className={`inline-block rounded-full bg-white shadow-sm transition-transform ${sizeClasses.thumb} ${checked ? sizeClasses.translate : "translate-x-0"}`}
      />
    </button>
  );
}
