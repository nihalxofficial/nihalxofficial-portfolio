import { cn } from "@/lib/utils";

/**
 * Section intro in the reference style:
 *   [ 01. ABOUT ME ]
 *   A little about me
 */
export function SectionHeading({
  index,
  label,
  title,
  description,
  align = "left",
  className,
}: {
  index?: number;
  label: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  const number = typeof index === "number" ? String(index).padStart(2, "0") : null;

  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <p className="eyebrow flex items-center gap-2">
        {align === "left" ? null : <span className="h-px w-8 bg-accent/60" aria-hidden />}
        <span className="text-faint" aria-hidden>
          [
        </span>
        {number ? <span className="text-faint">{number}.</span> : null}
        <span>{label}</span>
        <span className="text-faint" aria-hidden>
          ]
        </span>
      </p>

      <h2 className="mt-4 text-balance text-[1.75rem] font-semibold leading-tight text-ink sm:text-4xl">
        {title}
      </h2>

      {description ? (
        <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">{description}</p>
      ) : null}
    </div>
  );
}
