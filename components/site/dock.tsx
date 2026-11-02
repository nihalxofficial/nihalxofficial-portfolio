"use client";

import {
  BookOpen,
  Bot,
  Briefcase,
  FolderKanban,
  GraduationCap,
  Home,
  Layers,
  Mail,
  Rocket,
  User,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { NavigationItem, SiteSettings } from "@/lib/types";

/** Maps section/href key → Lucide icon */
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

interface DockProps {
  navigation: NavigationItem[];
  settings: SiteSettings | null;
  activeSection?: string;
}

/**
 * Left-side navigation dock (hidden below md).
 * Exactly matches the reference Dock component visual design.
 */
export function Dock({ navigation, settings, activeSection = "" }: DockProps) {
  const email = settings?.contact?.email ?? "";
  const githubLink = settings?.socialLinks?.find(
    (s) => s.platform?.toLowerCase() === "github"
  )?.url ?? "#";
  const linkedinLink = settings?.socialLinks?.find(
    (s) => s.platform?.toLowerCase() === "linkedin"
  )?.url ?? "#";

  return (
    <aside className="hidden md:flex w-[92px] shrink-0 flex-col items-center py-4 pl-3 relative z-10">
      <div className="hud !rounded-2xl w-full flex-1 min-h-0 flex flex-col items-center py-3 px-2 overflow-y-auto no-scrollbar">
        {/* Nav items */}
        <div className="flex flex-col gap-1.5 w-full">
          {navigation.map((item, i) => {
            const key = keyFor(item.href);
            const Icon: LucideIcon = ICON_BY_KEY[key] ?? Home;
            const isActive = activeSection === item.href || activeSection === `#${key}`;

            return (
              <a
                key={item._id}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  const id = item.href.replace(/^#/, "");
                  const el = document.getElementById(id);
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                  } else {
                    const stage = document.getElementById("stage");
                    if (id === "hero" || id === "") stage?.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                title={`${item.label} — press ${i + 1}`}
                className={`relative group flex flex-col items-center gap-1 py-2.5 rounded-xl text-[11px] font-medium cursor-pointer transition ${
                  isActive
                    ? "text-acc bg-acc/10 ring-acc glow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {/* Active left indicator */}
                {isActive && (
                  <span className="absolute -left-2 top-3 bottom-3 w-[3px] rounded-full bg-acc shadow-[0_0_10px_var(--acc)]" />
                )}
                {/* Number shortcut */}
                <span className="absolute top-1 right-1.5 font-mono text-[9px] text-slate-600 group-hover:text-acc">
                  {i + 1}
                </span>
                <Icon size={21} />
                {item.label}
              </a>
            );
          })}
        </div>

        {/* Bottom: avatar + status + socials */}
        <div className="mt-auto pt-3 flex flex-col items-center gap-2 w-full">
          {/* Bot avatar */}
          <div className="floaty w-12 h-12 rounded-full grid place-items-center bg-gradient-to-b from-acc/30 to-acc2/30 ring-acc glow">
            <Bot size={24} className="text-acc" />
          </div>

          {/* Availability status */}
          <div className="w-full rounded-lg ring-acc bg-acc/5 py-1.5 text-center">
            <div className="text-[11px] font-semibold text-acc flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </div>
            <div className="text-[9px] text-slate-400">Open to hire</div>
          </div>

          {/* Social links */}
          <div className="flex gap-2 text-slate-300">
            {githubLink !== "#" && (
              <a
                href={githubLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="hover:text-acc transition-colors"
              >
                {/* GitHub SVG icon */}
                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
            )}
            {linkedinLink !== "#" && (
              <a
                href={linkedinLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="hover:text-acc transition-colors"
              >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
