"use client";

import { useParams } from "next/navigation";
import { SectionEditor } from "@/components/admin/section-editor";
import { EmptyState } from "@/components/admin/ui";
import { getSectionPage } from "@/lib/section-pages";

/**
 * One management page per homepage component.
 *
 * The URL (`/sections/hero`, `/sections/projects`, …) selects a config from
 * `lib/section-pages`; the shared `<SectionEditor>` renders it. Adding a block
 * is a registry entry, not a new route file.
 */
export default function AdminSectionPage() {
  const params = useParams<{ section: string }>();
  const config = getSectionPage(params.section);

  if (!config) {
    return (
      <EmptyState
        icon="Compass"
        title="Unknown component"
        description={`There is no management page for “${params.section ?? ""}”.`}
      />
    );
  }

  return <SectionEditor config={config} />;
}
