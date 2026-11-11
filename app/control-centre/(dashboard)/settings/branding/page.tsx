"use client";

import { BrandingEditor } from "@/components/admin/settings/branding-editor";

/**
 * Assets & Branding.
 *
 * The editor writes the registry-backed `settings.branding` fields
 * (`navLogoLight`, `navLogoDark`, `footerLogoLight`, `footerLogoDark`,
 * `faviconUrl`, `logoAlt`, `mark`, `wordmark`) and uploads through the server
 * media endpoint, so the saved values actually reach the public site.
 */
export default function BrandingPage() {
  return <BrandingEditor />;
}
