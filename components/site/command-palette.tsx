"use client";

import {
  ArrowRight,
  BookOpen,
  Bot,
  Briefcase,
  CloudRain,
  Command,
  Copy,
  CornerDownLeft,
  Cpu,
  Dna,
  FolderKanban,
  GraduationCap,
  Grid,
  Home,
  Layers,
  Mail,
  Palette,
  Rocket,
  Search,
  Send,
  Star,
  User,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ACCENTS } from "@/components/site/accent-context";
import { useAiChat } from "@/components/site/ai-chat-context";
import type { BackgroundMode } from "@/components/site/site-background";
import type { NavigationItem, SiteSettings } from "@/lib/types";

const ICON_BY_KEY: Record<string, LucideIcon> = {
  hero:         Home,
  about:        User,
  stats:        Cpu,
  services:     Layers,
  skills:       Wrench,
  projects:     FolderKanban,
  showcase:     Rocket,
  journey:      Briefcase,
  education:    GraduationCap,
  testimonials: Star,
  blog:         BookOpen,
  contact:      Mail,
};

function keyFor(href: string) {
  return href.replace(/^#/, "").split("/")[0] || "hero";
}

type Action = {
  id: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  run: () => void;
  group: string;
};

interface CommandPaletteProps {
  open: boolean;
  close: () => void;
  navigation: NavigationItem[];
  settings: SiteSettings | null;
  setAccentId: (id: string) => void;
  bgMode?: BackgroundMode;
  setBgMode?: (mode: BackgroundMode) => void;
  rain?: boolean;
  setRain?: (b: boolean) => void;
  notify: (s: string) => void;
}

export function CommandPalette({
  open,
  close,
  navigation,
  settings,
  setAccentId,
  bgMode = "dna",
  setBgMode,
  notify,
}: CommandPaletteProps) {
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { openChat } = useAiChat();

  const email = settings?.contact?.email ?? "";

  const scrollTo = (href: string) => {
    const id = href.replace(/^#/, "");
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    else document.getElementById("stage")?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const actions: Action[] = useMemo(
    () => [
      ...navigation.map((n): Action => ({
        id: n._id,
        label: `Go to ${n.label}`,
        hint: n.href,
        icon: ICON_BY_KEY[keyFor(n.href)] ?? Home,
        group: "Navigate",
        run: () => scrollTo(n.href),
      })),
      {
        id: "ai-assistant",
        label: "Ask Nihal's Agentic AI Assistant",
        hint: "Live AI telemetry & Q&A",
        icon: Bot,
        group: "Assistant",
        run: () => openChat(),
      },
      ...ACCENTS.map((a): Action => ({
        id: a.id,
        label: `Theme: ${a.name}`,
        hint: "Change accent color",
        icon: Palette,
        group: "Appearance",
        run: () => setAccentId(a.id),
      })),
      {
        id: "bg-dna",
        label: "Background: DNA Neural Mesh (Default)",
        hint: bgMode === "dna" ? "Currently active" : "Flowing 3D particle double-helix",
        icon: Dna,
        group: "Appearance",
        run: () => setBgMode?.("dna"),
      },
      {
        id: "bg-rain",
        label: "Background: Matrix Code Rain",
        hint: bgMode === "rain" ? "Currently active" : "Classic falling green/accent matrix",
        icon: CloudRain,
        group: "Appearance",
        run: () => setBgMode?.("rain"),
      },
      {
        id: "bg-grid",
        label: "Background: Minimal Cyber Grid",
        hint: bgMode === "none" ? "Currently active" : "Clean dark space grid",
        icon: Grid,
        group: "Appearance",
        run: () => setBgMode?.("none"),
      },
      {
        id: "copy-email",
        label: "Copy email address",
        hint: email || "not configured",
        icon: Copy,
        group: "Actions",
        run: () => {
          if (!email) return notify("No email configured");
          navigator.clipboard?.writeText(email);
          notify(`Copied ${email}`);
        },
      },
      {
        id: "hire-me",
        label: "Contact & Hire",
        hint: "Jump to contact form",
        icon: Send,
        group: "Actions",
        run: () => scrollTo("#contact"),
      },
    ],
    [navigation, email, bgMode, setBgMode, setAccentId, notify, openChat]
  );

  const list = useMemo(() => {
    if (!q.trim()) return actions;
    const term = q.toLowerCase();
    return actions.filter(
      (a) =>
        a.label.toLowerCase().includes(term) ||
        a.hint.toLowerCase().includes(term) ||
        a.group.toLowerCase().includes(term)
    );
  }, [actions, q]);

  // Reset index when search query changes
  useEffect(() => {
    setIdx(0);
  }, [q]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQ("");
      setIdx(0);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [open]);

  // Keyboard navigation within palette
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIdx((i) => (i + 1) % Math.max(1, list.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIdx((i) => (i - 1 + list.length) % Math.max(1, list.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = list[idx];
      if (target) {
        target.run();
        close();
      }
    } else if (e.key === "Escape") {
      close();
    }
  };

  const exec = (a: Action) => {
    a.run();
    close();
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onClick={close}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
        className="hud !rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl rise border border-acc/40"
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10">
          <Search size={16} className="text-acc" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") close();
            }}
            placeholder="Type a command or search…"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-slate-500"
          />
          <span className="font-mono text-[10px] text-slate-500 border border-white/10 rounded px-1.5 py-0.5">
            ESC
          </span>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {list.length === 0 && (
            <div className="p-6 text-center text-sm text-slate-500">
              No results for &ldquo;{q}&rdquo;
            </div>
          )}
          {list.map((a, i) => {
            const Icon = a.icon;
            const showGroup = i === 0 || list[i - 1].group !== a.group;
            return (
              <div key={a.id}>
                {showGroup && (
                  <div className="px-3 pt-2 pb-1 font-mono text-[10px] uppercase tracking-widest text-slate-500">
                    {a.group}
                  </div>
                )}
                <button
                  onMouseEnter={() => setIdx(i)}
                  onClick={() => exec(a)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left cursor-pointer ${
                    i === idx ? "bg-acc/10 text-white" : "text-slate-300"
                  }`}
                >
                  <Icon size={16} className={i === idx ? "text-acc" : "text-slate-500"} />
                  <span className="text-sm">{a.label}</span>
                  <span className="text-xs text-slate-500 truncate">{a.hint}</span>
                  {i === idx && (
                    <CornerDownLeft size={13} className="ml-auto text-acc shrink-0" />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer hints */}
        <div className="flex gap-4 px-4 py-2 border-t border-white/10 font-mono text-[10px] text-slate-500">
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span className="ml-auto flex items-center gap-1">
            press 1–{navigation.length} anywhere to jump <ArrowRight size={10} />
          </span>
        </div>
      </div>
    </div>
  );
}
