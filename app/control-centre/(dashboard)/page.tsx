"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAdminData } from "@/components/admin/admin-context";
import { Icon } from "@/components/ui/icon";
import { fetchOverview, type Overview } from "@/lib/admin";
import { adminHref } from "@/lib/admin-routes";
import { bytesToSize, formatDate } from "@/lib/utils";

export default function AdminOverviewPage() {
  const { types } = useAdminData();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetchOverview()
      .then((value) => {
        setOverview(value);
        setError("");
      })
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : "Could not load the overview.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const counts = overview?.counts;

  const cards = counts
    ? [
        {
          label: "Projects",
          value: String(counts.projects),
          hint: `${counts.publishedProjects} published · ${counts.featuredProjects} featured`,
          icon: "FolderCode",
          href: adminHref("projects"),
        },
        {
          label: "Skills",
          value: String(counts.skills),
          hint: "across all categories",
          icon: "Zap",
          href: adminHref("skills"),
        },
        {
          label: "Messages",
          value: String(counts.messages),
          hint: `${counts.unreadMessages} unread`,
          icon: "Inbox",
          href: adminHref("messages"),
        },
        {
          label: "Media",
          value: String(counts.media),
          hint: bytesToSize(counts.mediaBytes) + " hosted",
          icon: "Image",
          href: adminHref("media"),
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.22em] text-accent">Dashboard</p>
          <h1 className="mt-1.5 text-2xl font-semibold text-ink">Overview</h1>
          <p className="mt-1 text-[12.5px] text-muted">
            {overview?.siteName ? `Editing ${overview.siteName}` : "Every section of the public site"}
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-[12px] font-medium text-muted transition-colors hover:border-line-strong hover:text-accent"
        >
          <Icon name={loading ? "Loader" : "RefreshCw"} className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </header>

      {error ? (
        <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-[12.5px] text-danger">
          {error}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {counts
          ? cards.map((card) => (
              <Link key={card.label} href={card.href} className="panel panel-hover group p-4">
                <div className="flex items-center justify-between">
                  <span className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-accent/10 text-accent">
                    <Icon name={card.icon} className="h-4 w-4" />
                  </span>
                  <Icon
                    name="ArrowUpRight"
                    className="h-4 w-4 text-faint transition-transform group-hover:-translate-y-0.5 group-hover:text-accent"
                  />
                </div>
                <p className="mt-3 text-2xl font-semibold leading-none text-gradient">{card.value}</p>
                <p className="mt-1.5 text-[12.5px] font-medium text-ink">{card.label}</p>
                <p className="mt-0.5 text-[10.5px] text-faint">{card.hint}</p>
              </Link>
            ))
          : Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="panel space-y-2 p-4">
                <span className="block h-9 w-9 animate-pulse rounded-lg bg-surface-2" />
                <span className="block h-6 w-12 animate-pulse rounded bg-surface-2" />
                <span className="block h-3 w-20 animate-pulse rounded bg-surface-2" />
              </div>
            ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="panel p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[13.5px] font-semibold text-ink">Latest messages</h2>
            <Link
              href={adminHref("messages")}
              className="mono text-[10px] uppercase tracking-[0.16em] text-faint hover:text-accent"
            >
              Open inbox
            </Link>
          </div>

          <div className="mt-3 space-y-2">
            {overview?.recentMessages.length ? (
              overview.recentMessages.map((message) => (
                <div
                  key={message._id}
                  className="rounded-xl border border-line bg-surface-2/40 px-3 py-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[12.5px] font-medium text-ink">{message.name}</p>
                    <span
                      className={`mono rounded-full border px-2 py-0.5 text-[9.5px] uppercase tracking-[0.14em] ${
                        message.status === "unread"
                          ? "border-accent/40 bg-accent/10 text-accent"
                          : "border-line text-faint"
                      }`}
                    >
                      {message.status}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[11.5px] text-muted">
                    {message.subject || message.email}
                  </p>
                  <p className="mono mt-1 text-[10px] text-faint">{formatDate(message.createdAt)}</p>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-line px-3 py-6 text-center text-[12px] text-faint">
                No messages yet.
              </p>
            )}
          </div>
        </section>

        <section className="panel p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[13.5px] font-semibold text-ink">Recently updated projects</h2>
            <Link
              href={adminHref("projects")}
              className="mono text-[10px] uppercase tracking-[0.16em] text-faint hover:text-accent"
            >
              Manage
            </Link>
          </div>

          <div className="mt-3 space-y-2">
            {overview?.recentProjects.length ? (
              overview.recentProjects.map((project) => (
                <Link
                  key={project._id}
                  href={adminHref("projects")}
                  className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-2/40 px-3 py-2.5 transition-colors hover:border-line-strong"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[12.5px] font-medium text-ink">
                      {project.title}
                    </span>
                    <span className="mono block truncate text-[10px] text-faint">
                      /{project.slug}
                    </span>
                  </span>
                  <span className="mono shrink-0 text-[10px] text-faint">
                    {formatDate(project.updatedAt)}
                  </span>
                </Link>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-line px-3 py-6 text-center text-[12px] text-faint">
                No projects yet.
              </p>
            )}
          </div>
        </section>
      </div>

      <section className="panel p-4">
        <h2 className="text-[13.5px] font-semibold text-ink">Edit content</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {types.map((type) => (
            <Link
              key={type.key}
              href={adminHref(type.key)}
              className="flex items-center gap-2.5 rounded-xl border border-line bg-surface-2/40 px-3 py-2.5 text-[12.5px] text-muted transition-colors hover:border-line-strong hover:text-accent"
            >
              <Icon
                name={type.singleton ? "Settings" : "FolderKanban"}
                className="h-3.5 w-3.5 shrink-0"
              />
              <span className="truncate">{type.label}</span>
              {type.singleton ? (
                <span className="mono ml-auto shrink-0 text-[9px] uppercase tracking-[0.14em] text-faint">
                  single
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
