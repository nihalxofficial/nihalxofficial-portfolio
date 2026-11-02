"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, MessageSquare, Send, Sparkles, X, Loader2, ArrowDown } from "lucide-react";
import { API_URL } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "What is Nihal's core tech stack?",
  "Tell me about RentEase & Mentora",
  "Is he available for contract / remote hire?",
  "How do I initialize contact with him?",
];

const GREETING: Message = {
  role: "assistant",
  content:
    "👋 Greetings! I'm Nihal's Agentic AI Assistant.\n\nI have live telemetry access to Nihal's full-stack architecture, production projects (RentEase, Mentora, SunCart, etc.), verified skills, and work availability.\n\nAsk me anything about his engineering capabilities or click any prompt below to get started!",
};

/**
 * Visitor-facing Agentic AI assistant with real-time SSE streaming.
 * Styled in dark OS terminal / cyber HUD theme.
 */
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [showCallout, setShowCallout] = useState(true);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");
  const [atBottom, setAtBottom] = useState(true);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const answerRef = useRef("");

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
    if (open) {
      setShowCallout(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  async function send(text: string) {
    const question = text.trim();
    if (!question || streaming) return;

    const history: Message[] = [
      ...messages.filter((m) => m.content !== GREETING.content),
      { role: "user", content: question },
    ];
    setMessages([
      ...messages,
      { role: "user", content: question },
      { role: "assistant", content: "" },
    ]);
    setInput("");
    setError("");
    setStreaming(true);

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
        throw new Error(body?.message ?? "The assistant is currently unavailable.");
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
            answerRef.current += event.text;
            const answer = answerRef.current;
            setMessages((current) => {
              const next = [...current];
              next[next.length - 1] = { role: "assistant", content: answer };
              return next;
            });
          }

          if (event.type === "error") {
            setError(event.message ?? "The assistant encountered a transient error.");
          }
        }
      }

      if (!answerRef.current.trim()) {
        setError((previous) => previous || "No response received. Please try again.");
      }
    } catch (cause) {
      if ((cause as Error).name !== "AbortError") {
        setError(cause instanceof Error ? cause.message : "Connection failed.");
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
      setMessages((current) =>
        current.filter((m, index) => !(index === current.length - 1 && m.role === "assistant" && !m.content)),
      );
    }
  }

  return (
    <>
      {/* ── Attraction Callout Banner (shown when closed) ── */}
      {!open && showCallout && (
        <div
          onClick={() => setOpen(true)}
          className="fixed right-18 sm:right-22 bottom-[calc(68px+env(safe-area-inset-bottom))] sm:bottom-6 z-[69] hidden xs:flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl hud !border-acc/40 bg-[#03050f]/95 text-slate-100 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl glow-sm cursor-pointer hover:border-acc hover:glow transition-all duration-300 group animate-in fade-in slide-in-from-bottom-2"
        >
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
          </span>
          <span className="font-mono text-xs text-slate-200 group-hover:text-acc transition-colors font-medium whitespace-nowrap">
            Ask Nihal&apos;s AI Agent
          </span>
          <span className="font-mono text-[9.5px] uppercase tracking-wider text-acc bg-acc/10 px-1.5 py-0.5 rounded border border-acc/30">
            ⚡ Live
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowCallout(false);
            }}
            className="text-slate-500 hover:text-slate-300 ml-1 p-0.5 transition-colors cursor-pointer"
            aria-label="Dismiss greeting"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* ── Main Launcher Button ── */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close assistant" : "Ask Nihal's Agentic AI"}
        aria-expanded={open}
        className={cn(
          "fixed right-4 sm:right-6 bottom-[calc(68px+env(safe-area-inset-bottom))] sm:bottom-6 z-[70] grid h-12 w-12 place-items-center rounded-2xl hud !border-acc/40 bg-[#070c30] text-acc shadow-[0_0_24px_rgba(0,229,255,0.35)] backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:glow active:scale-95 cursor-pointer",
          open && "rotate-90 !border-red-400/40 text-red-400 shadow-[0_0_20px_rgba(248,113,113,0.3)]",
        )}
      >
        {open ? <X size={20} /> : <Bot size={22} className="text-acc" />}
      </button>

      {/* ── Chat Window Dialog ── */}
      <div
        className={cn(
          "fixed right-4 sm:right-6 bottom-[calc(68px+env(safe-area-inset-bottom)+3.8rem)] sm:bottom-20 z-[75] w-[min(25rem,calc(100vw-2rem))] origin-bottom-right overflow-hidden rounded-2xl hud !border-white/15 bg-[#03050f]/95 shadow-[0_20px_60px_rgba(0,0,0,0.85)] backdrop-blur-2xl transition-all duration-300",
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-4 scale-95 opacity-0",
        )}
        role="dialog"
        aria-label="Agentic AI assistant"
        aria-hidden={!open}
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-white/[0.02]">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Mac chrome buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
            </div>
            <div className="min-w-0 ml-1">
              <p className="font-mono text-xs font-semibold text-slate-200 flex items-center gap-1.5 truncate">
                <Sparkles size={13} className="text-acc shrink-0" />
                ai-agent.sh
              </p>
              <p className="font-mono flex items-center gap-1.5 text-[9.5px] uppercase tracking-widest text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {streaming ? "streaming telemetry…" : "agentic ai · ready"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-slate-500 hover:text-white p-1 rounded transition-colors cursor-pointer"
            aria-label="Close assistant"
          >
            <X size={15} />
          </button>
        </div>

        {/* Messages Body */}
        <div className="relative">
          <div
            ref={scrollRef}
            onScroll={trackScroll}
            data-lenis-prevent
            className="thin-scroll h-[min(23rem,50vh)] min-h-[12rem] space-y-3 overflow-y-auto overscroll-contain p-4"
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[88%] whitespace-pre-wrap break-words rounded-xl px-3.5 py-2.5 text-[12px] leading-relaxed font-mono",
                    message.role === "user"
                      ? "hud !border-acc/40 bg-acc/15 text-white glow-sm"
                      : "hud !border-white/10 bg-white/[0.03] text-slate-200",
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="font-mono text-[9px] uppercase tracking-widest text-acc mb-1.5 flex items-center gap-1">
                      <Bot size={11} />
                      AI Agent
                    </div>
                  )}
                  {message.content || (streaming ? <span className="text-acc animate-pulse">▍</span> : "")}
                </div>
              </div>
            ))}
          </div>

          {/* Jump to latest pill */}
          {!atBottom && messages.length > 1 && (
            <button
              type="button"
              onClick={jumpToLatest}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full hud !border-acc/40 bg-[#03050f]/90 px-3 py-1 font-mono text-[10.5px] text-acc shadow-lg backdrop-blur hover:glow-sm transition-transform hover:-translate-y-0.5 cursor-pointer"
            >
              <ArrowDown size={12} />
              Jump to latest
            </button>
          )}
        </div>

        {/* Error notice */}
        {error ? (
          <p className="mx-4 mb-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 font-mono text-[11px] text-red-400">
            {error}
          </p>
        ) : null}

        {/* Quick Suggestion Chips */}
        {messages.length <= 1 ? (
          <div className="flex flex-wrap gap-1.5 px-4 pb-2">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => void send(suggestion)}
                className="chip !text-[11px] !py-1 text-slate-300 hover:text-acc hover:border-acc/60 transition-colors cursor-pointer"
              >
                {suggestion}
              </button>
            ))}
          </div>
        ) : null}

        {/* Input Form */}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void send(input);
          }}
          className="flex items-center gap-2 border-t border-white/10 p-3 bg-white/[0.01]"
        >
          <span className="font-mono text-acc text-xs pl-1 font-bold">{">"}</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask AI agent about Nihal..."
            aria-label="Message prompt"
            className="h-9 min-w-0 flex-1 rounded-xl hud !border-white/10 bg-transparent px-3 font-mono text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-acc/60"
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            aria-label="Send message"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl btn-primary text-white transition-opacity disabled:opacity-40 cursor-pointer"
          >
            {streaming ? (
              <Loader2 size={15} className="animate-spin text-acc" />
            ) : (
              <Send size={15} />
            )}
          </button>
        </form>
      </div>
    </>
  );
}
