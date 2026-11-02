import type { SiteBranding } from "@/lib/types";
import { NbLogo } from "@/components/ui/nb-logo";
import { cn } from "@/lib/utils";

/**
 * Theme aware wordmark.
 * Uses the custom futuristic Cyber NB Monogram Logo as default.
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

  if (!light && !dark) {
    return (
      <NbLogo
        size={variant === "nav" ? 38 : 40}
        className={cn("glow-sm", markClassName)}
      />
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
        className={cn(
          "h-8 w-auto object-contain dark:hidden",
          variant === "footer" && "h-7",
        )}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={darkSrc}
        alt={label}
        className={cn(
          "hidden h-8 w-auto object-contain dark:block",
          variant === "footer" && "h-7",
        )}
      />
    </span>
  );
}
