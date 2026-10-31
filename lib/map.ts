import type { SiteSettings } from "./types";

/**
 * Contact map helpers.
 *
 * The dashboard only stores what the owner typed: a place name, optional
 * coordinates, a zoom level and an optional paste-in embed link. The public
 * site turns that into an iframe URL here, so no map SDK or API key is needed.
 */

export type ContactMap = NonNullable<SiteSettings["contact"]>;

const DEFAULT_ZOOM = 13;
/** Only these hosts may be embedded, so a stored URL cannot point anywhere odd. */
const ALLOWED_HOSTS = [
  "google.com",
  "maps.google.com",
  "googlemaps.google.com",
  "openstreetmap.org",
  "www.openstreetmap.org",
  "bing.com",
  "maps.bing.com",
];

/** Coordinates are stored as text, so blank / non-numeric means "not set". */
function number(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Latitude/longitude pair when the owner pinned exact coordinates. */
export function coordinatesOf(map: ContactMap | undefined): { lat: number; lng: number } | null {
  if (!map) return null;
  const lat = number(map.mapLat);
  const lng = number(map.mapLng);
  if (lat === null || lng === null) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng };
}

function zoomOf(map: ContactMap | undefined): number {
  const zoom = number(map?.mapZoom);
  if (zoom === null) return DEFAULT_ZOOM;
  return Math.min(20, Math.max(1, Math.round(zoom)));
}

/** `Mirsarai, Chattogram` or `22.38,91.00` — whatever the map should centre on. */
function queryFor(map: ContactMap, coords: { lat: number; lng: number } | null): string {
  if (coords) return `${coords.lat.toFixed(6)},${coords.lng.toFixed(6)}`;
  return (map.location ?? "").trim();
}

/** Key-free Google Maps embed URL, or the owner's own embed link when allowed. */
export function mapEmbedUrl(map: ContactMap | undefined): string | null {
  if (!map) return null;

  const custom = (map.mapEmbedUrl ?? "").trim();
  if (custom) {
    try {
      const url = new URL(custom);
      const host = url.hostname.toLowerCase();
      const allowed = ALLOWED_HOSTS.some((entry) => host === entry || host.endsWith(`.${entry}`));
      if (allowed && url.protocol === "https:") return url.toString();
    } catch {
      // Fall through to the generated URL when the pasted value is not a URL.
    }
  }

  const coords = coordinatesOf(map);
  const query = queryFor(map, coords);
  if (!query) return null;

  return `https://maps.google.com/maps?q=${encodeURIComponent(
    query,
  )}&z=${zoomOf(map)}&output=embed`;
}

/** The link behind "Open in Google Maps". */
export function mapsLink(map: ContactMap | undefined): string | null {
  if (!map) return null;

  const coords = coordinatesOf(map);
  if (coords) {
    return `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;
  }

  const query = (map.location ?? "").trim();
  if (!query) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** "22.383300° N, 91.000000° E" — shown under the map for the technical feel. */
export function formatCoordinates(coords: { lat: number; lng: number } | null): string {
  if (!coords) return "";
  const latSuffix = coords.lat >= 0 ? "N" : "S";
  const lngSuffix = coords.lng >= 0 ? "E" : "W";
  return `${Math.abs(coords.lat).toFixed(4)}° ${latSuffix}, ${Math.abs(coords.lng).toFixed(4)}° ${lngSuffix}`;
}
