"use client";

import { Input, Label, TextField } from "@heroui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import {
  AdminApiError,
  deleteMessage,
  listMessages,
  updateMessageStatus,
  type ContactMessage,
} from "@/lib/admin";
import { formatDate } from "@/lib/utils";

/**
 * Contact inbox.
 *
 * Messages arrive from the public form (and are mirrored to email when SMTP is
 * configured). The dashboard only ever changes the workflow status, so the
 * visitor's words are never edited.
 */

const FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "read", label: "Read" },
  { key: "replied", label: "Replied" },
  { key: "archived", label: "Archived" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

const STATUS_STYLES: Record<ContactMessage["status"], string> = {
  unread: "border-accent/40 bg-accent/10 text-accent",
  read: "border-line text-muted",
  replied: "border-success/40 bg-success/10 text-success",
  archived: "border-line text-faint",
};

function statusStyle(status: ContactMessage["status"]) {
  return STATUS_STYLES[status] ?? STATUS_STYLES.read;
}

export default function AdminMessagesPage() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<ContactMessage[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(query.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    listMessages({ page, status: filter === "all" ? undefined : filter, search })
      .then((result) => {
        if (cancelled) return;
        setItems(result.items);
        setTotal(result.meta.total);
        setPages(result.meta.totalPages);
        setError("");
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setError(
          cause instanceof AdminApiError ? cause.message : "Could not load the inbox.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, filter, search, nonce]);

  const unread = useMemo(() => items.filter((item) => item.status === "unread").length, [items]);

  const changeStatus = useCallback(async (message: ContactMessage, status: ContactMessage["status"]) => {
    setBusyId(message._id);

    try {
      await updateMessageStatus(message._id, status);
      setItems((previous) =>
        previous.map((item) => (item._id === message._id ? { ...item, status } : item)),
      );
      if (filter !== "all" && filter !== status) {
        setItems((previous) => previous.filter((item) => item._id !== message._id));
        setTotal((value) => Math.max(0, value - 1));
      }
    } catch (cause) {
      setError(cause instanceof AdminApiError ? cause.message : "Could not update this message.");
    } finally {
      setBusyId(null);
    }
  }, [filter]);

  const remove = useCallback(async (id: string) => {
    setBusyId(id);

    try {
      await deleteMessage(id);
      setConfirmId(null);
      setItems((previous) => previous.filter((item) => item._id !== id));
      setTotal((value) => Math.max(0, value - 1));
    } catch (cause) {
      setError(cause instanceof AdminApiError ? cause.message : "Could not delete this message.");
    } finally {
      setBusyId(null);
    }
  }, []);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.22em] text-accent">Inbox</p>
          <h1 className="mt-1.5 text-2xl font-semibold text-ink">Messages</h1>
          <p className="mt-1 text-[12.5px] text-muted">
            {total} message{total === 1 ? "" : "s"}
            {unread > 0 ? ` · ${unread} unread on this page` : ""}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setNonce((value) => value + 1)}
          className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-[12px] font-medium text-muted transition-colors hover:border-line-strong hover:text-accent"
        >
          <Icon name="Loader" className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </header>

      {error ? (
        <p className="rounded-xl border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-[12px] text-danger">
          {error}
        </p>
      ) : null}

      <section className="panel overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
          <div className="flex flex-wrap items-center gap-1">
            {FILTERS.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => {
                  setFilter(option.key);
                  setPage(1);
                }}
                className={`mono rounded-full border px-2.5 py-1 text-[9.5px] uppercase tracking-[0.14em] transition-colors ${
                  filter === option.key
                    ? "border-accent/50 bg-accent/15 text-accent"
                    : "border-line text-faint hover:border-line-strong hover:text-muted"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <TextField
            value={query}
            onChange={setQuery}
            className="ml-auto flex min-w-[180px] flex-1 items-center gap-2 sm:max-w-xs"
          >
            <Label className="sr-only">Search messages</Label>
            <Input placeholder="Search name, email or subject…" />
          </TextField>
        </div>

        {loading && items.length === 0 ? (
          <p className="flex items-center gap-2 px-4 py-10 text-[12px] text-faint">
            <Icon name="Loader" className="h-4 w-4 animate-spin" />
            Loading messages…
          </p>
        ) : items.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <Icon name="Inbox" className="mx-auto h-6 w-6 text-faint" />
            <p className="mt-2 text-[12.5px] text-muted">
              {search || filter !== "all" ? "No messages match this filter." : "The inbox is empty."}
            </p>
          </div>
        ) : (
          <ul className={`divide-y divide-line ${loading ? "opacity-60" : ""}`}>
            {items.map((message) => {
              const open = openId === message._id;

              return (
                <li key={message._id} className="px-4 py-3">
                  <div className="flex flex-wrap items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[13px] font-semibold text-ink">{message.name}</p>
                        <span
                          className={`mono rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] ${statusStyle(message.status)}`}
                        >
                          {message.status}
                        </span>
                        {message.emailDelivered === false ? (
                          <span className="mono rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] text-warning">
                            email not sent
                          </span>
                        ) : null}
                      </div>

                      <p className="mono mt-1 text-[10.5px] text-faint">
                        <a href={`mailto:${message.email}`} className="hover:text-accent">
                          {message.email}
                        </a>
                        {message.location ? ` · ${message.location}` : ""} · {formatDate(message.createdAt)}
                      </p>

                      {message.subject ? (
                        <p className="mt-1.5 text-[12.5px] font-medium text-ink">{message.subject}</p>
                      ) : null}

                      <p
                        className={`mt-1 whitespace-pre-wrap text-[12px] leading-relaxed text-muted ${
                          open ? "" : "line-clamp-2"
                        }`}
                      >
                        {message.message}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setOpenId(open ? null : message._id)}
                          className="mono inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-[9px] uppercase tracking-[0.14em] text-faint transition-colors hover:border-line-strong hover:text-accent"
                        >
                          <Icon name={open ? "EyeOff" : "Eye"} className="h-3 w-3" />
                          {open ? "collapse" : "read"}
                        </button>

                        <a
                          href={`mailto:${message.email}?subject=${encodeURIComponent(
                            `Re: ${message.subject || "your message"}`,
                          )}`}
                          className="mono inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-[9px] uppercase tracking-[0.14em] text-faint transition-colors hover:border-line-strong hover:text-accent"
                        >
                          <Icon name="Send" className="h-3 w-3" />
                          reply
                        </a>

                        {(["read", "replied", "archived"] as const)
                          .filter((status) => status !== message.status)
                          .map((status) => (
                            <button
                              key={status}
                              type="button"
                              disabled={busyId === message._id}
                              onClick={() => void changeStatus(message, status)}
                              className="mono inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-[9px] uppercase tracking-[0.14em] text-faint transition-colors hover:border-line-strong hover:text-accent disabled:opacity-40"
                            >
                              <Icon name="Check" className="h-3 w-3" />
                              {status}
                            </button>
                          ))}

                        <button
                          type="button"
                          onClick={() => setConfirmId(message._id)}
                          className="mono inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-[9px] uppercase tracking-[0.14em] text-faint transition-colors hover:border-danger/40 hover:text-danger"
                        >
                          <Icon name="Trash" className="h-3 w-3" />
                          delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {confirmId === message._id ? (
                    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2">
                      <p className="text-[11.5px] text-danger">Delete this message permanently?</p>
                      <button
                        type="button"
                        disabled={busyId === message._id}
                        onClick={() => void remove(message._id)}
                        className="rounded-md border border-danger/40 bg-danger/15 px-2.5 py-1 text-[11px] font-semibold text-danger disabled:opacity-50"
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmId(null)}
                        className="rounded-md border border-line px-2.5 py-1 text-[11px] text-muted"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}

        {pages > 1 ? (
          <div className="flex items-center justify-between gap-2 border-t border-line px-4 py-2.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="mono inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-[9.5px] uppercase tracking-[0.14em] text-faint transition-colors hover:text-accent disabled:opacity-40"
            >
              <Icon name="ArrowLeft" className="h-3 w-3" />
              prev
            </button>
            <span className="mono text-[10px] text-faint">
              page {page} / {pages}
            </span>
            <button
              type="button"
              disabled={page >= pages}
              onClick={() => setPage((value) => Math.min(pages, value + 1))}
              className="mono inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-[9.5px] uppercase tracking-[0.14em] text-faint transition-colors hover:text-accent disabled:opacity-40"
            >
              next
              <Icon name="ArrowRight" className="h-3 w-3" />
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
