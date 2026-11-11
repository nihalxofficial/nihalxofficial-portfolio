"use client";

import { SectionEditor } from "@/components/admin/section-editor";
import { getSectionPage } from "@/lib/section-pages";

/**
 * Skills are flat records (`name`, `category`, `icon`, …), not grouped
 * documents. The shared section editor already renders the schema-driven form
 * for the `skills` entity, so this page delegates to it instead of maintaining
 * a second, incompatible data model.
 */
export default function SkillsManagerPage() {
  const config = getSectionPage("skills");
  if (!config) return null;

  return <SectionEditor config={config} />;
}
