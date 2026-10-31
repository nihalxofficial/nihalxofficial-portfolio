import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { PlusMarks, WindowBar } from "@/components/ui/panel-chrome";
import { NotFoundConsole } from "@/components/site/not-found-console";
import { getPortfolio } from "@/lib/api";

/**
 * Site-wide 404.
 *
 * Destination chips are read from the CMS navigation so the page always points
 * at sections the owner actually publishes; the console (client) prints the
 * route the visitor typed. Both light and dark themes share the same windowed
 * chrome as the rest of the site.
 */

/** Only used when the API is unreachable, so the page is never a dead end. */
const FALLBACK_LINKS: Destination[] = [
  { label: "Home", href: "/", icon: "Home" },
  { label: "Work", href: "/#projects", icon: "FolderCode" },
  { label: "About", href: "/#about", icon: "User" },
  { label: "Contact", href: "/#contact", icon: "Mail" },
];

interface Destination {
  label: string;
  href: string;
  icon?: string;
}

export default async function NotFound() {
  const data = await getPortfolio();
  const navigation = (data?.navigation ?? []).filter((item) => item.isVisible);
  const links: Destination[] =
    navigation.length > 0
      ? navigation.slice(0, 6).map(({ label, href, icon }) => ({ label, href, icon }))
      : FALLBACK_LINKS;

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-6 py-20">
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-backdrop radial-fade opacity-60" />
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/4 h-[440px] w-[680px] -translate-x-1/2 glow-soft opacity-70" />
      <div aria-hidden className="pointer-events-none absolute inset-0 noise" />

      <div className="relative z-10 grid w-full max-w-5xl gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <section>
          <p className="eyebrow inline-flex items-center gap-2">
            <Icon name="Terminal" className="h-3.5 w-3.5" />
            error · 404
          </p>

          <div className="relative mt-3 h-[6.5rem] select-none sm:h-[8.5rem]">
            <span
              aria-hidden
              className="absolute left-0 top-0 text-[6.5rem] font-bold leading-none text-gradient opacity-25 blur-[3px] translate-x-2 translate-y-2 sm:text-[8.5rem]"
            >
              404
            </span>
            <span className="relative text-[6.5rem] font-bold leading-none text-gradient sm:text-[8.5rem]">
              404
            </span>
          </div>

          <h1 className="mt-1 text-2xl font-semibold text-ink sm:text-3xl">
            This route is not part of the build
          </h1>

          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
            The page was either renamed, unpublished from the dashboard, or never shipped. Nothing
            broke — pick a destination below and carry on.
          </p>

          <p className="script mt-4 text-lg text-accent/90">even good routes need a map</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg grad-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition-transform hover:-translate-y-0.5"
            >
              <Icon name="Home" className="h-4 w-4" />
              Back home
            </Link>

            <Link
              href="/#contact"
              className="inline-flex items-center gap-2 rounded-lg border border-line-strong px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
            >
              Say hello
              <Icon name="ArrowUpRight" className="h-4 w-4" />
            </Link>
          </div>

          <nav aria-label="Site sections" className="mt-8 flex flex-wrap gap-1.5">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="chip transition-colors hover:border-accent/60 hover:text-accent">
                <Icon name={link.icon} className="mr-1.5 h-3 w-3" />
                {link.label}
              </Link>
            ))}
          </nav>
        </section>

        <div className="code-window relative overflow-hidden">
          <PlusMarks className="z-10" />
          <WindowBar title="route · tracer" />
          <div className="scanline p-5">
            <NotFoundConsole />
          </div>
        </div>
      </div>
    </main>
  );
}
