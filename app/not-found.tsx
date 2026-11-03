import Link from "next/link";
import { Home, ArrowUpRight, Terminal } from "lucide-react";
import { DynamicSiteBackground } from "@/components/site/dynamic-site-background";
import { NotFoundConsole } from "@/components/site/not-found-console";
import { getPortfolio } from "@/lib/api";

const FALLBACK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/#projects" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

export default async function NotFound() {
  const data = await getPortfolio();
  const navigation = (data?.navigation ?? []).filter((item) => item.isVisible);
  const links =
    navigation.length > 0
      ? navigation.slice(0, 6).map(({ label, href }) => ({ label, href }))
      : FALLBACK_LINKS;

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#03050f] px-6 py-20">
      {/* Dynamic Animated DNA Background */}
      <DynamicSiteBackground />
      {/* Grid background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
      {/* Glow orb */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/3 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-acc/8 blur-[80px]" />

      <div className="relative z-10 grid w-full max-w-5xl gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        {/* Left — copy */}
        <section>
          <p className="eyebrow inline-flex items-center gap-2">
            <Terminal size={13} />
            error · 404
          </p>

          <div className="relative mt-3 select-none">
            <span
              aria-hidden
              className="absolute left-0 top-0 text-[6.5rem] font-bold leading-none text-grad opacity-20 blur-[3px] translate-x-2 translate-y-2 sm:text-[8.5rem]"
            >
              404
            </span>
            <span className="relative text-[6.5rem] font-bold leading-none text-grad sm:text-[8.5rem]">
              404
            </span>
          </div>

          <h1 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">
            This route is not part of the build
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400">
            The page was either renamed, unpublished from the dashboard, or never shipped. Pick a
            destination below and carry on.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/" className="btn-primary inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm">
              <Home size={15} />
              Back home
            </Link>
            <Link
              href="/#contact"
              className="btn-ghost inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm"
            >
              Say hello
              <ArrowUpRight size={15} />
            </Link>
          </div>

          <nav aria-label="Site sections" className="mt-8 flex flex-wrap gap-1.5">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="chip hover:border-acc/60 hover:text-acc">
                {link.label}
              </Link>
            ))}
          </nav>
        </section>

        {/* Right — terminal console */}
        <div className="hud overflow-hidden">
          <div className="flex items-center gap-1.5 border-b border-white/5 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
            <span className="font-mono ml-2 text-[10px] text-slate-500">route · tracer</span>
          </div>
          <div className="p-5">
            <NotFoundConsole />
          </div>
        </div>
      </div>
    </main>
  );
}
