import {
  LoadingStatus,
  Skeleton,
  SkeletonChips,
  SkeletonText,
  SkeletonWindow,
} from "@/components/ui/skeleton";

/**
 * Homepage placeholder shown while the portfolio read resolves.
 * Mirrors the real order — hero, stats strip, project cards — so the page
 * never jumps when the content streams in.
 */
export default function HomeLoading() {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-line/70 bg-page/70 backdrop-blur-md">
        <div className="container-page flex h-16 items-center gap-4">
          <Skeleton className="h-8 w-36 rounded-lg" />
          <SkeletonChips count={5} className="mx-auto hidden lg:flex" />
          <Skeleton className="ml-auto h-8 w-8 rounded-full lg:ml-0" />
          <Skeleton className="hidden h-9 w-24 rounded-lg sm:block" />
        </div>
      </header>

      <main className="container-page pb-20 pt-28 sm:pt-32">
        <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <Skeleton className="h-4 w-44 rounded-md" />

            <div className="mt-5 space-y-3">
              <Skeleton className="h-11 w-4/5 rounded-xl" />
              <Skeleton className="h-11 w-3/5 rounded-xl" />
              <Skeleton className="h-11 w-2/5 rounded-xl grad-accent opacity-40" />
            </div>

            <SkeletonText lines={3} className="mt-6 max-w-lg" />

            <div className="mt-8 flex flex-wrap gap-3">
              <Skeleton className="h-11 w-40 rounded-lg grad-accent opacity-40" />
              <Skeleton className="h-11 w-36 rounded-lg" />
            </div>

            <SkeletonChips count={4} className="mt-8 max-w-xs" />
          </div>

          <SkeletonWindow title="whoami · live session" bodyClassName="space-y-3">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <div className="h-6" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-3/4" />
          </SkeletonWindow>
        </section>

        <LoadingStatus label="streaming content from the api" />

        <section className="mt-14">
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-3 w-28 rounded-md" />
              <Skeleton className="h-8 w-64 rounded-lg" />
            </div>
            <Skeleton className="h-4 w-24 rounded-md" />
          </div>

          <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="space-y-2 bg-surface/70 px-5 py-6">
                <Skeleton className="h-7 w-20 rounded-lg" />
                <Skeleton className="h-3 w-28" />
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <Skeleton className="h-3 w-24 rounded-md" />
          <Skeleton className="mt-3 h-8 w-72 rounded-lg" />

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <SkeletonWindow
                key={index}
                title={`project ${index + 1}`}
                bodyClassName="space-y-3"
                className={index === 1 ? "lg:-translate-y-2" : undefined}
              >
                <Skeleton className="aspect-[16/10] w-full rounded-xl" />
                <Skeleton className="h-4 w-2/3" />
                <SkeletonText lines={2} />
                <SkeletonChips count={3} />
              </SkeletonWindow>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
