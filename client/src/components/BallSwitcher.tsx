import { BALLS, setBallIndex, useBallIndex } from "@/lib/ballThemes";
import { cn } from "@/lib/utils";

/**
 * The casing selector — four balls, each recolouring the whole device.
 *
 * Each swatch is drawn as the ball itself rather than as a colour chip: dome
 * over shell, split by the hinge band. It is the clearest label the control
 * could have, and it doubles as a preview of what the casing becomes.
 */
export function BallSwitcher() {
  const active = useBallIndex();

  return (
    <div
      role="radiogroup"
      aria-label="Casing"
      className="flex items-center gap-1.5 rounded-full border-2 border-[var(--pd-black)] bg-black/20 p-1.5"
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
            "relative h-6 w-6 overflow-hidden rounded-full border-2 border-[var(--pd-black)] transition-transform",
            "hover:scale-110",
            i === active ? "scale-110 ring-2 ring-white/80" : "opacity-80",
          )}
        >
          {/* upper dome */}
          <span
            className="absolute inset-x-0 top-0 h-1/2"
            style={{ background: ball.dome }}
          />
          {/* lower shell */}
          <span
            className="absolute inset-x-0 bottom-0 h-1/2"
            style={{ background: ball.key === "ultra" ? ball.casing : "#f2f2f2" }}
          />
          {/* hinge band + release button */}
          <span className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-[var(--pd-black)]" />
          <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--pd-black)] bg-white" />
        </button>
      ))}
    </div>
  );
}
