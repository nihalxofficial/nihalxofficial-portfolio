"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/** Syntax classes map onto the `.tk-*` utilities, which follow the theme. */
export type TokenKind = "key" | "prop" | "str" | "num" | "type" | "com" | "punc";

export interface Token {
  text: string;
  kind?: TokenKind;
}

export interface CodeFile {
  /** Tab label, e.g. `whoami.ts`. */
  name: string;
  /** Language shown in the status bar. */
  lang: string;
  lines: Token[][];
}

const TOKEN_CLASS: Record<TokenKind, string> = {
  key: "tk-key",
  prop: "tk-prop",
  str: "tk-str",
  num: "tk-num",
  type: "tk-type",
  com: "tk-com",
  punc: "tk-punc",
};

/**
 * The About panel: a tabbed, line-numbered code editor whose contents are
 * compiled from the About document, so the "source" stays editable from the
 * dashboard.
 */
export function AboutEditor({ files }: { files: CodeFile[] }) {
  const [active, setActive] = useState(0);
  const file = files[Math.min(active, files.length - 1)];

  if (!file) return null;

  return (
    <div className="code-window relative overflow-hidden">
      {/* Title bar */}
      <div className="flex items-center gap-1.5 border-b border-line bg-surface-2/60 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="mono ml-3 truncate text-[10px] uppercase tracking-[0.16em] text-faint">
          ~/about
        </span>
        <span className="mono ml-auto hidden text-[10px] text-faint sm:block">
          {file.lines.length} lines
        </span>
      </div>

      {/* Tab strip */}
      <div
        role="tablist"
        aria-label="About source files"
        className="flex items-stretch gap-1 overflow-x-auto border-b border-line bg-[color-mix(in_oklab,var(--surface-secondary)_60%,transparent)] px-2 scrollbar-none"
      >
        {files.map((candidate, position) => {
          const selected = position === Math.min(active, files.length - 1);
          return (
            <button
              key={candidate.name}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(position)}
              className={cn(
                "mono relative flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-[11px] transition-colors",
                selected ? "text-ink" : "text-faint hover:text-muted",
              )}
            >
              {selected ? (
                <motion.span
                  layoutId="about-tab-rail"
                  className="absolute inset-x-2 top-0 h-[2px] rounded-full grad-accent"
                  transition={{ duration: 0.25 }}
                />
              ) : null}
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  selected ? "bg-accent" : "bg-line-strong",
                )}
              />
              {candidate.name}
            </button>
          );
        })}
      </div>

      {/* Source */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={file.name}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="thin-scroll max-h-[26rem] overflow-auto"
          data-lenis-prevent
        >
          <div className="mono min-w-max py-3 text-[12px] leading-[1.85]">
            {file.lines.map((line, position) => (
              <div
                key={`${file.name}-${position}`}
                className="group flex items-start px-2 hover:bg-accent/[0.05]"
              >
                <span className="w-9 shrink-0 select-none pr-3 text-right text-[11px] text-faint/70 tabular-nums">
                  {position + 1}
                </span>
                <span className="whitespace-pre text-muted">
                  {line.length === 0 ? " " : null}
                  {line.map((token, index) => (
                    <span key={index} className={token.kind ? TOKEN_CLASS[token.kind] : undefined}>
                      {token.text}
                    </span>
                  ))}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Status bar */}
      <div className="mono flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line bg-surface-2/60 px-4 py-2 text-[10px] text-faint">
        <span className="text-accent">{file.lang}</span>
        <span>UTF-8</span>
        <span className="tabular-nums">Ln {file.lines.length}, Col 1</span>
        <span className="ml-auto inline-flex items-center gap-1.5">
          <Icon name="GitBranch" className="h-3 w-3" />
          synced from dashboard
        </span>
      </div>
    </div>
  );
}
