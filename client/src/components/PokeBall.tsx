import type { Ball } from "@/lib/ballThemes";
import { cn } from "@/lib/utils";

/**
 * A Poké Ball, drawn as one.
 *
 * The switcher used to stack four divs — a coloured half, a white half, a 2px
 * band and a dot — which at 24px read as a striped circle rather than as a
 * ball. This draws the real article instead: dome over shell, the black band
 * across the equator, the release button set into it, and a specular highlight
 * so the thing looks moulded rather than printed.
 *
 * Each ball also carries its own livery, because colour alone does not
 * identify them — an Ultra Ball is not "the gold one", it is the black one
 * with the gold shoulders. Every mark is drawn in the ball's own `accent`,
 * which is exactly the secondary each pairing already defines.
 */
interface PokeBallProps {
  ball: Ball;
  className?: string;
  /** Halves split apart, for the opening animation. */
  openTopClassName?: string;
  openBottomClassName?: string;
  children?: React.ReactNode;
}

export function PokeBall({
  ball,
  className,
  openTopClassName,
  openBottomClassName,
  children,
}: PokeBallProps) {
  /* An Ultra Ball's top is black with gold shoulders, not gold — and every
     ball's lower half is white. Taking `dome` literally for Ultra produced a
     gold ball that read as a Poké Ball in the wrong hue. */
  const dome = ball.key === "ultra" ? ball.casing : ball.dome;
  const clipId = `pb-clip-${ball.key}`;

  return (
    <svg viewBox="0 0 64 64" className={cn("overflow-visible", className)} aria-hidden focusable="false">
      <defs>
        {/* Half-discs, not a whole circle: each half has to carry its own
            outline, or the shell's edge stays behind when the ball opens and
            the thing reads as a hoop with two pieces poking out of it. The
            clip sits *inside* the animated group so the shape travels whole
            rather than sliding through a fixed window. */}
        <clipPath id={`${clipId}-top`}>
          <path d="M3 32 A29 29 0 0 1 61 32 Z" />
        </clipPath>
        <clipPath id={`${clipId}-bottom`}>
          <path d="M3 32 A29 29 0 0 0 61 32 Z" />
        </clipPath>
      </defs>

      {/* What the ball opens onto. Behind both halves, so a closed ball hides
          it completely and parting the halves reveals it. */}
      {children}

      {/* ---- upper half ------------------------------------------------- */}
      <g className={openTopClassName}>
        <g clipPath={`url(#${clipId}-top)`}>
          <rect x="0" y="0" width="64" height="32" fill={dome} />
          {/* Specular — the light lands on the dome, so it belongs to this
              half and travels with it. Drawn beneath the livery: over it, at
              swatch size, it washes the marks into a smear. */}
          <ellipse
            cx="20"
            cy="14.5"
            rx="7.5"
            ry="4.2"
            fill="#fff"
            opacity="0.26"
            transform="rotate(-30 20 14.5)"
          />
          <Livery ball={ball} />
          <rect x="0" y="27.5" width="64" height="4.5" fill="var(--pd-black)" />
          {/* A contrast rim just outside the shell outline. Invisible against
              a light surface, it is what keeps an Ultra Ball — a near-black
              dome outlined in near-black — from dissolving into the specimen
              screen in night mode. Carried per half so it travels with it. */}
          <circle cx="32" cy="32" r="31.4" fill="none" stroke="#fff" strokeWidth="2" opacity="0.22" />
          <circle cx="32" cy="32" r="29" fill="none" stroke="var(--pd-black)" strokeWidth="4" />
        </g>
      </g>

      {/* ---- lower half, and the button set into it --------------------- */}
      <g className={openBottomClassName}>
        <g clipPath={`url(#${clipId}-bottom)`}>
          <rect x="0" y="32" width="64" height="32" fill="#f7f7f8" />
          {/* The shell darkens where it turns away from the light. */}
          <ellipse cx="32" cy="66" rx="25" ry="8" fill="var(--pd-black)" opacity="0.09" />
          <rect x="0" y="32" width="64" height="4.5" fill="var(--pd-black)" />
          {/* A contrast rim just outside the shell outline. Invisible against
              a light surface, it is what keeps an Ultra Ball — a near-black
              dome outlined in near-black — from dissolving into the specimen
              screen in night mode. Carried per half so it travels with it. */}
          <circle cx="32" cy="32" r="31.4" fill="none" stroke="#fff" strokeWidth="2" opacity="0.22" />
          <circle cx="32" cy="32" r="29" fill="none" stroke="var(--pd-black)" strokeWidth="4" />
        </g>
        {/* The release button rides the lower half, as it does on the real
            article — left behind at centre it floats in the open gap. */}
        <circle cx="32" cy="32" r="8.6" fill="#f4f4f5" stroke="var(--pd-black)" strokeWidth="3.6" />
        <circle cx="32" cy="32" r="3.1" fill="#fff" stroke="var(--pd-black)" strokeWidth="2.2" />
      </g>
    </svg>
  );
}

/**
 * The markings that tell the four apart at swatch size.
 *
 * Poké Ball carries none — a plain dome is its identity, and inventing a mark
 * for it would make the other three read as variants of it rather than as
 * their own balls.
 */
function Livery({ ball }: { ball: Ball }) {
  if (ball.key === "great") {
    /* Shoulder flashes sweeping down to the band. */
    return (
      <g fill={ball.accent}>
        <path d="M1 29 L13 5 L22 9 L12 29 Z" />
        <path d="M63 29 L51 5 L42 9 L52 29 Z" />
      </g>
    );
  }

  if (ball.key === "ultra") {
    /* The gold shoulders, joined across the crown — the Ultra Ball's "H". */
    return (
      <g fill={ball.accent}>
        <path d="M2 29 L12 5 L22 9 L13 29 Z" />
        <path d="M62 29 L52 5 L42 9 L51 29 Z" />
        <rect x="19" y="9" width="26" height="7.5" rx="1.5" />
      </g>
    );
  }

  if (ball.key === "master") {
    /* The M, and the two studs either side of it. Lifted off the theme's own
       accent: that pink is tuned for text on the interior's near-white panels,
       and on the dome's violet it has barely a step of contrast. */
    return (
      <g fill="#F58ACE">
        <path d="M20 22 L23.5 5 L32 14 L40.5 5 L44 22 L37 22 L35.6 13 L32 17.5 L28.4 13 L27 22 Z" />
        <circle cx="9.5" cy="19" r="4.8" />
        <circle cx="54.5" cy="19" r="4.8" />
      </g>
    );
  }

  return null;
}
