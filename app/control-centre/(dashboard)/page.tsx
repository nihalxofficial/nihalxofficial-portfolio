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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {counts
          ? cards.map((card) => (
              <Link
                key={card.label}
                href={card.href}
                className="hud !rounded-2xl p-5 group hover:border-acc/50 transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-acc/40 to-transparent pointer-events-none" />
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-xl border border-acc/30 bg-acc/10 text-acc shadow-[0_0_12px_rgba(0,229,255,0.15)] group-hover:scale-105 transition-transform">
                    <Icon name={card.icon} className="h-4 w-4" />
                  </span>
                  <Icon
                    name="ArrowUpRight"
                    className="h-4 w-4 text-slate-500 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-acc"
                  />
                </div>
                <p className="mt-4 text-3xl font-bold font-mono tracking-tight text-white">{card.value}</p>
                <p className="mt-1 text-sm font-semibold text-slate-200">{card.label}</p>
                <p className="mt-0.5 font-mono text-[11px] text-slate-400">{card.hint}</p>
              </Link>
            ))
          : Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="hud !rounded-2xl space-y-3 p-5">
                <span className="block h-10 w-10 animate-pulse rounded-xl bg-surface-2" />
                <span className="block h-7 w-16 animate-pulse rounded bg-surface-2" />
                <span className="block h-3 w-24 animate-pulse rounded bg-surface-2" />
              </div>
            ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="hud !rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-acc/30 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between border-b border-white/5 pb-3.5 mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Icon name="Inbox" className="h-4 w-4 text-acc" />
              Latest messages
            </h2>
            <Link
              href={adminHref("messages")}
              className="mono text-[10px] uppercase tracking-[0.16em] text-acc hover:underline flex items-center gap-1"
            >
              Open inbox
              <Icon name="ArrowRight" className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {overview?.recentMessages.length ? (
              overview.recentMessages.map((message) => (
                <div
                  key={message._id}
                  className="rounded-xl border border-white/5 bg-white/[0.02] hover:border-acc/30 px-3.5 py-3 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-semibold text-white">{message.name}</p>
                    <span
                      className={`mono rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] font-semibold ${
                        message.status === "unread"
                          ? "border-acc/40 bg-acc/10 text-acc"
                          : "border-white/10 text-slate-500"
                      }`}
                    >
                      {message.status}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-slate-400">
                    {message.subject || message.email}
                  </p>
                  <p className="mono mt-1 text-[10px] text-slate-500">{formatDate(message.createdAt)}</p>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-white/10 px-3 py-8 text-center text-xs text-slate-500 font-mono">
                No messages yet.
              </p>
            )}
          </div>
        </section>

        <section className="hud !rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-acc/30 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between border-b border-white/5 pb-3.5 mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Icon name="FolderCode" className="h-4 w-4 text-acc" />
              Recently updated projects
            </h2>
            <Link
              href={adminHref("projects")}
              className="mono text-[10px] uppercase tracking-[0.16em] text-acc hover:underline flex items-center gap-1"
            >
              Manage
              <Icon name="ArrowRight" className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {overview?.recentProjects.length ? (
              overview.recentProjects.map((project) => (
                <Link
                  key={project._id}
                  href={adminHref("projects")}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] hover:border-acc/30 px-3.5 py-3 transition-colors group"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold text-white group-hover:text-acc transition-colors">
                      {project.title}
                    </span>
                    <span className="mono block truncate text-[10px] text-slate-500">
                      /{project.slug}
                    </span>
                  </span>
                  <span className="mono shrink-0 text-[10px] text-slate-500">
                    {formatDate(project.updatedAt)}
                  </span>
                </Link>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-white/10 px-3 py-8 text-center text-xs text-slate-500 font-mono">
                No projects yet.
              </p>
            )}
          </div>
        </section>
      </div>

      <section className="hud !rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-acc/30 to-transparent pointer-events-none" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-3.5 flex items-center gap-2">
          <Icon name="Sliders" className="h-4 w-4 text-acc" />
          Edit content schemas
        </h2>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {types.map((type) => (
            <Link
              key={type.key}
              href={adminHref(type.key)}
              className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:border-acc/40 hover:bg-acc/5 px-3.5 py-2.5 text-xs text-slate-300 transition-colors group"
            >
              <Icon
                name={type.singleton ? "Settings" : "FolderKanban"}
                className="h-3.5 w-3.5 shrink-0 text-acc"
              />
              <span className="truncate group-hover:text-white font-medium">{type.label}</span>
              {type.singleton ? (
                <span className="mono ml-auto shrink-0 text-[9px] uppercase tracking-[0.14em] text-slate-500 font-semibold">
                  singleton
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
