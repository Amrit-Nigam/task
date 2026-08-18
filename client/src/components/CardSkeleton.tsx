/** Placeholder that matches the card's exact geometry, so nothing shifts. */
export function CardSkeleton() {
  return (
    <div className="relative isolate overflow-hidden rounded-card border-[3px] border-[var(--pd-black)] bg-surface shadow-card">
      {/* Stands in for the card's type rule — absolute, so it adds no height. */}
      <span
        aria-hidden
        className="skeleton absolute inset-x-0 top-0 h-[6px] border-b-[3px] border-[var(--pd-black)]"
      />

      {/* pt-5 + a 32px control row, as on the card. */}
      <div className="flex items-start justify-between px-5 pt-5">
        <div className="skeleton h-3 w-12 rounded" />
        <div className="flex items-center gap-1">
          <div className="skeleton h-8 w-8 rounded-full" />
          <div className="skeleton h-8 w-8 rounded-full" />
        </div>
      </div>

      <div className="grid h-40 place-items-center">
        <div className="skeleton h-28 w-28 rounded-full" />
      </div>

      <div className="px-5 pb-5">
        {/* 25px is the rendered height of the card's text-xl/leading-tight name. */}
        <div className="skeleton h-[25px] w-28 rounded" />
        <div className="mt-2.5 flex gap-1.5">
          <div className="skeleton h-[22px] w-16 rounded-full" />
          <div className="skeleton h-[22px] w-14 rounded-full" />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 border-t-2 border-[var(--pd-black)] pt-3">
          <div className="skeleton h-5 w-12 rounded" />
          <div className="skeleton h-5 w-12 rounded" />
          <div className="skeleton h-5 w-12 rounded" />
        </div>
      </div>
    </div>
  );
}

export function CardSkeletonGrid({ count = 12 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <CardSkeleton key={index} />
      ))}
    </>
  );
}
