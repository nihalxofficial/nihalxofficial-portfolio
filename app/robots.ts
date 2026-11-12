import type { MetadataRoute } from "next";
import { getSiteSettings } from "@/lib/api";
import { ADMIN_BASE } from "@/lib/admin-routes";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSiteSettings();
  const baseUrl = (settings?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
    /\/$/,
    "",
  );

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The dashboard is private and guarded by Better-Auth administrator role.
      disallow: [ADMIN_BASE, `${ADMIN_BASE}/`],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
