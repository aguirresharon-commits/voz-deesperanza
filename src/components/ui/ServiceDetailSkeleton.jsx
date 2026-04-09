export default function ServiceDetailSkeleton() {
  return (
    <main
      className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16 lg:px-8 lg:py-20"
      aria-busy="true"
      aria-label="Cargando servicio"
    >
      <div className="h-5 w-28 animate-pulse rounded-lg bg-neutral-200/80" />
      <div className="mt-8 overflow-hidden rounded-2xl border border-neutral-200/60 bg-white shadow-sm">
        <div className="aspect-[2/1] w-full animate-pulse bg-neutral-200/80 sm:aspect-[21/9]" />
        <div className="space-y-6 p-7 md:p-10">
          <div className="h-8 w-2/3 animate-pulse rounded-lg bg-neutral-200/80" />
          <div className="h-5 w-1/3 animate-pulse rounded-lg bg-neutral-200/70" />
          <div className="space-y-3 pt-4">
            <div className="h-3 w-full animate-pulse rounded bg-neutral-200/70" />
            <div className="h-3 w-full animate-pulse rounded bg-neutral-200/70" />
            <div className="h-3 w-4/5 animate-pulse rounded bg-neutral-200/70" />
          </div>
          <div className="h-14 w-full animate-pulse rounded-2xl bg-neutral-200/80" />
        </div>
      </div>
    </main>
  )
}
