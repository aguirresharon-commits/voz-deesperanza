export default function ServiceCardSkeleton() {
  return (
    <div
      className="flex animate-pulse flex-col overflow-hidden rounded-3xl border border-neutral-200/60 bg-white shadow-sm"
      aria-hidden
    >
      <div className="h-48 w-full bg-neutral-200/80" />
      <div className="flex flex-1 flex-col gap-3 border-t border-[#2F4F6F]/10 px-8 pb-8 pt-7">
        <div className="h-5 w-20 rounded-full bg-neutral-200/80" />
        <div className="h-7 w-3/4 rounded-lg bg-neutral-200/80" />
        <div className="mt-2 space-y-2">
          <div className="h-3 w-full rounded bg-neutral-200/70" />
          <div className="h-3 w-full rounded bg-neutral-200/70" />
          <div className="h-3 w-2/3 rounded bg-neutral-200/70" />
        </div>
        <div className="mt-4 h-4 w-2/3 rounded bg-neutral-200/60" />
        <div className="mt-6 h-12 w-full rounded-2xl bg-neutral-200/80" />
      </div>
    </div>
  )
}
