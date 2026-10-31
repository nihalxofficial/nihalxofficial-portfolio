import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Section intro in the reference style:
 *
 *   [ 01. About Me ]
 *   A little about me        ← trailing words carry the cyan gradient
 *   Optional description…
 */
export function SectionHeading({
  index,
  label,
  title,
  description,
  align = "left",
  accentWords = true,
  action,
  className,
}: {
  index?: number;
  label: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  /** Set to false when the reference keeps the whole title in white. */
  accentWords?: boolean;
  /** Rendered on the far side of the heading row, e.g. "View All Projects". */
  action?: ReactNode;
  className?: string;
}) {
  const number = typeof index === "number" ? String(index).padStart(2, "0") : null;
  const [plain, accent] = splitTitle(title, accentWords);

  const heading = (
    <h2
      className={cn(
        "text-balance text-[1.7rem] font-bold leading-[1.15] tracking-tight text-ink sm:text-[2rem]",
        align === "center" && "mx-auto",
      )}
    >
      {plain}
      {accent ? (
        <>
          {" "}
          <span className="text-gradient">{accent}</span>
        </>
      ) : null}
    </h2>
  );

  if (align === "center") {
    return (
      <div className={cn("mx-auto max-w-2xl text-center", className)}>
        <Eyebrow number={number} label={label} centered />
        <div className="mt-3">{heading}</div>
        {description ? (
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted">{description}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-x-8 gap-y-4", className)}>
      <div className="max-w-2xl">
        <Eyebrow number={number} label={label} />
        <div className="mt-3">{heading}</div>
        {description ? (
          <p className="mt-3 text-sm leading-relaxed text-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0 pb-1">{action}</div> : null}
    </div>
  );
}

function Eyebrow({
  number,
  label,
  centered,
}: {
  number: string | null;
  label: string;
  centered?: boolean;
}) {
  return (
    <p className={cn("eyebrow flex items-center gap-1.5", centered && "justify-center")}>
      <span className="text-faint/70" aria-hidden>
        [
      </span>
      {number ? <span>{number}.</span> : null}
      <span>{label}</span>
      <span className="text-faint/70" aria-hidden>
        ]
      </span>
    </p>
  );
}

/**
 * The reference titles are two-tone: the first words stay white and the closing
 * words carry the cyan gradient ("Featured Projects", "A little about me").
 * Longer titles accent the last two words, short ones only the final word.
 */
export function splitTitle(title: string, enabled = true): [string, string | null] {
  if (!enabled) return [title, null];

  const words = title.trim().split(/\s+/);
  if (words.length < 2) return [title, null];

  const accentCount = words.length >= 4 ? 2 : 1;
  const plain = words.slice(0, words.length - accentCount).join(" ");
  const accent = words.slice(words.length - accentCount).join(" ");
  return [plain, accent];
}
