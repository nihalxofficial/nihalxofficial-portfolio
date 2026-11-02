import type { ReactNode } from "react";
import { Footer } from "@/components/site/footer";
import { PortfolioShell } from "@/components/site/portfolio-shell";
import { getPortfolio } from "@/lib/api";

/**
 * Chrome shared by the sub-pages (project and post detail).
 * Wraps content inside PortfolioShell so sub-pages get the same
 * OS shell: TopBar, Dock, StatusBar, CommandPalette, MobileNav.
 */
export async function SiteShell({ children }: { children: ReactNode }) {
  const data = await getPortfolio();
  const navigation = (data?.navigation ?? []).filter((item) => item.isVisible);

  return (
    <PortfolioShell navigation={navigation} settings={data?.settings ?? null}>
      <main className="py-8">
        {children}
      </main>
      <Footer
        settings={data?.settings ?? null}
        navigation={navigation}
        year={new Date().getFullYear()}
      />
    </PortfolioShell>
  );
}
