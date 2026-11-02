"use client";

import {
  ArrowRight,
  BookOpen,
  Briefcase,
  CloudRain,
  Command,
  Copy,
  CornerDownLeft,
  FolderKanban,
  GraduationCap,
  Home,
  Layers,
  Mail,
  Palette,
  Rocket,
  Search,
  Send,
  User,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ACCENTS } from "@/components/site/accent-context";
import type { NavigationItem, SiteSettings } from "@/lib/types";

const ICON_BY_KEY: Record<string, LucideIcon> = {
  hero:         Home,
  about:        User,
  stats:        Wrench,
  services:     Layers,
  skills:       Wrench,
  projects:     FolderKanban,
  showcase:     Rocket,
  journey:      Briefcase,
  education:    GraduationCap,
  testimonials: Layers,
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
  rain: boolean;
  setRain: (b: boolean) => void;
  notify: (s: string) => void;
}

export function CommandPalette({
  open,
  close,
  navigation,
  settings,
  setAccentId,
  rain,
  setRain,
  notify,
}: CommandPaletteProps) {
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

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
      ...ACCENTS.map((a): Action => ({
        id: a.id,
        label: `Theme: ${a.name}`,
        hint: "Change accent color",
        icon: Palette,
        group: "Appearance",
        run: () => setAccentId(a.id),
      })),
      {
        id: "rain",
        label: `${rain ? "Disable" : "Enable"} code rain`,
        hint: "Toggle matrix background",
        icon: CloudRain,
        group: "Appearance",
        run: () => setRain(!rain),
      },
      {
        id: "copy-email",
        label: "Copy email address",
        hint: email || "not configured",
        icon: Copy,
        group: "Actions",
        run: () => {
          if (email) {
            navigator.clipboard?.writeText(email);
            notify("Email copied to clipboard ✓");
          }
        },
      },
      {
        id: "hire",
        label: "Let's talk",
        hint: "Scroll to contact section",
        icon: Send,
        group: "Actions",
        run: () => scrollTo("#contact"),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigation, setAccentId, rain, setRain, notify, email]
  );

  const list = actions.filter((a) =>
    (a.label + a.hint + a.group).toLowerCase().includes(q.toLowerCase())
  );

  useEffect(() => {
    if (open) {
      setQ("");
      setIdx(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => setIdx(0), [q]);

  if (!open) return null;

  const exec = (a?: Action) => {
    if (!a) return;
    a.run();
    close();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4 bg-black/60 backdrop-blur-sm fade"
      onMouseDown={close}
    >
      <div
        className="hud pop w-full max-w-xl !bg-[#050a24] overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <Search size={16} className="text-acc" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setIdx((i) => Math.min(list.length - 1, i + 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setIdx((i) => Math.max(0, i - 1));
              }
              if (e.key === "Enter") exec(list[idx]);
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
