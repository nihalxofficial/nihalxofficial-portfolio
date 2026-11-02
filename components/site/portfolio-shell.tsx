"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { AccentProvider, ACCENTS, useAccent } from "@/components/site/accent-context";
import { AiChatProvider } from "@/components/site/ai-chat-context";
import { BootScreen } from "@/components/site/boot-screen";
import { CommandPalette } from "@/components/site/command-palette";
import { Dock } from "@/components/site/dock";
import { MobileNav } from "@/components/site/mobile-nav";
import { BackgroundMode, SiteBackground } from "@/components/site/site-background";
import { StatusBar } from "@/components/site/status-bar";
import { TopBar } from "@/components/site/top-bar";
import { useActiveSection } from "@/hooks/useActiveSection";
import type { NavigationItem, SiteBranding, SiteSettings } from "@/lib/types";

interface PortfolioShellProps {
  children: ReactNode;
  navigation: NavigationItem[];
  settings: SiteSettings | null;
}

/** Inner shell — reads accent from context */
function ShellInner({ children, navigation, settings }: PortfolioShellProps) {
  const { accent, accentId, setAccentId } = useAccent();

  const [booted, setBooted] = useState(false);
  const [bgMode, setBgMode] = useState<BackgroundMode>("dna");
  const [palette, setPalette] = useState(false);
  const [toast, setToast] = useState("");

  // Hydrate background mode preference (default: "dna")
  useEffect(() => {
    const saved = localStorage.getItem("bg_mode") as BackgroundMode | null;
    if (saved && (saved === "dna" || saved === "rain" || saved === "none")) {
      setBgMode(saved);
    } else if (settings?.backgroundEffect) {
      setBgMode(settings.backgroundEffect as BackgroundMode);
    }
  }, [settings?.backgroundEffect]);

  const changeBgMode = useCallback((mode: BackgroundMode) => {
    setBgMode(mode);
    localStorage.setItem("bg_mode", mode);
    notify(
      `Background → ${
        mode === "dna"
          ? "DNA Mesh 🧬"
          : mode === "rain"
          ? "Matrix Rain 🌧️"
          : "Minimal Grid"
      }`
    );
  }, []);

  // Active section tracking via IntersectionObserver
  const hrefs = navigation.map((n) => n.href);
  const activeSection = useActiveSection(hrefs);

  // Hydrate booted state on client only (avoid SSR mismatch)
  useEffect(() => {
    setBooted(sessionStorage.getItem("booted") === "1");
  }, []);

  const finishBoot = useCallback(() => {
    sessionStorage.setItem("booted", "1");
    setBooted(true);
  }, []);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, []);

  const changeAccent = useCallback(
    (id: string) => {
      setAccentId(id);
      const found = ACCENTS.find((a) => a.id === id);
      if (found) notify(`Theme → ${found.name}`);
    },
    [setAccentId, notify]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Cmd/Ctrl+K or / → open palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((p) => !p);
        return;
      }
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey
      )
        return;
      if (e.key === "/") {
        e.preventDefault();
        setPalette(true);
        return;
      }
      // Number keys 1-9 jump to nav item
      const n = Number(e.key);
      if (n >= 1 && n <= navigation.length) {
        const href = navigation[n - 1]?.href;
        if (href) {
          const id = href.replace(/^#/, "");
          const el = document.getElementById(id);
          if (el) el.scrollIntoView({ behavior: "smooth" });
          else document.getElementById("stage")?.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigation]);

  const scrollToContact = useCallback(() => {
    const el = document.getElementById("contact");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className="h-dvh flex flex-col overflow-hidden text-slate-100">
      {/* Boot screen (once per session) */}
      {!booted && <BootScreen done={finishBoot} />}

      {/* Animated background */}
      <SiteBackground accent={accent.a} mode={bgMode} />

      {/* Top bar */}
      <TopBar
        navigation={navigation}
        siteName={settings?.siteName ?? "Md. Nihal Uddin Bijoy"}
        branding={settings?.branding}
        activeSection={activeSection}
        accentId={accentId}
        setAccentId={changeAccent}
        openPalette={() => setPalette(true)}
        onHireMeClick={scrollToContact}
        bgMode={bgMode}
        setBgMode={changeBgMode}
      />

      {/* Main content row */}
      <div className="relative z-10 flex flex-1 min-h-0">
        {/* Left dock */}
        <Dock navigation={navigation} settings={settings} activeSection={activeSection} />

        {/* Scrollable stage */}
        <main
          id="stage"
          className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden px-4 sm:px-8 py-6 pb-24 md:pb-8"
        >
          <div className="view-in max-w-[1500px] mx-auto">{children}</div>
        </main>
      </div>

      {/* VS Code status bar */}
      <StatusBar
        navigation={navigation}
        accentName={accent.name}
        activeSection={activeSection}
      />

      {/* Mobile bottom nav */}
      <MobileNav navigation={navigation} activeSection={activeSection} />

      {/* Command palette */}
      <CommandPalette
        open={palette}
        close={() => setPalette(false)}
        navigation={navigation}
        settings={settings}
        setAccentId={changeAccent}
        bgMode={bgMode}
        setBgMode={changeBgMode}
        notify={notify}
      />

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-20 md:bottom-12 left-1/2 -translate-x-1/2 z-[150] pop hud !rounded-full px-5 py-2.5 font-mono text-xs text-acc glow">
          {toast}
        </div>
      )}
    </div>
  );
}

/**
 * Top-level portfolio shell — provides AccentContext then renders ShellInner.
 * Used in both the home page and sub-pages (project/blog detail routes).
 */
export function PortfolioShell({ children, navigation, settings }: PortfolioShellProps) {
  return (
    <AccentProvider>
      <AiChatProvider>
        <ShellInner navigation={navigation} settings={settings}>
          {children}
        </ShellInner>
      </AiChatProvider>
    </AccentProvider>
  );
}
