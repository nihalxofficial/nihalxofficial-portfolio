import type { SiteBranding } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Theme aware wordmark.
 *
 * The dashboard stores a light and a dark asset for the header and the footer,
 * so a logo keeps its contrast when the visitor flips the theme. When nothing is
 * uploaded the generated gradient mark (initials) is used instead, which keeps a
 * fresh install looking finished.
 */
export function BrandLogo({
  branding,
  variant,
  fallback,
  alt,
  className,
  markClassName,
}: {
  branding?: SiteBranding | null;
  variant: "nav" | "footer";
  fallback: string;
  alt: string;
  className?: string;
  markClassName?: string;
}) {
  const light = variant === "nav" ? branding?.navLogoLight : branding?.footerLogoLight;
  const dark = variant === "nav" ? branding?.navLogoDark : branding?.footerLogoDark;
  const label = branding?.logoAlt || alt;
  // The dashboard can set an explicit initials mark; otherwise fall back to the
  // computed one so the generated tile is never blank.
  const mark = (branding?.mark?.trim() || fallback).slice(0, 3).toUpperCase();

  if (!light && !dark) {
    return (
      <span
        className={cn(
          "grid place-items-center rounded-lg grad-accent text-[13px] font-bold tracking-tight text-accent-ink",
          variant === "nav"
            ? "h-9 w-9 shadow-[0_0_22px_var(--accent-glow)]"
            : "h-10 w-10 text-sm",
          markClassName,
        )}
        aria-hidden={false}
        role="img"
        aria-label={label}
      >
        {mark}
      </span>
    );
  }

  const lightSrc = light || dark;
  const darkSrc = dark || light;

  return (
    <span className={cn("inline-flex shrink-0 items-center", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={lightSrc}
        alt={label}
        className="h-9 w-auto max-w-[190px] object-contain dark:hidden"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={darkSrc}
        alt=""
        aria-hidden="true"
        className="hidden h-9 w-auto max-w-[190px] object-contain dark:block"
      />
    </span>
  );
}
