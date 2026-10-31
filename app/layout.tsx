import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { getSiteSettings } from "@/lib/api";
import { absoluteUrl } from "@/lib/utils";

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
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#030A12" },
    { media: "(prefers-color-scheme: light)", color: "#EEF4FA" },
  ],
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteUrl = settings?.siteUrl || FALLBACK.siteUrl;
  const title = settings?.metaTitle || FALLBACK.metaTitle;
  const description = settings?.metaDescription || FALLBACK.metaDescription;
  const ogImage = absoluteUrl(settings?.ogImageUrl || FALLBACK.ogImageUrl, siteUrl);

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300..700&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@500..700&display=swap"
        />
      </head>
      <body>
        <ThemeProvider>
          <SmoothScroll>{children}</SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
