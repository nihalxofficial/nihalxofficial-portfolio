import {
  LoadingStatus,
  Skeleton,
  SkeletonChips,
  SkeletonFrame,
  SkeletonText,
  SkeletonWindow,
} from "@/components/ui/skeleton";

/** Placeholder for `/projects/[slug]`, shaped like the real detail page. */
export default function ProjectLoading() {
  return (
    <SkeletonFrame>
      <article className="container-page">
        <Skeleton className="h-3 w-32 rounded-md" />

        <header className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <Skeleton className="h-3 w-36 rounded-md" />
            <Skeleton className="mt-4 h-9 w-3/4 rounded-lg" />
            <SkeletonText lines={3} className="mt-5 max-w-xl" />
            <SkeletonChips count={5} className="mt-6 max-w-md" />
            <div className="mt-7 flex flex-wrap gap-3">
              <Skeleton className="h-11 w-36 rounded-lg grad-accent opacity-40" />
              <Skeleton className="h-11 w-40 rounded-lg" />
            </div>
          </div>

          <SkeletonWindow title="preview · loading" bodyClassName="p-0">
            <Skeleton className="aspect-[16/10] w-full rounded-none" />
          </SkeletonWindow>
        </header>

        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="space-y-2 bg-surface/80 px-4 py-4">
              <Skeleton className="h-2.5 w-16 rounded-sm" />
              <Skeleton className="h-3.5 w-28" />
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-8">
            {Array.from({ length: 2 }, (_, index) => (
              <section key={index}>
                <Skeleton className="h-5 w-36 rounded-md" />
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {Array.from({ length: 4 }, (_, item) => (
                    <Skeleton key={item} className="h-10 w-full rounded-xl" />
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="space-y-4">
            <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
            <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
          </div>
        </div>

        <div className="mt-14">
          <LoadingStatus label="loading related builds" />
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="panel space-y-3 p-4">
                <Skeleton className="aspect-[16/10] w-full rounded-xl" />
                <Skeleton className="h-3.5 w-2/3" />
                <SkeletonText lines={2} />
              </div>
            ))}
          </div>
        </div>
      </article>
    </SkeletonFrame>
  );
}
