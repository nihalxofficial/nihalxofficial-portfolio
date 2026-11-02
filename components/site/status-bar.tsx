"use client";

import { CheckCircle2, GitCommitHorizontal } from "lucide-react";
import { useClock } from "@/hooks/useClock";
import { useActiveSection } from "@/hooks/useActiveSection";
import type { NavigationItem } from "@/lib/types";

const FILE_BY_KEY: Record<string, string> = {
  hero:         "index.tsx",
  about:        "about.md",
  stats:        "stats.json",
  services:     "services.ts",
  skills:       "skills.json",
  projects:     "projects/",
  showcase:     "showcase.tsx",
  journey:      "git.log",
  education:    "education.md",
  testimonials: "testimonials.tsx",
  blog:         "blog.mdx",
  contact:      "contact.sh",
};

interface StatusBarProps {
  navigation: NavigationItem[];
  accentName: string;
}

/**
 * VS Code-style status bar pinned to the bottom of the shell (desktop only).
 */
export function StatusBar({ navigation, accentName }: StatusBarProps) {
  const clock = useClock("Asia/Dhaka");
  const active = useActiveSection(navigation.map((n) => n.href));
  const key = active.replace(/^#/, "").split("/")[0] || "hero";
  const file = FILE_BY_KEY[key] ?? "index.tsx";

  return (
    <footer className="hidden md:flex relative z-30 h-7 shrink-0 items-center gap-5 px-4 border-t border-white/5 bg-[#02040c]/90 font-mono text-[11px] text-slate-400">
      <span className="flex items-center gap-1.5 text-acc">
        <GitCommitHorizontal size={13} /> main
      </span>
      <span className="flex items-center gap-1.5 text-emerald-400">
        <CheckCircle2 size={12} /> 0 errors · 0 warnings
      </span>
      <span>{file}</span>
      <span className="hidden lg:block text-slate-500">UTF-8 · TypeScript React</span>
      <span className="ml-auto hidden lg:block">
        theme: <span className="text-acc">{accentName}</span>
      </span>
      <span>Dhaka {clock}</span>
      <span className="flex items-center gap-1.5 text-acc">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Available for hire
      </span>
      <span className="text-slate-500">
        © {new Date().getFullYear()} · Built with{" "}
        <span className="text-red-500">♥</span>
      </span>
    </footer>
  );
}

