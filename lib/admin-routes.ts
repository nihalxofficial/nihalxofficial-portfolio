/**
 * Private dashboard base path.
 *
 * Deliberately not `/admin`: a conventional path is trivial to discover, while
 * this segment only exists in the owner's bookmark and the deployment notes.
 * Changing it means renaming `app/control-centre` and this constant together.
 */
export const ADMIN_BASE = "/control-centre";

/** Builds a dashboard URL, e.g. adminHref("messages") → /control-centre/messages */
export function adminHref(path = ""): string {
  if (!path) return ADMIN_BASE;
  return `${ADMIN_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}
