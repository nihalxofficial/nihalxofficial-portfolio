"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { API_URL } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "What does Nihal work with?",
  "Tell me about RentEase",
  "Is he open to internships?",
  "How do I contact him?",
];

const GREETING: Message = {
  role: "assistant",
  content:
    "Hey — I'm Nihal's assistant. Ask me about his stack, projects, availability or how to reach him.",
};

/**
 * Visitor-facing AI assistant.
 *
 * Talks to `POST /api/v1/ai/chat`, which streams Server-Sent Events so the
 * answer appears as it is written instead of after a long spinner.
 */
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");
  /** False while the visitor is reading older messages — stops the pull to bottom. */
  const [atBottom, setAtBottom] = useState(true);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  /** Partial reply while the stream is still arriving. */
  const answerRef = useRef("");

  // Scrolling is a DOM write, not state, so a reply streaming in never yanks the
  // view down when the reader has scrolled up.
  useEffect(() => {
    const node = scrollRef.current;
    if (!node || !atBottom) return;
    node.scrollTop = node.scrollHeight;
  }, [messages, streaming, open, atBottom]);

  function trackScroll() {
    const node = scrollRef.current;
    if (!node) return;
    const distance = node.scrollHeight - node.scrollTop - node.clientHeight;
    setAtBottom(distance < 56);
  }

  function jumpToLatest() {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
    setAtBottom(true);
  }

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  async function send(text: string) {
    const question = text.trim();
    if (!question || streaming) return;

    const history: Message[] = [...messages.filter((m) => m.content !== GREETING.content), { role: "user", content: question }];
    setMessages([...messages, { role: "user", content: question }, { role: "assistant", content: "" }]);
    setInput("");
    setError("");
    setStreaming(true);

    // A new question always scrolls the reader back down, even if they were
    // browsing older messages.
    requestAnimationFrame(() => {
      const node = scrollRef.current;
      if (node) node.scrollTop = node.scrollHeight;
      setAtBottom(true);
    });

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch(`${API_URL}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
        body: JSON.stringify({ messages: history.slice(-20) }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        const body = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(body?.message ?? "The assistant is unavailable right now.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      answerRef.current = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const frames = buffer.split("\n\n");
        buffer = frames.pop() ?? "";

        for (const frame of frames) {
          const data = frame
            .split("\n")
            .filter((line) => line.startsWith("data:"))
            .map((line) => line.slice(5).trim())
            .join("");

          if (!data) continue;

          let event: { type?: string; text?: string; message?: string };
          try {
            event = JSON.parse(data) as typeof event;
          } catch {
            continue;
          }

          if (event.type === "delta" && event.text) {
            // The ref holds the partial answer; React state only sees snapshots.
            answerRef.current += event.text;
            const answer = answerRef.current;
            setMessages((current) => {
              const next = [...current];
              next[next.length - 1] = { role: "assistant", content: answer };
              return next;
            });
          }

          if (event.type === "error") {
            setError(event.message ?? "The assistant is unavailable right now.");
          }
        }
      }

      if (!answerRef.current.trim()) {
        setError((previous) => previous || "No answer came back — please try again.");
      }
    } catch (cause) {
      if ((cause as Error).name !== "AbortError") {
        setError(cause instanceof Error ? cause.message : "Something went wrong.");
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
      // Drop an empty trailing bubble so no blank assistant row is left behind.
      setMessages((current) =>
        current.filter((m, index) => !(index === current.length - 1 && m.role === "assistant" && !m.content)),
      );
    }
  }

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close assistant" : "Ask about Nihal"}
        aria-expanded={open}
        className={cn(
          "dock-raised fixed right-5 z-[70] grid h-12 w-12 place-items-center rounded-full grad-accent text-accent-ink shadow-[0_12px_36px_-10px_var(--accent-glow)] transition-transform hover:-translate-y-0.5 active:scale-95",
          open && "rotate-90",
        )}
      >
        <Icon name={open ? "X" : "MessageSquare"} className="h-5 w-5" />
      </button>

      {/* Panel */}
      <div
        className={cn(
          "fixed right-4 bottom-[calc(var(--dock-h)+env(safe-area-inset-bottom)+4.5rem)] z-[70] w-[min(23rem,calc(100vw-2rem))] origin-bottom-right overflow-hidden rounded-2xl border border-line bg-page/95 shadow-[var(--shadow-float)] backdrop-blur-xl transition-all duration-200 lg:bottom-20",
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-3 scale-95 opacity-0",
        )}
        role="dialog"
        aria-label="Portfolio assistant"
        aria-hidden={!open}
      >
        <div className="flex items-center gap-2.5 border-b border-line px-4 py-3">
          <span className="relative grid h-8 w-8 place-items-center rounded-lg grad-accent text-accent-ink">
            <Icon name="Sparkles" className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-ink">Portfolio assistant</p>
            <p className="mono flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-faint">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              {streaming ? "writing…" : "online"}
            </p>
          </div>
        </div>

        <div className="relative">
          <div
            ref={scrollRef}
            onScroll={trackScroll}
            className="thin-scroll h-[min(24rem,52vh)] min-h-[12rem] space-y-2.5 overflow-y-auto overscroll-contain px-3.5 py-3.5"
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <p
                  className={cn(
                    "max-w-[85%] whitespace-pre-wrap break-words rounded-xl px-3 py-2 text-[12.5px] leading-relaxed",
                    message.role === "user"
                      ? "bg-accent/15 text-ink"
                      : "border border-line bg-surface/70 text-muted",
                  )}
                >
                  {message.content || (streaming ? "…" : "")}
                </p>
              </div>
            ))}
          </div>

          {atBottom || messages.length <= 1 ? null : (
            <button
              type="button"
              onClick={jumpToLatest}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-accent/45 bg-surface/90 px-3 py-1 text-[11px] text-accent shadow-[0_10px_26px_-14px_var(--accent-glow)] backdrop-blur transition-transform hover:-translate-y-0.5"
            >
              Jump to latest ↓
            </button>
          )}
        </div>

        {error ? (
          <p className="mx-3.5 mb-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-[11.5px] text-danger">
            {error}
          </p>
        ) : null}

        {messages.length <= 1 ? (
          <div className="flex flex-wrap gap-1.5 px-3.5 pb-2">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => void send(suggestion)}
                className="rounded-full border border-line px-2.5 py-1 text-[11px] text-muted transition-colors hover:border-line-strong hover:text-accent"
              >
                {suggestion}
              </button>
            ))}
          </div>
        ) : null}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void send(input);
          }}
          className="flex items-center gap-2 border-t border-line p-2.5"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about my work…"
            aria-label="Message"
            className="h-9 min-w-0 flex-1 rounded-lg border border-line bg-surface/60 px-3 text-[12.5px] text-ink outline-none placeholder:text-faint focus:border-accent/60"
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            aria-label="Send"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg grad-accent text-accent-ink transition-opacity disabled:opacity-40"
          >
            <Icon
              name={streaming ? "Loader" : "Send"}
              className={cn("h-4 w-4", streaming && "animate-spin")}
            />
          </button>
        </form>
      </div>
    </>
  );
}
