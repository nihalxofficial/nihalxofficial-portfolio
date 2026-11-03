"use client";

import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";

/** Dashed empty placeholder shared by lists, tables and charts. */
export function EmptyState({
  icon = "Inbox",
  title,
  description,
  action,
}: {
  icon?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed border-line px-4 py-10 text-center">
      <Icon name={icon} className="h-6 w-6 text-faint" />
      <p className="mt-2 text-[12.5px] font-medium text-ink">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-[11.5px] text-faint">{description}</p> : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
