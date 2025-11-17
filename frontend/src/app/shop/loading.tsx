export default function Loading() {
  // Minimal skeleton to avoid white screen during category/filter navigation
  return (
    <>
      <div className="shop-product breadcrumb1 lg:py-20 md:py-14 py-10">
        <div className="list-tab flex flex-wrap items-center justify-center gap-y-5 gap-8 lg:mt-[70px] mt-12 overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="tab-item text-button-uppercase has-line-before line-2px opacity-50 select-none"
            >
              <div className="h-5 w-28 bg-surface rounded animate-pulse" />
            </div>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-line p-4">
              <div className="w-full h-40 bg-surface animate-pulse rounded" />
              <div className="mt-4 h-5 w-3/4 bg-surface animate-pulse rounded" />
              <div className="mt-2 h-4 w-1/2 bg-surface animate-pulse rounded" />
              <div className="mt-2 h-4 w-1/3 bg-surface animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}