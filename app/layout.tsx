import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { MotionProvider } from "@/components/providers/motion-provider";
import { Analytics } from "@/components/site/analytics";
import { getSiteSettings } from "@/lib/api";
import { markFavicon } from "@/lib/favicon";
import { resolveTypography } from "@/lib/fonts";
import { absoluteUrl, initials } from "@/lib/utils";

const FALLBACK = {
  siteName: "Md. Nihal Uddin Bijoy",
  metaTitle: "Md. Nihal Uddin Bijoy — Full-Stack Developer",
  metaDescription:
    "Full-stack developer building production web applications with Next.js, Node.js and MongoDB.",
  keywords: ["Full-Stack Developer", "Next.js", "Node.js", "MongoDB"],
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ogImageUrl: "/og-image.jpg",
};

/** Mirrors `components/site/accent-context.tsx` ACCENTS for the pre-paint script. */
const ACCENT_PRESETS: Record<string, [string, string]> = {
  cyan: ["#00e5ff", "#7c4dff"],
  emerald: ["#22ff9c", "#00b3ff"],
  magenta: ["#ff4ecd", "#7c4dff"],
  amber: ["#ffb020", "#ff4e50"],
};

export const viewport: Viewport = {
  themeColor: [{ color: "#03050f" }],
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteUrl = settings?.siteUrl || FALLBACK.siteUrl;
  const title = settings?.metaTitle || FALLBACK.metaTitle;
  const description = settings?.metaDescription || FALLBACK.metaDescription;
  const ogImage = absoluteUrl(settings?.ogImageUrl || FALLBACK.ogImageUrl, siteUrl);
  // The favicon is a dashboard asset: an uploaded image, otherwise a generated
  // gradient tile carrying the brand mark (defaults to the name's initials).
  const siteName = settings?.siteName || FALLBACK.siteName;
  const favicon =
    settings?.branding?.faviconUrl ||
    markFavicon(settings?.branding?.mark?.trim() || initials(siteName));

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s · ${settings?.siteName || FALLBACK.siteName}`,
    },
    description,
    keywords: settings?.keywords?.length ? settings.keywords : FALLBACK.keywords,
    authors: [{ name: settings?.siteName || FALLBACK.siteName }],
    creator: settings?.siteName || FALLBACK.siteName,
    alternates: { canonical: "/" },
    icons: {
      icon: [{ url: favicon }],
      shortcut: [{ url: favicon }],
      apple: [{ url: favicon }],
    },
    openGraph: {
      type: "website",
      url: siteUrl,
      siteName: settings?.siteName || FALLBACK.siteName,
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const type = resolveTypography(settings?.typography);

  // Resolve the owner-selected default accent for the pre-paint script:
  // custom palette wins over the preset, and both fall back to the built-in
  // cyan default so the shipped design is unchanged until the theme is edited.
  const theme = settings?.theme;
  const preset = (theme?.accentId && ACCENT_PRESETS[theme.accentId]) || ACCENT_PRESETS.cyan;
  const defaultAccent = {
    a: theme?.palette?.primary?.trim() || preset[0],
    b: theme?.palette?.secondary?.trim() || preset[1],
  };

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Only the families chosen in Site settings are requested. */}
        <link rel="stylesheet" href={type.href} />
        {/* Instant pre-hydration: a visitor's saved accent wins, otherwise the
            owner-selected default (palette overrides → preset → built-in cyan). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var a=localStorage.getItem("portfolio_accent")||localStorage.getItem("accent");var c=${JSON.stringify(ACCENT_PRESETS)};var d=${JSON.stringify(defaultAccent)};var p=(a&&c[a])?c[a]:[d.a,d.b];if(p){document.documentElement.style.setProperty("--acc",p[0]);document.documentElement.style.setProperty("--acc2",p[1]);}}catch(e){}})();`,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        style={
          {
            "--site-font-sans": type.sans,
            "--site-font-display": type.display,
            "--site-font-mono": type.mono,
            "--site-font-script": type.script,
          } as React.CSSProperties
        }
      >
        <ThemeProvider>
          <MotionProvider>
            {children}
          </MotionProvider>
          {/* Passive visitor beacon; ignores the dashboard internally. */}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
