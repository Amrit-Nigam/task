/** Placeholder that matches the card's exact geometry, so nothing shifts. */
export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-card border-[3px] border-[var(--pd-black)] bg-surface shadow-card">
      <div className="skeleton h-[3px] w-full" />
      <div className="flex items-start justify-between px-5 pt-5">
        <div className="skeleton h-3 w-12 rounded" />
        <div className="skeleton h-8 w-8 rounded-full" />
      </div>
      <div className="grid h-40 place-items-center">
        <div className="skeleton h-28 w-28 rounded-full" />
      </div>
      <div className="px-5 pb-5">
        <div className="skeleton h-5 w-28 rounded" />
        <div className="mt-3 flex gap-1.5">
          <div className="skeleton h-5 w-16 rounded-full" />
          <div className="skeleton h-5 w-14 rounded-full" />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-edge pt-3">
          <div className="skeleton h-3 w-12 rounded" />
          <div className="skeleton h-3 w-12 rounded" />
          <div className="skeleton h-3 w-12 rounded" />
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
