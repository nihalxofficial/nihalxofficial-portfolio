import type { ReactNode } from "react";
import { Footer } from "@/components/site/footer";
import { PortfolioShell } from "@/components/site/portfolio-shell";
import { getPortfolio } from "@/lib/api";

/**
 * Chrome shared by the sub-pages (project and post detail).
 * Wraps content inside PortfolioShell so sub-pages get the same
 * OS shell: TopBar, Dock, StatusBar, CommandPalette, MobileNav.
 *
 * Navigation is owned entirely by the CMS: the public API already returns only
 * the visible links in order, so — exactly like the homepage — nothing here is
 * filtered by a hard-coded list. A link a visitor can reach is one whose anchor
 * section the shell actually renders.
 */
export async function SiteShell({ children }: { children: ReactNode }) {
  const data = await getPortfolio();
  const navigation = data?.navigation ?? [];

  return (
    <PortfolioShell navigation={navigation} settings={data?.settings ?? null}>
      {children}
      <Footer
        settings={data?.settings ?? null}
        navigation={navigation}
        year={new Date().getFullYear()}
      />
    </PortfolioShell>
  );
}
