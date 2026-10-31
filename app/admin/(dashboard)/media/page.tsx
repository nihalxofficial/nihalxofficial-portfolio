"use client";

import { Button, Input, Label, TextField } from "@heroui/react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Icon } from "@/components/ui/icon";
import {
  AdminApiError,
  deleteMedia,
  listMedia,
  uploadMedia,
  uploadMediaFromUrl,
  type MediaAsset,
} from "@/lib/admin";
import { bytesToSize, formatDate } from "@/lib/utils";

/**
 * Media library.
 *
 * Files are converted to a data uri in the browser and forwarded to the API,
 * which stores them on ImgBB and keeps the returned URLs in MongoDB. The
 * dashboard never talks to ImgBB directly, so the key stays server side.
 */

const MAX_BYTES = 8 * 1024 * 1024;

export default function AdminMediaPage() {
  const [items, setItems] = useState<MediaAsset[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [fromUrl, setFromUrl] = useState("");
  const [savingUrl, setSavingUrl] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const fileInput = useRef<HTMLInputElement | null>(null);

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

    listMedia(page, search)
      .then((result) => {
        if (cancelled) return;
        setItems(result.items);
        setTotal(result.meta.total);
        setPages(result.meta.totalPages);
        setError("");
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setError(cause instanceof AdminApiError ? cause.message : "Could not load the media library.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, search, nonce]);

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Only images can be uploaded (jpeg, png, webp, gif or avif).");
      return;
    }

    if (file.size > MAX_BYTES) {
      setError(`That file is ${bytesToSize(file.size)} — the limit is 8 MB.`);
      return;
    }

    setUploading(true);
    setError("");

    try {
      const image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Could not read the file"));
        reader.readAsDataURL(file);
      });

      const asset = await uploadMedia({
        image,
        name: file.name,
        mimeType: file.type as "image/jpeg" | "image/png" | "image/webp" | "image/gif" | "image/avif",
        folder: "portfolio",
      });

      setItems((previous) => [asset, ...previous]);
      setTotal((value) => value + 1);
    } catch (cause) {
      setError(cause instanceof AdminApiError ? cause.message : "Upload failed. Try another file.");
    } finally {
      setUploading(false);
    }
  }

  async function handleUrl() {
    const value = fromUrl.trim();
    if (!/^https?:\/\//i.test(value)) {
      setError("Paste a full image URL that starts with http:// or https://");
      return;
    }

    setSavingUrl(true);
    setError("");

    try {
      const asset = await uploadMediaFromUrl(value);
      setItems((previous) => [asset, ...previous]);
      setTotal((count) => count + 1);
      setFromUrl("");
    } catch (cause) {
      setError(cause instanceof AdminApiError ? cause.message : "Could not import that URL.");
    } finally {
      setSavingUrl(false);
    }
  }

  async function copy(asset: MediaAsset) {
    try {
      await navigator.clipboard.writeText(asset.url);
      setCopiedId(asset._id);
      setTimeout(() => setCopiedId((value) => (value === asset._id ? null : value)), 1800);
    } catch {
      setError("The browser blocked clipboard access — open the image and copy its address.");
    }
  }

  async function remove(id: string) {
    setSavingUrl(true);

    try {
      await deleteMedia(id);
      setConfirmId(null);
      setItems((previous) => previous.filter((item) => item._id !== id));
      setTotal((value) => Math.max(0, value - 1));
    } catch (cause) {
      setError(cause instanceof AdminApiError ? cause.message : "Could not delete this asset.");
    } finally {
      setSavingUrl(false);
    }
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.22em] text-accent">Assets</p>
          <h1 className="mt-1.5 text-2xl font-semibold text-ink">Media</h1>
          <p className="mt-1 text-[12.5px] text-muted">
            {total} image{total === 1 ? "" : "s"} hosted on ImgBB · paste any URL into a project
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
        <p className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-[12px] leading-relaxed text-danger">
          <Icon name="X" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="panel p-4">
          <h2 className="text-[13.5px] font-semibold text-ink">Upload an image</h2>
          <p className="mt-1 text-[11.5px] text-muted">
            Jpeg, png, webp, gif or avif · up to 8 MB. It is uploaded as soon as you pick a file.
          </p>

          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInput.current?.click()}
            className="mt-3 flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-line-strong bg-surface-2/40 px-4 py-7 text-center transition-colors hover:border-accent/50 hover:bg-accent/5 disabled:opacity-60"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-accent/10 text-accent">
              <Icon name={uploading ? "Loader" : "Upload"} className={`h-5 w-5 ${uploading ? "animate-spin" : ""}`} />
            </span>
            <span className="text-[12.5px] font-medium text-ink">
              {uploading ? "Uploading to ImgBB…" : "Choose a file"}
            </span>
            <span className="mono text-[9.5px] uppercase tracking-[0.14em] text-faint">
              stored in the “portfolio” folder
            </span>
          </button>

          <input
            ref={fileInput}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
            onChange={handleFile}
            className="hidden"
          />
        </section>

        <section className="panel p-4">
          <h2 className="text-[13.5px] font-semibold text-ink">Import from a URL</h2>
          <p className="mt-1 text-[11.5px] text-muted">
            Re-host an existing screenshot so the site never depends on someone else’s CDN.
          </p>

          <div className="mt-3 space-y-2">
            <TextField
              value={fromUrl}
              onChange={setFromUrl}
              className="flex flex-col gap-1.5"
            >
              <Label className="sr-only">Image URL</Label>
              <Input placeholder="https://…/screenshot.png" />
            </TextField>

            <Button
              type="button"
              isDisabled={savingUrl || !fromUrl.trim()}
              onPress={() => void handleUrl()}
              className="h-9 rounded-lg border border-line bg-transparent px-3.5 text-[12px] font-medium text-muted"
            >
              {savingUrl ? (
                <Icon name="Loader" className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Icon name="Download" className="h-3.5 w-3.5" />
              )}
              Import
            </Button>
          </div>
        </section>
      </div>

      <section className="panel overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
          <TextField
            value={query}
            onChange={setQuery}
            className="flex min-w-[190px] flex-1 items-center gap-2"
          >
            <Label className="sr-only">Search media</Label>
            <Input placeholder="Search by file name…" />
          </TextField>
          <span className="mono text-[10px] uppercase tracking-[0.14em] text-faint">
            {total} asset{total === 1 ? "" : "s"}
          </span>
        </div>

        {loading && items.length === 0 ? (
          <p className="flex items-center gap-2 px-4 py-10 text-[12px] text-faint">
            <Icon name="Loader" className="h-4 w-4 animate-spin" />
            Loading the library…
          </p>
        ) : items.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <Icon name="Image" className="mx-auto h-6 w-6 text-faint" />
            <p className="mt-2 text-[12.5px] text-muted">
              {search ? `Nothing matches “${search}”.` : "No images yet — upload the first one."}
            </p>
          </div>
        ) : (
          <ul className={`grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3 ${loading ? "opacity-60" : ""}`}>
            {items.map((asset) => (
              <li key={asset._id} className="overflow-hidden rounded-xl border border-line bg-surface-2/40">
                <a
                  href={asset.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block aspect-[16/10] overflow-hidden bg-page-2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset.thumbnailUrl || asset.displayUrl || asset.url}
                    alt={asset.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                  />
                </a>

                <div className="space-y-1.5 p-3">
                  <p className="truncate text-[12px] font-medium text-ink" title={asset.name}>
                    {asset.name}
                  </p>
                  <p className="mono text-[9.5px] uppercase tracking-[0.12em] text-faint">
                    {bytesToSize(asset.sizeBytes)}
                    {asset.width && asset.height ? ` · ${asset.width}×${asset.height}` : ""}
                    {asset.createdAt ? ` · ${formatDate(asset.createdAt)}` : ""}
                  </p>

                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => void copy(asset)}
                      className="mono inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-line px-2 py-1 text-[9px] uppercase tracking-[0.14em] text-faint transition-colors hover:border-line-strong hover:text-accent"
                    >
                      <Icon name={copiedId === asset._id ? "Check" : "Copy"} className="h-3 w-3" />
                      {copiedId === asset._id ? "copied" : "copy url"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmId(asset._id)}
                      className="grid h-7 w-7 place-items-center rounded-md border border-line text-faint transition-colors hover:border-danger/40 hover:text-danger"
                      aria-label={`Delete ${asset.name}`}
                    >
                      <Icon name="Trash" className="h-3 w-3" />
                    </button>
                  </div>

                  {confirmId === asset._id ? (
                    <div className="flex items-center gap-1.5 rounded-lg border border-danger/30 bg-danger/10 px-2 py-1.5">
                      <p className="flex-1 text-[10.5px] text-danger">Delete asset?</p>
                      <button
                        type="button"
                        disabled={savingUrl}
                        onClick={() => void remove(asset._id)}
                        className="rounded border border-danger/40 px-1.5 py-0.5 text-[10px] font-semibold text-danger disabled:opacity-50"
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmId(null)}
                        className="rounded border border-line px-1.5 py-0.5 text-[10px] text-muted"
                      >
                        No
                      </button>
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
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
