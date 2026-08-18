import { PokeBall } from "@/components/PokeBall";
import { BALLS, setBallIndex, useBallIndex } from "@/lib/ballThemes";
import { cn } from "@/lib/utils";

/**
 * The casing selector — four balls, each recolouring the whole device.
 *
 * Each swatch is the ball itself rather than a colour chip — and a real one,
 * with its own livery, so the control is read by recognition rather than by
 * hue. It doubles as a preview of what the casing becomes.
 */
export function BallSwitcher() {
  const active = useBallIndex();

  return (
    <div
      role="radiogroup"
      aria-label="Casing"
      className="flex items-center gap-1.5 rounded-full border-2 border-[var(--pd-black)] bg-black/20 p-1.5 coarse:gap-2"
    >
      {BALLS.map((ball, i) => (
        <button
          key={ball.key}
          role="radio"
          aria-checked={i === active}
          aria-label={ball.name}
          title={ball.name}
          onClick={() => setBallIndex(i)}
          className={cn(
            /* A 24px swatch under a mouse, 36px under a finger — including on
               a tablet, which is wide enough that a width breakpoint would
               have handed it the mouse size. Grown rather than given a slop
               ring: at this gap the rings would overlap and the last one in
               the DOM would swallow its neighbour's taps. */
            "relative h-6 w-6 rounded-full transition-transform coarse:h-9 coarse:w-9",
            "hover:scale-110",
            i === active ? "scale-[1.15] rounded-full ring-2 ring-white" : "opacity-70 hover:opacity-100",
          )}
        >
          <PokeBall ball={ball} className="h-full w-full" />
        </button>
      ))}
    </div>
  );
}
