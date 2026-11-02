"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Passive visitor beacon.
 *
 * Mounted once in the root layout but it ignores the dashboard, so only public
 * traffic is measured. It sends a `view` when a page opens, a `leave` carrying
 * the time spent when the visitor navigates away or closes the tab, and a
 * `beat` every 30s while the tab is visible so "online now" stays accurate.
 *
 * Beacons go through `fetch(..., { keepalive })` rather than sendBeacon: the
 * API parses JSON bodies, and keepalive survives unload just as well. Geo and
 * device are derived server-side from request headers, so nothing identifying is
 * sent from here beyond an anonymous session/visitor id.
 */

const API = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1").replace(/\/$/, "");
const HEARTBEAT_MS = 30_000;

type Payload = {
  kind: "view" | "leave" | "beat";
  sessionId: string;
  visitorId: string;
  path: string;
  referrer?: string;
  durationMs?: number;
};

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

/** Reuses a per-tab session id and a persistent visitor id, tolerating storage blocks. */
function ensure(key: string, store: "session" | "local"): string {
  try {
    const area = store === "session" ? window.sessionStorage : window.localStorage;
    let value = area.getItem(key);
    if (!value) {
      value = newId();
      area.setItem(key, value);
    }
    return value;
  } catch {
    return newId();
  }
}

function send(payload: Payload) {
  try {
    void fetch(`${API}/analytics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    /* a dropped beacon must never break the page */
  }
}

export function Analytics() {
  const pathname = usePathname();
  const current = useRef<{ path: string; enter: number } | null>(null);

  // Open a page view; close out the previous one with its duration.
  useEffect(() => {
    if (!pathname || pathname.startsWith("/control-centre")) return;
    const sessionId = ensure("pf_sid", "session");
    const visitorId = ensure("pf_vid", "local");

    const prev = current.current;
    if (prev) {
      send({ kind: "leave", sessionId, visitorId, path: prev.path, durationMs: Date.now() - prev.enter });
    }

    send({
      kind: "view",
      sessionId,
      visitorId,
      path: pathname,
      referrer: prev ? prev.path : document.referrer || undefined,
    });
    current.current = { path: pathname, enter: Date.now() };
  }, [pathname]);

  // Heartbeats for live presence + a final duration when the tab hides/closes.
  useEffect(() => {
    if (pathname.startsWith("/control-centre")) return;
    const sessionId = ensure("pf_sid", "session");
    const visitorId = ensure("pf_vid", "local");

    const beat = () => {
      const active = current.current;
      if (active && document.visibilityState === "visible") {
        send({ kind: "beat", sessionId, visitorId, path: active.path });
      }
    };
    const close = () => {
      const active = current.current;
      if (document.visibilityState === "hidden" && active) {
        send({ kind: "leave", sessionId, visitorId, path: active.path, durationMs: Date.now() - active.enter });
        current.current = null;
      }
    };

    const interval = window.setInterval(beat, HEARTBEAT_MS);
    document.addEventListener("visibilitychange", close);
    window.addEventListener("pagehide", close);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", close);
      window.removeEventListener("pagehide", close);
    };
  }, [pathname]);

  return null;
}
