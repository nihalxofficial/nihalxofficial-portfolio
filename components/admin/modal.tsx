"use client";

import { useEffect, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { WindowBar } from "@/components/ui/panel-chrome";
import { cn } from "@/lib/utils";

/**
 * Dashboard modal shell.
 *
 * Same windowed chrome as the public site (traffic lights, mono label) so the
 * control centre and the portfolio read as one product. Escape and the backdrop
 * both close it; the body scrolls independently on small screens.
 */
export function Modal({
  title,
  onClose,
  children,
  footer,
  width = "max-w-2xl",
  label,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
  /** Small mono text in the window bar, e.g. the record id. */
  label?: string;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-page/70 px-4 py-8 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className={cn("panel w-full overflow-hidden shadow-2xl", width)}
      >
        <WindowBar title={label}>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-7 w-7 place-items-center rounded-md border border-line text-faint transition-colors hover:border-danger/40 hover:text-danger"
          >
            <Icon name="X" className="h-3.5 w-3.5" />
          </button>
        </WindowBar>

        <div className="px-5 py-4">
          <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
          <div className="mt-3">{children}</div>
        </div>

        {footer ? (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-surface-2/40 px-5 py-3">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
