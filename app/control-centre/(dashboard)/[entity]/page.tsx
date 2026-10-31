"use client";

import { notFound, useParams } from "next/navigation";
import { useAdminData } from "@/components/admin/admin-context";
import { EntityManager } from "@/components/admin/entity-manager";
import { Icon } from "@/components/ui/icon";

export default function AdminEntityPage() {
  const params = useParams<{ entity: string }>();
  const { types, loading, error } = useAdminData();
  const type = types.find((item) => item.key === params.entity);

  if (loading && !type) {
    return (
      <div className="flex items-center gap-2 text-[12.5px] text-faint">
        <Icon name="Loader" className="h-4 w-4 animate-spin" />
        Loading the content schema…
      </div>
    );
  }

  if (error) {
    return (
      <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-[12.5px] text-danger">
        {error}
      </p>
    );
  }

  if (!type) notFound();

  const required = type.fields.filter((field) => field.required).length;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.22em] text-accent">Content</p>
          <h1 className="mt-1.5 flex items-center gap-2 text-2xl font-semibold text-ink">
            <Icon
              name={type.singleton ? "Settings" : "FolderKanban"}
              className="h-5 w-5 text-accent"
            />
            {type.label}
          </h1>
          <p className="mt-1 text-[12.5px] text-muted">
            {type.singleton
              ? "A single document that powers one section of the public site."
              : "Create, edit and remove records. Changes appear on the site within a minute."}
          </p>
        </div>

        <div className="mono flex flex-wrap items-center gap-2 text-[9.5px] uppercase tracking-[0.14em] text-faint">
          <span className="rounded-full border border-line px-2.5 py-1">{type.fields.length} fields</span>
          <span className="rounded-full border border-line px-2.5 py-1">{required} required</span>
          <span className="rounded-full border border-line px-2.5 py-1">
            {type.singleton ? "singleton" : "collection"}
          </span>
        </div>
      </header>

      <EntityManager type={type} />
    </div>
  );
}
