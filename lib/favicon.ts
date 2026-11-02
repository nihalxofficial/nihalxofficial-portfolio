/**
 * Generated favicon.
 *
 * When no favicon image is uploaded in Site settings, the browser tab shows a
 * small gradient tile carrying the brand mark (the same initials used by the
 * navbar and footer logo). This keeps a fresh install looking finished without
 * shipping a binary asset.
 */

/** Build a square SVG data URI from up to three initials. */
export function markFavicon(mark: string): string {
  const label = (mark.trim().slice(0, 3) || "•").toUpperCase();
  // Shrink the type so three characters still fit comfortably.
  const fontSize = label.length >= 3 ? 34 : label.length === 2 ? 44 : 54;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#0891b2"/><stop offset="1" stop-color="#0ea5e9"/>
</linearGradient></defs>
<rect width="100" height="100" rx="22" fill="url(#g)"/>
<text x="50" y="50" text-anchor="middle" dominant-baseline="central"
fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-weight="700"
font-size="${fontSize}" letter-spacing="1">${label}</text>
</svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg.replace(/\s+/g, " ").trim())}`;
}
