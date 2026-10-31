import {
  LoadingStatus,
  Skeleton,
  SkeletonChips,
  SkeletonFrame,
  SkeletonText,
} from "@/components/ui/skeleton";

/** Placeholder for `/blog/[slug]`, shaped like the real article. */
export default function PostLoading() {
  return (
    <SkeletonFrame>
      <article className="container-page">
        <Skeleton className="h-3 w-28 rounded-md" />

        <header className="mt-6 max-w-3xl">
          <Skeleton className="h-3 w-56 rounded-md" />
          <Skeleton className="mt-4 h-9 w-5/6 rounded-lg" />
          <SkeletonText lines={2} className="mt-5 max-w-2xl" />
          <SkeletonChips count={4} className="mt-5 max-w-sm" />
        </header>

        <Skeleton className="mt-8 aspect-[16/9] w-full max-w-5xl rounded-2xl" />

        <div className="mt-10 max-w-3xl space-y-8">
          {Array.from({ length: 3 }, (_, section) => (
            <section key={section} className="space-y-3">
              <Skeleton className="h-5 w-48 rounded-md" />
              <SkeletonText lines={section === 1 ? 7 : 5} height="h-3.5" />
              {section === 2 ? (
                <div className="code-window mt-4 space-y-2 p-4">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-3 w-5/6" />
                </div>
              ) : null}
            </section>
          ))}
        </div>

        <section className="mt-16 max-w-3xl border-t border-line pt-10">
          <LoadingStatus label="fetching more writing" />
          <div className="mt-5 space-y-2.5">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4 rounded-xl border border-line bg-surface/40 px-4 py-3"
              >
                <Skeleton className="h-3.5 w-1/2" />
                <Skeleton className="h-3 w-20 rounded-md" />
              </div>
            ))}
          </div>
        </section>
      </article>
    </SkeletonFrame>
  );
}
