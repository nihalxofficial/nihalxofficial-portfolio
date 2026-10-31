/**
 * Font catalogue for the public site.
 *
 * The dashboard stores a key per role (`sans`, `display`, `mono`) in
 * `settings.typography`; the root layout resolves those keys into CSS custom
 * properties and a single Google Fonts request that only contains the selected
 * families, so changing the typeface never needs a rebuild.
 */

export type FontRole = "sans" | "display" | "mono";

export interface FontOption {
  /** Value persisted in the database. */
  key: string;
  /** Label in the dashboard picker. */
  label: string;
  /** Google Fonts `family=` parameter, weights included. */
  query: string;
  /** CSS font-family value applied to the site. */
  stack: string;
  /** One-line character note shown next to the preview. */
  note: string;
}

/** Faces used for body copy and headings. */
export const SANS_FONTS: FontOption[] = [
  {
    key: "outfit",
    label: "Outfit",
    query: "Outfit:wght@300..800",
    stack: '"Outfit", ui-sans-serif, system-ui, sans-serif',
    note: "Geometric, tech-forward — the default look",
  },
  {
    key: "space-grotesk",
    label: "Space Grotesk",
    query: "Space+Grotesk:wght@400..700",
    stack: '"Space Grotesk", ui-sans-serif, system-ui, sans-serif',
    note: "Engineering feel, tight apertures",
  },
  {
    key: "sora",
    label: "Sora",
    query: "Sora:wght@300..800",
    stack: '"Sora", ui-sans-serif, system-ui, sans-serif',
    note: "Futuristic, wide and confident",
  },
  {
    key: "plus-jakarta",
    label: "Plus Jakarta Sans",
    query: "Plus+Jakarta+Sans:wght@300..800",
    stack: '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
    note: "Modern product UI",
  },
  {
    key: "poppins",
    label: "Poppins",
    query: "Poppins:wght@300..700",
    stack: '"Poppins", ui-sans-serif, system-ui, sans-serif',
    note: "Round geometric, very legible",
  },
  {
    key: "inter",
    label: "Inter",
    query: "Inter:wght@300..800",
    stack: '"Inter", ui-sans-serif, system-ui, -apple-system, sans-serif',
    note: "Neutral workhorse",
  },
  {
    key: "roboto",
    label: "Roboto",
    query: "Roboto:wght@300;400;500;700",
    stack: '"Roboto", ui-sans-serif, system-ui, sans-serif',
    note: "Industrial, familiar",
  },
  {
    key: "josefin",
    label: "Josefin Sans",
    query: "Josefin+Sans:wght@300..700",
    stack: '"Josefin Sans", ui-sans-serif, system-ui, sans-serif',
    note: "Tall, elegant, geometric",
  },
  {
    key: "exo2",
    label: "Exo 2",
    query: "Exo+2:wght@300..800",
    stack: '"Exo 2", ui-sans-serif, system-ui, sans-serif',
    note: "Sci-fi squarish shapes",
  },
];

/** Faces used for the monospace terminal / code cards. */
export const MONO_FONTS: FontOption[] = [
  {
    key: "jetbrains-mono",
    label: "JetBrains Mono",
    query: "JetBrains+Mono:wght@400;500;700",
    stack: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
    note: "Editor native, great ligatures",
  },
  {
    key: "ibm-plex-mono",
    label: "IBM Plex Mono",
    query: "IBM+Plex+Mono:wght@400;500;600",
    stack: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
    note: "Typewriter character",
  },
  {
    key: "fira-code",
    label: "Fira Code",
    query: "Fira+Code:wght@400;500;600",
    stack: '"Fira Code", ui-monospace, SFMono-Regular, Menlo, monospace',
    note: "Coding ligatures",
  },
  {
    key: "space-mono",
    label: "Space Mono",
    query: "Space+Mono:wght@400;700",
    stack: '"Space Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
    note: "Retro terminal",
  },
  {
    key: "share-tech",
    label: "Share Tech Mono",
    query: "Share+Tech+Mono",
    stack: '"Share Tech Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
    note: "HUD / sci-fi readout",
  },
];

/** Always loaded — the handwritten accents in the reference design. */
const SCRIPT_QUERY = "Caveat:wght@500;600;700";
export const SCRIPT_STACK = '"Caveat", "Segoe Script", cursive';

const BY_ROLE: Record<FontRole, FontOption[]> = {
  sans: SANS_FONTS,
  display: SANS_FONTS,
  mono: MONO_FONTS,
};

export const DEFAULT_TYPOGRAPHY: Record<FontRole, string> = {
  sans: "outfit",
  display: "space-grotesk",
  mono: "jetbrains-mono",
};

export function findFont(role: FontRole, key?: string | null): FontOption {
  const list = BY_ROLE[role];
  return list.find((font) => font.key === key) ?? list[0];
}

export interface ResolvedTypography {
  sans: string;
  display: string;
  mono: string;
  script: string;
  /** href for the single Google Fonts stylesheet that covers the choice. */
  href: string;
}

/**
 * Resolves the stored keys into CSS values plus one stylesheet URL.
 * Duplicate families are collapsed so a shared sans/display face loads once.
 */
export function resolveTypography(input?: Partial<Record<FontRole, string>> | null): ResolvedTypography {
  const sans = findFont("sans", input?.sans ?? DEFAULT_TYPOGRAPHY.sans);
  const display = findFont("display", input?.display ?? DEFAULT_TYPOGRAPHY.display);
  const mono = findFont("mono", input?.mono ?? DEFAULT_TYPOGRAPHY.mono);

  const queries = [...new Set([sans.query, display.query, mono.query, SCRIPT_QUERY])];

  return {
    sans: sans.stack,
    display: display.stack,
    mono: mono.stack,
    script: SCRIPT_STACK,
    href: `https://fonts.googleapis.com/css2?${queries
      .map((query) => `family=${query}`)
      .join("&")}&display=swap`,
  };
}

/** Options for the dashboard picker, grouped by role. */
export function fontOptions(role: FontRole): FontOption[] {
  return BY_ROLE[role];
}
