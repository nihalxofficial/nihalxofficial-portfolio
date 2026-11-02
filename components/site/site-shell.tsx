import type { ReactNode } from "react";
import { ChatWidget } from "@/components/site/chat-widget";
import { Footer } from "@/components/site/footer";
import { PortfolioShell } from "@/components/site/portfolio-shell";
import { ScrollToTop } from "@/components/site/scroll-to-top";
import { getPortfolio } from "@/lib/api";

const HIDDEN_NAV_KEYS = new Set([
  "stats",
  "services",
  "projects",
  "testimonials",
  "reviews",
  "review",
  "blog",
  "journey",
]);

const HIDDEN_NAV_HREFS = new Set([
  "#stats",
  "#services",
  "#projects",
  "#testimonials",
  "#reviews",
  "#blog",
  "/blog",
  "/projects",
  "#journey",
]);

function isNavVisible(href: string, label?: string) {
  const cleanHref = (href || "").toLowerCase().trim();
  const cleanLabel = (label || "").toLowerCase().trim();
  if (HIDDEN_NAV_HREFS.has(cleanHref)) return false;
  const cleanKey = cleanHref.replace(/^#/, "").split("/")[0];
  if (HIDDEN_NAV_KEYS.has(cleanKey)) return false;
  if (
    [
      "stats",
      "services",
      "projects",
      "featured projects",
      "reviews",
      "review",
      "testimonials",
      "blog",
      "journey",
      "experience",
    ].includes(cleanLabel)
  ) {
    return false;
  }
  return true;
}

/**
 * Chrome shared by the sub-pages (project and post detail).
 * Wraps content inside PortfolioShell so sub-pages get the same
 * OS shell: TopBar, Dock, StatusBar, CommandPalette, MobileNav.
 */
export async function SiteShell({ children }: { children: ReactNode }) {
  const data = await getPortfolio();
  const navigation = (data?.navigation ?? []).filter(
    (item) => item.isVisible && isNavVisible(item.href, item.label)
  );

  return (
    <PortfolioShell navigation={navigation} settings={data?.settings ?? null}>
      {children}
      <Footer
        settings={data?.settings ?? null}
        navigation={navigation}
        year={new Date().getFullYear()}
      />
      <ScrollToTop />
      <ChatWidget />
    </PortfolioShell>
  );
}
