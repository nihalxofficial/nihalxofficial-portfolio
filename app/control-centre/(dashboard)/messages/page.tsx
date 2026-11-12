"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Modal } from "@/components/admin/modal";
import { ConfirmDialog } from "@/components/admin/ui";
import {
  AdminApiError,
  deleteMessage,
  getMessage,
  listMessages,
  replyToMessage,
  updateMessageStatus,
  type ContactMessage,
  type MessageListOptions,
} from "@/lib/admin";
import { cn, formatDateTime, timeAgo, truncate } from "@/lib/utils";

/**
 * Contact inbox.
 *
 * A real table: search, sortable columns, status/delivery/date filters and
 * pagination. A row opens the full message with its reply thread, and the reply
 * composer sends through the API's SMTP transport — the visitor's own words are
 * never editable, only the workflow status is.
 */

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "read", label: "Read" },
  { key: "replied", label: "Replied" },
  { key: "archived", label: "Archived" },
] as const;

const DELIVERY_FILTERS = [
  { key: "all", label: "Any delivery" },
  { key: "delivered", label: "Emailed" },
  { key: "failed", label: "Email failed" },
] as const;

const PAGE_SIZES = [10, 20, 50] as const;

type StatusKey = (typeof STATUS_FILTERS)[number]["key"];
type DeliveryKey = (typeof DELIVERY_FILTERS)[number]["key"];
type SortKey = "createdAt" | "name" | "subject" | "status";

const STATUS_STYLES: Record<ContactMessage["status"], string> = {
  unread: "border-accent/40 bg-accent/10 text-accent",
  read: "border-line text-muted",
  replied: "border-success/40 bg-success/10 text-success",
  archived: "border-line text-faint",
};

const COLUMNS: Array<{ key: SortKey | null; label: string; className: string }> = [
  { key: "status", label: "Status", className: "w-[110px]" },
  { key: "name", label: "From", className: "min-w-[190px]" },
  { key: "subject", label: "Subject", className: "min-w-[170px]" },
  { key: null, label: "Message", className: "min-w-[260px]" },
  { key: "createdAt", label: "Received", className: "w-[150px]" },
  { key: null, label: "", className: "w-[128px] text-right" },
];

function toQuerySort(key: SortKey, dir: "asc" | "desc"): Pick<MessageListOptions, "sort" | "dir"> {
  if (key === "createdAt") return { sort: dir === "asc" ? "oldest" : "newest" };
  return { sort: key, dir };
}

function toISODay(value: string, end = false): string | undefined {
  if (!value) return undefined;
  const date = new Date(`${value}T${end ? "23:59:59" : "00:00:00"}`);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export default function AdminMessagesPage() {
  const [items, setItems] = useState<ContactMessage[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);

  const [status, setStatus] = useState<StatusKey>("all");
  const [delivery, setDelivery] = useState<DeliveryKey>("all");
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [limit, setLimit] = useState<number>(20);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");

  const [detail, setDetail] = useState<ContactMessage | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [replyFor, setReplyFor] = useState<ContactMessage | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Debounce the free-text search so typing does not hammer the API.
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      setSearch(draft.trim());
      setPage(1);
    }, 320);
    return () => clearTimeout(timer);
  }, [draft]);

  const query = useMemo(
    () => ({
      page,
      limit,
      status: status === "all" ? undefined : status,
      delivery: delivery === "all" ? undefined : delivery,
      search: search || undefined,
      from: toISODay(from),
      to: toISODay(to, true),
      ...toQuerySort(sortKey, sortDir),
    }),
    [page, limit, status, delivery, search, from, to, sortKey, sortDir],
  );

  function apply(result: { items: ContactMessage[]; meta: { total: number; totalPages: number; unreadCount?: number } }) {
    setItems(result.items);
    setTotal(result.meta.total);
    setPages(result.meta.totalPages);
    setUnreadCount(result.meta.unreadCount ?? 0);
    setError("");
  }

  // Fetching lives outside the effect so React only sees promise callbacks,
  // which keeps the render cascade clean.
  const fetchList = useCallback(() => listMessages(query), [query]);

  useEffect(() => {
    let cancelled = false;

    fetchList()
      .then((result) => {
        if (!cancelled) apply(result);
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(cause instanceof AdminApiError ? cause.message : "Could not load the inbox.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fetchList]);

  /** Imperative reload after a mutation, with the table dimmed while it runs. */
  const load = useCallback(async () => {
    setLoading(true);

    try {
      apply(await fetchList());
    } catch (cause) {
      setError(cause instanceof AdminApiError ? cause.message : "Could not load the inbox.");
    } finally {
      setLoading(false);
    }
  }, [fetchList]);

  /** Any filter/page/sort change goes through here so loading is honest. */
  const change = useCallback((mutate: () => void) => {
    setLoading(true);
    mutate();
  }, []);

  const filtersActive = useMemo(
    () => status !== "all" || delivery !== "all" || Boolean(search) || Boolean(from) || Boolean(to),
    [status, delivery, search, from, to],
  );

  function clearFilters() {
    change(() => {
      setStatus("all");
      setDelivery("all");
      setDraft("");
      setFrom("");
      setTo("");
      setPage(1);
    });
  }

  function toggleSort(key: SortKey) {
    change(() => {
      if (key === sortKey) {
        setSortDir((value) => (value === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDir(key === "createdAt" ? "desc" : "asc");
      }
      setPage(1);
    });
  }

  async function openDetail(message: ContactMessage) {
    setDetail(message);
    setDetailLoading(true);

    try {
      const full = await getMessage(message._id);
      setDetail(full);
      // Opening a message marks it read server-side, so sync the row.
      if (full.status !== message.status) {
        setItems((rows) =>
          rows.map((row) => (row._id === full._id ? { ...row, status: full.status } : row)),
        );
        setUnreadCount((value) => (message.status === "unread" ? Math.max(0, value - 1) : value));
      }
    } catch (cause) {
      setError(cause instanceof AdminApiError ? cause.message : "Could not open this message.");
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }

  async function changeStatus(message: ContactMessage, next: ContactMessage["status"]) {
    setBusyId(message._id);
    setFlash("");

    try {
      await updateMessageStatus(message._id, next);
      setItems((rows) =>
        rows.map((row) => (row._id === message._id ? { ...row, status: next } : row)),
      );
      setDetail((current) => (current?._id === message._id ? { ...current, status: next } : current));
      if (next !== "unread" && message.status === "unread") {
        setUnreadCount((value) => Math.max(0, value - 1));
      }
      if (status !== "all" && status !== next) void load();
    } catch (cause) {
      setError(cause instanceof AdminApiError ? cause.message : "Could not update this message.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(message: ContactMessage) {
    setBusyId(message._id);

    try {
      await deleteMessage(message._id);
      setDetail(null);
      setItems((rows) => rows.filter((row) => row._id !== message._id));
      setTotal((value) => Math.max(0, value - 1));
      setFlash(`Deleted the message from ${message.name}.`);
      if (items.length <= 1 && page > 1) change(() => setPage((value) => Math.max(1, value - 1)));
      else void load();
    } catch (cause) {
      setError(cause instanceof AdminApiError ? cause.message : "Could not delete this message.");
    } finally {
      setBusyId(null);
    }
  }

  function onReplySent(message: ContactMessage) {
    setReplyFor(null);
    setItems((rows) =>
      rows.map((row) => (row._id === message._id ? { ...row, status: "replied" } : row)),
    );
    setDetail((current) =>
      current?._id === message._id ? { ...current, status: "replied" } : current,
    );
    setFlash(`Reply sent to ${message.email}.`);
  }

  const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = Math.min(total, page * limit);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.22em] text-accent">Inbox</p>
          <h1 className="mt-1.5 text-2xl font-semibold text-ink">Messages</h1>
          <p className="mt-1 text-[12.5px] text-muted">
            {total} message{total === 1 ? "" : "s"} in view
            {unreadCount > 0 ? ` · ${unreadCount} unread` : " · nothing unread"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-[12px] font-medium text-muted transition-colors hover:border-line-strong hover:text-accent"
          >
            <Icon name="RefreshCw" className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            Refresh
          </button>
        </div>
      </header>

      {error ? (
        <p className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-[12px] text-danger">
          <Icon name="X" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      ) : null}

      {flash ? (
        <p className="flex items-start gap-2 rounded-xl border border-success/30 bg-success/10 px-3.5 py-2.5 text-[12px] text-success">
          <Icon name="CheckCheck" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {flash}
        </p>
      ) : null}

      <section className="panel overflow-hidden">
        {/* ── Filters ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 border-b border-line px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-1">
              {STATUS_FILTERS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() =>
                    change(() => {
                      setStatus(option.key);
                      setPage(1);
                    })
                  }
                  className={cn(
                    "mono rounded-full border px-2.5 py-1 text-[9.5px] uppercase tracking-[0.14em] transition-colors",
                    status === option.key
                      ? "border-accent/50 bg-accent/15 text-accent"
                      : "border-line text-faint hover:border-line-strong hover:text-muted",
                  )}
                >
                  {option.label}
                  {option.key === "unread" && unreadCount > 0 ? ` (${unreadCount})` : ""}
                </button>
              ))}
            </div>

            <label className="relative ml-auto flex min-w-[200px] flex-1 items-center sm:max-w-xs">
              <Icon
                name="Search"
                className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-faint"
              />
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Search name, email, subject…"
                className="h-9 w-full rounded-lg border border-line bg-surface-2/50 pl-9 pr-3 text-[12px] text-ink outline-none transition-colors placeholder:text-faint focus:border-accent"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={delivery}
              onChange={(event) =>
                change(() => {
                  setDelivery(event.target.value as DeliveryKey);
                  setPage(1);
                })
              }
              className="mono h-8 rounded-lg border border-line bg-surface-2/50 px-2 text-[10px] uppercase tracking-[0.12em] text-muted outline-none focus:border-accent"
            >
              {DELIVERY_FILTERS.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>

            <span className="mono flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-faint">
              <Icon name="Calendar" className="h-3.5 w-3.5" />
              <input
                type="date"
                value={from}
                onChange={(event) =>
                  change(() => {
                    setFrom(event.target.value);
                    setPage(1);
                  })
                }
                className="h-8 rounded-lg border border-line bg-surface-2/50 px-2 text-[11px] text-muted outline-none focus:border-accent"
              />
              →
              <input
                type="date"
                value={to}
                onChange={(event) =>
                  change(() => {
                    setTo(event.target.value);
                    setPage(1);
                  })
                }
                className="h-8 rounded-lg border border-line bg-surface-2/50 px-2 text-[11px] text-muted outline-none focus:border-accent"
              />
            </span>

            <label className="mono flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-faint">
              per page
              <select
                value={limit}
                onChange={(event) =>
                  change(() => {
                    setLimit(Number(event.target.value));
                    setPage(1);
                  })
                }
                className="h-8 rounded-lg border border-line bg-surface-2/50 px-2 text-[10px] uppercase tracking-[0.12em] text-muted outline-none focus:border-accent"
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>

            {filtersActive ? (
              <button
                type="button"
                onClick={clearFilters}
                className="mono inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-[10px] uppercase tracking-[0.12em] text-faint transition-colors hover:border-danger/40 hover:text-danger"
              >
                <Icon name="X" className="h-3 w-3" />
                clear filters
              </button>
            ) : null}
          </div>
        </div>

        {/* ── Table ───────────────────────────────────────────────────────── */}
        {loading && items.length === 0 ? (
          <div className="space-y-2 px-4 py-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-11 animate-pulse rounded-lg bg-surface-2/60" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="px-4 py-14 text-center">
            <Icon name="Inbox" className="mx-auto h-6 w-6 text-faint" />
            <p className="mt-2 text-[12.5px] text-muted">
              {filtersActive ? "No messages match these filters." : "The inbox is empty."}
            </p>
          </div>
        ) : (
          <div className={cn("overflow-x-auto transition-opacity", loading && "opacity-60")}>
            <table className="w-full min-w-[860px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line bg-surface-2/40">
                  {COLUMNS.map((column) => {
                    const active = column.key && column.key === sortKey;

                    return (
                      <th
                        key={column.label || "actions"}
                        scope="col"
                        className={cn("px-3 py-2.5", column.className)}
                      >
                        {column.key ? (
                          <button
                            type="button"
                            onClick={() => toggleSort(column.key as SortKey)}
                            className={cn(
                              "mono inline-flex items-center gap-1 text-[9.5px] uppercase tracking-[0.16em] transition-colors",
                              active ? "text-accent" : "text-faint hover:text-muted",
                            )}
                          >
                            {column.label}
                            <Icon
                              name={active ? (sortDir === "asc" ? "ArrowUp" : "ArrowDown") : "ChevronsUpDown"}
                              className="h-3 w-3"
                            />
                          </button>
                        ) : (
                          <span className="mono text-[9.5px] uppercase tracking-[0.16em] text-faint">
                            {column.label}
                          </span>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {items.map((message) => (
                  <tr
                    key={message._id}
                    onClick={() => void openDetail(message)}
                    className={cn(
                      "cursor-pointer border-b border-line/60 transition-colors hover:bg-surface-2/50",
                      message.status === "unread" && "bg-accent/[0.04]",
                    )}
                  >
                    <td className="px-3 py-2.5 align-top">
                      <span
                        className={cn(
                          "mono inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.14em]",
                          STATUS_STYLES[message.status] ?? STATUS_STYLES.read,
                        )}
                      >
                        {message.status === "unread" ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        ) : null}
                        {message.status}
                      </span>
                      {message.emailDelivered === false ? (
                        <span className="mono mt-1 block text-[8.5px] uppercase tracking-[0.12em] text-warning">
                          email failed
                        </span>
                      ) : null}
                    </td>

                    <td className="px-3 py-2.5 align-top">
                      <p className="truncate text-[12.5px] font-semibold text-ink">
                        {message.name}
                      </p>
                      <p className="mono truncate text-[10.5px] text-faint">{message.email}</p>
                    </td>

                    <td className="px-3 py-2.5 align-top">
                      <p className="truncate text-[12px] text-ink">
                        {message.subject || "—"}
                      </p>
                      {message.location ? (
                        <p className="mono truncate text-[10px] text-faint">{message.location}</p>
                      ) : null}
                    </td>

                    <td className="px-3 py-2.5 align-top">
                      <p className="max-w-[380px] truncate text-[11.5px] leading-relaxed text-muted">
                        {truncate(message.message, 120)}
                      </p>
                      {message.replies && message.replies.length > 0 ? (
                        <span className="mono mt-0.5 inline-flex items-center gap-1 text-[9.5px] uppercase tracking-[0.12em] text-success">
                          <Icon name="Reply" className="h-3 w-3" />
                          {message.replies.length} reply
                          {message.replies.length === 1 ? "" : "ies"}
                        </span>
                      ) : null}
                    </td>

                    <td className="px-3 py-2.5 align-top">
                      <p className="mono text-[10.5px] text-muted">{timeAgo(message.createdAt)}</p>
                      <p className="mono text-[9.5px] text-faint">{formatDateTime(message.createdAt).split(" · ")[0]}</p>
                    </td>

                    <td className="px-3 py-2.5 text-right align-top">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          aria-label={`Reply to ${message.name}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            setReplyFor(message);
                          }}
                          className="grid h-7 w-7 place-items-center rounded-md border border-line text-faint transition-colors hover:border-accent/50 hover:text-accent"
                        >
                          <Icon name="Reply" className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Open ${message.name}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            void openDetail(message);
                          }}
                          className="grid h-7 w-7 place-items-center rounded-md border border-line text-faint transition-colors hover:border-line-strong hover:text-ink"
                        >
                          <Icon name="Eye" className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Archive ${message.name}`}
                          disabled={busyId === message._id || message.status === "archived"}
                          onClick={(event) => {
                            event.stopPropagation();
                            void changeStatus(message, "archived");
                          }}
                          className="grid h-7 w-7 place-items-center rounded-md border border-line text-faint transition-colors hover:border-line-strong hover:text-ink disabled:opacity-30"
                        >
                          <Icon name="Inbox" className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ──────────────────────────────────────────────────── */}
        {total > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-2.5">
            <p className="mono text-[10px] uppercase tracking-[0.14em] text-faint">
              {rangeStart}–{rangeEnd} of {total}
            </p>

            <div className="flex items-center gap-1">
              <PageButton
                label="prev"
                icon="ArrowLeft"
                disabled={page <= 1}
                onClick={() => change(() => setPage((value) => Math.max(1, value - 1)))}
              />

              {pageWindow(page, pages).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => value > 0 && change(() => setPage(value))}
                  className={cn(
                    "mono h-7 min-w-7 rounded-md border px-2 text-[10px] transition-colors",
                    value === page
                      ? "border-accent/50 bg-accent/15 text-accent"
                      : "border-line text-faint hover:border-line-strong hover:text-muted",
                  )}
                >
                  {value === -1 ? "…" : value}
                </button>
              ))}

              <PageButton
                label="next"
                icon="ArrowRight"
                alignRight
                disabled={page >= pages}
                onClick={() => change(() => setPage((value) => Math.min(pages, value + 1)))}
              />
            </div>
          </div>
        ) : null}
      </section>

      {detail ? (
        <DetailModal
          message={detail}
          loading={detailLoading}
          busy={busyId === detail._id}
          onClose={() => setDetail(null)}
          onStatus={(next) => void changeStatus(detail, next)}
          onReply={() => setReplyFor(detail)}
          onDelete={() => void remove(detail)}
        />
      ) : null}

      {replyFor ? (
        <ReplyModal
          message={replyFor}
          onClose={() => setReplyFor(null)}
          onSent={() => onReplySent(replyFor)}
        />
      ) : null}
    </div>
  );
}

function PageButton({
  label,
  icon,
  disabled,
  alignRight = false,
  onClick,
}: {
  label: string;
  icon: string;
  disabled: boolean;
  alignRight?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "mono inline-flex h-7 items-center gap-1 rounded-md border border-line px-2 text-[9.5px] uppercase tracking-[0.14em] text-faint transition-colors hover:text-accent disabled:opacity-40",
        alignRight && "flex-row-reverse",
      )}
    >
      <Icon name={icon} className="h-3 w-3" />
      {label}
    </button>
  );
}

/** Windowed page numbers with "…" (-1) for the skipped ranges. */
function pageWindow(current: number, total: number): number[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((value) => value >= 1 && value <= total).sort((a, b) => a - b);

  const output: number[] = [];
  sorted.forEach((value, index) => {
    if (index > 0 && value - sorted[index - 1] > 1) output.push(-1);
    output.push(value);
  });
  return output;
}

function DetailModal({
  message,
  loading,
  busy,
  onClose,
  onStatus,
  onReply,
  onDelete,
}: {
  message: ContactMessage;
  loading: boolean;
  busy: boolean;
  onClose: () => void;
  onStatus: (status: ContactMessage["status"]) => void;
  onReply: () => void;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const replies = message.replies ?? [];

  return (
    <>
      <Modal
        title={message.subject || "Portfolio inquiry"}
        label={`message · ${message._id.slice(-8)}`}
        onClose={onClose}
        width="max-w-3xl"
        footer={
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => setConfirmDelete(true)}
              className="mr-auto inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-[11px] text-faint transition-colors hover:border-danger/40 hover:text-danger disabled:opacity-50"
            >
              <Icon name="Trash2" className="h-3 w-3" />
              Delete
            </button>

          {(["read", "replied", "archived"] as const)
            .filter((value) => value !== message.status)
            .map((value) => (
              <button
                key={value}
                type="button"
                disabled={busy}
                onClick={() => onStatus(value)}
                className="mono rounded-md border border-line px-2.5 py-1.5 text-[9.5px] uppercase tracking-[0.14em] text-faint transition-colors hover:border-line-strong hover:text-accent disabled:opacity-50"
              >
                mark {value}
              </button>
            ))}

          <button
            type="button"
            onClick={onReply}
            className="inline-flex items-center gap-1.5 rounded-lg grad-accent px-3 py-1.5 text-[12px] font-semibold text-accent-ink"
          >
            <Icon name="Reply" className="h-3.5 w-3.5" />
            Reply
          </button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="From" value={message.name} />
        <Field label="Email" value={message.email} href={`mailto:${message.email}`} accent />
        <Field label="Location" value={message.location || "—"} />
        <Field label="Received" value={formatDateTime(message.createdAt)} />
      </div>

      <p className="mono mt-4 text-[9.5px] uppercase tracking-[0.16em] text-faint">Message</p>
      <div className="mt-1.5 rounded-xl border border-line bg-surface-2/40 p-4">
        {loading ? (
          <div className="space-y-2">
            <div className="h-3 w-3/4 animate-pulse rounded bg-line" />
            <div className="h-3 w-full animate-pulse rounded bg-line" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-line" />
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed text-ink">
            {message.message}
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="mono text-[9.5px] uppercase tracking-[0.16em] text-faint">
          Reply thread ({replies.length})
        </p>
        <a
          href={`mailto:${message.email}?subject=${encodeURIComponent(
            `Re: ${message.subject || "your message"}`,
          )}`}
          className="mono inline-flex items-center gap-1 text-[9.5px] uppercase tracking-[0.14em] text-faint transition-colors hover:text-accent"
        >
          <Icon name="Mail" className="h-3 w-3" />
          open in mail app
        </a>
      </div>

      {replies.length === 0 ? (
        <p className="mt-1.5 rounded-xl border border-dashed border-line px-3.5 py-3 text-[11.5px] text-faint">
          No replies sent from the dashboard yet.
        </p>
      ) : (
        <ul className="mt-1.5 space-y-2">
          {replies.map((reply, index) => (
            <li key={reply._id ?? index} className="rounded-xl border border-line bg-surface/60 p-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="mono text-[9.5px] uppercase tracking-[0.14em] text-success">
                  sent to {reply.to}
                </span>
                <span className="mono ml-auto text-[9.5px] text-faint">
                  {formatDateTime(reply.sentAt)}
                </span>
              </div>
              <p className="mt-1 text-[12px] font-medium text-ink">{reply.subject}</p>
              <p className="mt-1 whitespace-pre-wrap text-[11.5px] leading-relaxed text-muted">
                {reply.body}
              </p>
            </li>
          ))}
        </ul>
      )}

      {message.userAgent ? (
        <p className="mono mt-4 truncate text-[9.5px] text-faint" title={message.userAgent}>
          agent · {message.userAgent}
        </p>
      ) : null}
    </Modal>
    <ConfirmDialog
      open={confirmDelete}
      title="Delete message?"
      message="This message and all replies will be permanently deleted from the database. This cannot be undone."
      confirmLabel="Delete"
      status="danger"
      busy={busy}
      onConfirm={() => {
        setConfirmDelete(false);
        onDelete();
      }}
      onCancel={() => setConfirmDelete(false)}
    />
  </>
  );
}

function Field({
  label,
  value,
  href,
  accent = false,
}: {
  label: string;
  value: string;
  href?: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="mono text-[9.5px] uppercase tracking-[0.16em] text-faint">{label}</p>
      {href ? (
        <a
          href={href}
          className={cn(
            "mono mt-0.5 block truncate text-[12px] hover:underline",
            accent ? "text-accent" : "text-ink",
          )}
        >
          {value}
        </a>
      ) : (
        <p className="mt-0.5 truncate text-[12px] text-ink">{value}</p>
      )}
    </div>
  );
}

function ReplyModal({
  message,
  onClose,
  onSent,
}: {
  message: ContactMessage;
  onClose: () => void;
  onSent: () => void;
}) {
  const [to, setTo] = useState(message.email);
  const [subject, setSubject] = useState(`Re: ${message.subject || "your message"}`);
  const [body, setBody] = useState(() => defaultDraft(message));
  const [ccOwner, setCcOwner] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function send() {
    if (sending) return;
    setSending(true);
    setError("");

    try {
      await replyToMessage({ id: message._id, to: to.trim(), subject: subject.trim(), body, ccOwner });
      onSent();
    } catch (cause) {
      setError(
        cause instanceof AdminApiError
          ? cause.message
          : "The reply could not be sent. Check the server SMTP settings.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <Modal
      title={`Reply to ${message.name}`}
      label="smtp · new message"
      onClose={onClose}
      width="max-w-2xl"
      footer={
        <>
          <label className="mono mr-auto flex items-center gap-2 text-[9.5px] uppercase tracking-[0.14em] text-faint">
            <input
              type="checkbox"
              checked={ccOwner}
              onChange={(event) => setCcOwner(event.target.checked)}
              className="h-3.5 w-3.5 accent-[var(--accent)]"
            />
            keep a copy
          </label>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-line px-3 py-1.5 text-[12px] text-muted transition-colors hover:text-ink"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={sending || !to.trim() || !subject.trim() || !body.trim()}
            onClick={() => void send()}
            className="inline-flex items-center gap-2 rounded-lg grad-accent px-3.5 py-1.5 text-[12px] font-semibold text-accent-ink disabled:opacity-60"
          >
            <Icon name={sending ? "Loader" : "Send"} className={cn("h-3.5 w-3.5", sending && "animate-spin")} />
            {sending ? "Sending…" : "Send reply"}
          </button>
        </>
      }
    >
      {error ? (
        <p className="mb-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-[11.5px] text-danger">
          {error}
        </p>
      ) : null}

      <div className="space-y-3">
        <label className="block">
          <span className="mono text-[9.5px] uppercase tracking-[0.16em] text-faint">To</span>
          <input
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="mono mt-1 h-9 w-full rounded-lg border border-line bg-surface-2/50 px-3 text-[12px] text-ink outline-none focus:border-accent"
          />
        </label>

        <label className="block">
          <span className="mono text-[9.5px] uppercase tracking-[0.16em] text-faint">Subject</span>
          <input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className="mt-1 h-9 w-full rounded-lg border border-line bg-surface-2/50 px-3 text-[12px] text-ink outline-none focus:border-accent"
          />
        </label>

        <label className="block">
          <span className="mono text-[9.5px] uppercase tracking-[0.16em] text-faint">Message</span>
          <textarea
            rows={9}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-surface-2/50 p-3 text-[12px] leading-relaxed text-ink outline-none focus:border-accent"
          />
        </label>

        <p className="mono rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-[10px] leading-relaxed text-faint">
          Sent from the server SMTP account with the site branding. The original message is quoted
          automatically in the email body.
        </p>
      </div>
    </Modal>
  );
}

/** A starting point the admin edits — never a canned reply. */
function defaultDraft(message: ContactMessage): string {
  const firstName = message.name.trim().split(/\s+/)[0] || message.name;

  return `Hi ${firstName},

Thanks for reaching out — thanks for the details about "${message.subject || "your message"}".

`;
}
