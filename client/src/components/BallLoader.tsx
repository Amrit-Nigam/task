import { PokeBall } from "@/components/PokeBall";
import { useBall } from "@/lib/ballThemes";
import { cn } from "@/lib/utils";

interface BallLoaderProps {
  /**
   * `open` — the ball shakes, splits and closes. The signature loading state,
   * for anywhere with room to show it.
   * `spin` — the ball turns on its band. For inline use, where an opening
   * ball would be a 16px smudge.
   */
  variant?: "open" | "spin";
  /** Visible caption under an `open` loader. */
  label?: string;
  /** Sizes the ball itself (e.g. `"h-24 w-24"`), not the block around it. */
  className?: string;
}

/**
 * The application's loading state, in the device's own vocabulary.
 *
 * It is drawn from the *active* ball, so the loader is a Master Ball while the
 * casing is — the theme reaches the loading state the same way it reaches
 * every other painted part.
 *
 * On `prefers-reduced-motion` the animation is stopped globally by index.css,
 * which leaves a still closed ball on screen. That is why the accessible name
 * is on the wrapper rather than carried by the motion: with the animation gone
 * the component still announces itself, and `label` gives it a visible caption
 * to match.
 */
export function BallLoader({ variant = "open", label, className }: BallLoaderProps) {
  const ball = useBall();

  if (variant === "spin") {
    return (
      <span role="status" aria-label="Loading" className={cn("inline-block", className)}>
        <PokeBall ball={ball} className="h-full w-full animate-ball-spin" />
      </span>
    );
  }

  return (
    <div role="status" className="flex flex-col items-center gap-3">
      <div className={cn("animate-ball-shake", className)}>
        <PokeBall
          ball={ball}
          className="h-full w-full"
          openTopClassName="animate-ball-open-top"
          openBottomClassName="animate-ball-open-bottom"
        >
          {/* The flash the ball opens onto. Drawn in the ball's own dome
              colour rather than white: the specimen screen it plays on is a
              near-white display, where a white burst is simply invisible. */}
          <g className="animate-ball-burst" style={{ transformOrigin: "32px 32px" }}>
            <circle cx="32" cy="32" r="22" fill={ball.dome} opacity="0.28" />
            <circle cx="32" cy="32" r="14" fill={ball.dome} opacity="0.85" />
            <circle cx="32" cy="32" r="7" fill="#fff" opacity="0.9" />
          </g>
        </PokeBall>
      </div>
      {label ? <span className="readout">{label}</span> : <span className="sr-only">Loading</span>}
    </div>
  );
}
