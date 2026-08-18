/**
 * Placeholder that matches the card's exact geometry, so nothing shifts.
 *
 * Every measurement below is the card's own — including its two densities, so
 * the swap is invisible on a phone as well as on a desktop.
 */
export function CardSkeleton() {
  return (
    <div className="relative isolate overflow-hidden rounded-card border-[3px] border-[var(--pd-black)] bg-surface shadow-card">
      {/* Stands in for the card's type rule — absolute, so it adds no height. */}
      <span
        aria-hidden
        className="skeleton absolute inset-x-0 top-0 h-[6px] border-b-[3px] border-[var(--pd-black)]"
      />

      {/* The card's control row: pt-3/pt-5 above a 32px pair of icon buttons. */}
      <div className="flex items-start justify-between px-3 pt-3 sm:px-5 sm:pt-5">
        <div className="skeleton h-3 w-10 rounded sm:w-12" />
        <div className="flex items-center gap-1">
          <div className="skeleton h-8 w-8 rounded-full" />
          <div className="skeleton h-8 w-8 rounded-full" />
        </div>
      </div>

      <div className="grid h-28 place-items-center sm:h-40">
        <div className="skeleton h-20 w-20 rounded-full sm:h-28 sm:w-28" />
      </div>

      <div className="px-3 pb-3 sm:px-5 sm:pb-5">
        {/* 20px / 25px are the rendered heights of the card's text-base and
            text-xl name at leading-tight. */}
        <div className="skeleton h-[20px] w-24 rounded sm:h-[25px] sm:w-28" />
        <div className="mt-2 flex gap-1 sm:mt-2.5 sm:gap-1.5">
          <div className="skeleton h-[20px] w-14 rounded-full sm:h-[22px] sm:w-16" />
          <div className="skeleton h-[20px] w-12 rounded-full sm:h-[22px] sm:w-14" />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1 border-t-2 border-[var(--pd-black)] pt-2.5 sm:mt-4 sm:gap-2 sm:pt-3">
          {/* The stat cell stacks label over value below `sm`, so it is 30px
              there against the single 20px line it becomes from `sm` up. */}
          <div className="skeleton h-[30px] w-10 rounded sm:h-5 sm:w-12" />
          <div className="skeleton h-[30px] w-10 rounded sm:h-5 sm:w-12" />
          <div className="skeleton h-[30px] w-10 rounded sm:h-5 sm:w-12" />
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
