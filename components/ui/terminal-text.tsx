import type { TermToken } from "@/lib/terminal";
import { cn } from "@/lib/utils";

/**
 * Renders already-tokenised terminal text. Tokens carrying a `.tk-*` class get
 * the theme's syntax colour; the rest inherit `className`.
 */
export function TerminalText({
  tokens,
  className,
}: {
  tokens: TermToken[];
  className?: string;
}) {
  return (
    <>
      {tokens.map((token, index) => (
        <span key={index} className={cn(token.cls, !token.cls && className)}>
          {token.text}
        </span>
      ))}
    </>
  );
}
