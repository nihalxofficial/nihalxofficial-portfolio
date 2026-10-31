import type { ReactNode } from "react";
import { BackToTop } from "@/components/ui/back-to-top";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { getPortfolio } from "@/lib/api";

/**
 * Chrome shared by the sub-pages (project and post detail).
 * Re-uses the cached portfolio read so navigation and settings stay in sync
 * with the homepage without a second request.
 */
export async function SiteShell({ children }: { children: ReactNode }) {
  const data = await getPortfolio();
  const navigation = (data?.navigation ?? []).filter((item) => item.isVisible);

  return (
    <>
      <Navbar
        navigation={navigation}
        siteName={data?.settings?.siteName ?? "Md. Nihal Uddin Bijoy"}
        branding={data?.settings?.branding}
      />

      <main className="pb-20 pt-24 sm:pt-28">{children}</main>

      <Footer
        settings={data?.settings ?? null}
        navigation={navigation}
        year={new Date().getFullYear()}
      />

      <BackToTop />
    </>
  );
}
