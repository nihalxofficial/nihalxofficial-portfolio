import Link from "next/link";
import { Icon } from "@/components/ui/icon";

export default function NotFound() {
  return (
    <main className="relative grid min-h-screen place-items-center px-6">
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-backdrop radial-fade opacity-60" />
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/3 h-[420px] w-[620px] -translate-x-1/2 glow-soft opacity-70" />

      <div className="relative z-10 max-w-lg text-center">
        <p className="mono text-[11px] uppercase tracking-[0.24em] text-accent">Error 404</p>

        <p className="mt-4 text-[6rem] font-semibold leading-none text-gradient sm:text-[8rem]">
          404
        </p>

        <h1 className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">Page not found</h1>

        <p className="mt-3 text-sm leading-relaxed text-muted">
          This route does not exist. It was either renamed, unpublished in the dashboard, or never
          there in the first place.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg grad-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition-transform hover:-translate-y-0.5"
          >
            <Icon name="ArrowLeft" className="h-4 w-4" />
            Back home
          </Link>

          <Link
            href="/#projects"
            className="inline-flex items-center gap-2 rounded-lg border border-line-strong px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
          >
            Browse projects
            <Icon name="ArrowRight" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
