"use client";

/**
 * Homepage loading state — shown while portfolio data is fetched.
 * Minimal dark skeleton that matches the shell layout.
 */
export default function HomeLoading() {
  return (
    <div className="flex h-full flex-col gap-6 px-4 py-6 sm:px-8">
      {/* Hero skeleton */}
      <div className="hud p-8 flex gap-8 items-center">
        <div className="flex-1 space-y-4">
          <div className="skeleton h-3 w-32 rounded" />
          <div className="skeleton h-10 w-3/4 rounded-xl" />
          <div className="skeleton h-10 w-1/2 rounded-xl" />
          <div className="skeleton h-4 w-full max-w-md rounded" />
          <div className="skeleton h-4 w-4/5 max-w-sm rounded" />
          <div className="flex gap-3 mt-2">
            <div className="skeleton h-10 w-32 rounded-full" />
            <div className="skeleton h-10 w-28 rounded-full" />
          </div>
        </div>
        <div className="hidden lg:block skeleton h-56 w-56 rounded-2xl" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="hud p-4 space-y-2">
            <div className="skeleton h-7 w-20 rounded-lg" />
            <div className="skeleton h-3 w-28 rounded" />
          </div>
        ))}
      </div>

      {/* Project cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="hud overflow-hidden">
            <div className="skeleton aspect-[16/10] w-full" />
            <div className="p-4 space-y-2">
              <div className="skeleton h-4 w-2/3 rounded" />
              <div className="skeleton h-3 w-full rounded" />
              <div className="flex gap-1.5 mt-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="skeleton h-5 w-16 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
