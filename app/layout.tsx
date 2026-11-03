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

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Only the families chosen in Site settings are requested. */}
        <link rel="stylesheet" href={type.href} />
        {/* Instant pre-hydration: restore user's saved accent color preference before paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var a=localStorage.getItem("portfolio_accent")||localStorage.getItem("accent");var c={cyan:["#00e5ff","#7c4dff"],emerald:["#22ff9c","#00b3ff"],magenta:["#ff4ecd","#7c4dff"],amber:["#ffb020","#ff4e50"]};if(a&&c[a]){document.documentElement.style.setProperty("--acc",c[a][0]);document.documentElement.style.setProperty("--acc2",c[a][1]);}}catch(e){}})();`,
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
