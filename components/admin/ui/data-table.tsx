"use client";

import type { ReactNode } from "react";
import { EmptyState } from "@/components/admin/ui/empty-state";

export interface Column<Row> {
  /** Stable key for the cell. */
  key: string;
  header: ReactNode;
  /** Renders the cell for a row. */
  cell: (row: Row) => ReactNode;
  /** Tailwidth alignment / width helper. */
  className?: string;
  headClassName?: string;
}

/**
 * Lightweight, dependency-free data table.
 *
 * Shared by the collection-style management pages (projects, skills, experience…)
 * so every list has the same header treatment, row hover and empty state, with a
 * generic `columns` contract instead of duplicating markup per entity.
 */
export function DataTable<Row extends { _id: string }>({
  columns,
  rows,
  emptyTitle = "Nothing here yet",
  emptyDescription,
  emptyAction,
  onRowClick,
}: {
  columns: Column<Row>[];
  rows: Row[];
  emptyTitle?: string;
  emptyDescription?: ReactNode;
  emptyAction?: ReactNode;
  onRowClick?: (row: Row) => void;
}) {
  if (!rows.length) {
    return (
      <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="mono text-[9.5px] uppercase tracking-[0.14em] text-faint">
            {columns.map((col) => (
              <th key={col.key} className={`pb-2 font-medium ${col.headClassName ?? ""}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr
              key={row._id}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={
                onRowClick
                  ? "cursor-pointer text-[12.5px] transition-colors hover:bg-surface-2/50"
                  : "text-[12.5px]"
              }
            >
              {columns.map((col) => (
                <td key={col.key} className={`py-2.5 pr-3 ${col.className ?? ""}`}>
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
