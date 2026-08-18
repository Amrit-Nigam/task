import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { BallLoader } from "@/components/BallLoader";
import { PokeBall } from "@/components/PokeBall";
import { useBall } from "@/lib/ballThemes";
import { formatDexNumber, formatName } from "@/lib/format";
import { typeVars } from "@/lib/types-theme";
import { cn } from "@/lib/utils";
import type { PokemonDetail } from "@/types/pokemon";

interface SpecimenViewerProps {
  detail: PokemonDetail | null;
  isLoading: boolean;
  isFavorite: boolean;
  onToggleFavorite: (name: string) => void;
  /** Step to the previous/next entry in the current result set. */
  onStep: (delta: number) => void;
  canStepBack: boolean;
  canStepForward: boolean;
}

/**
 * The device's screen half.
 *
 * Modelled on the physical article: the display is not a panel floating on the
 * casing, it is set into a silver moulding with two lamps above it and speaker
 * slits below. Under the moulding sits the control cluster — the big round
 * button, the lit green readout, and the D-pad that walks the index.
 *
 * The D-pad is real: it steps through the current result set, so the device can
 * be driven one entry at a time without touching the list. That is what the pad
 * is for on the physical device, and it is the fastest way to flip through a
 * filtered set.
 */
export function SpecimenViewer({
  detail,
  isLoading,
  isFavorite,
  onToggleFavorite,
  onStep,
  canStepBack,
  canStepForward,
}: SpecimenViewerProps) {
  return (
    <div className="shrink-0" style={detail ? typeVars(detail.types) : undefined}>
      {/* ---- the silver moulding, and the screen set into it -------------- */}
      <div className="frame p-2.5">
        <div className="mb-2 flex items-center gap-1.5 px-0.5">
          <span
            className="led h-2.5 w-2.5"
            style={{ "--lamp-color": "var(--pd-led-red)" } as React.CSSProperties}
            aria-hidden
          />
          <span
            className="led h-2.5 w-2.5"
            style={{ "--lamp-color": "var(--pd-led-red)" } as React.CSSProperties}
            aria-hidden
          />
          <span className="ml-auto font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[#8a8a8f]">
            {detail ? formatDexNumber(detail.id) : "————"}
          </span>
        </div>

        {/* A definite height, not an aspect ratio capped by max-height: with a
            ratio the child's percentage height resolves against the pre-clamp
            box, so the artwork rendered taller than the screen and was cropped
            by the overflow. */}
        <div className="screen relative flex h-[clamp(120px,20vh,280px)] w-full items-center justify-center overflow-hidden p-3">
          {/* Scanline wash — the display is lit, not printed. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20 opacity-[0.06]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, rgb(var(--ink)) 0px, rgb(var(--ink)) 1px, transparent 1px, transparent 4px)",
            }}
          />

          {detail ? (
            <>
              <span className="halo absolute inset-6 rounded-full" aria-hidden />
              <span className="halo-ring inset-y-3 aspect-square opacity-70" aria-hidden />
              {detail.sprite ? (
                <img
                  key={detail.name}
                  src={detail.sprite}
                  alt={formatName(detail.name)}
                  width={340}
                  height={340}
                  className="relative z-10 max-h-full max-w-full animate-fade-up object-contain drop-shadow-[0_18px_28px_rgb(var(--type-rgb)/0.4)]"
                />
              ) : (
                <span className="readout relative z-10">No artwork</span>
              )}
            </>
          ) : isLoading ? (
            <BallLoader className="h-[46%] max-h-24 min-h-14 w-auto aspect-square" label="Reading" />
          ) : (
            <IdleScreen />
          )}
        </div>

        {/* Speaker slits, as under the screen on the real casing. */}
        <div className="mt-2 flex justify-end gap-[3px] px-1" aria-hidden>
          {Array.from({ length: 5 }, (_, index) => (
            <span key={index} className="h-[3px] w-6 rounded-full bg-[#a9a9ae]" />
          ))}
        </div>
      </div>

      {/* ---- control cluster, on the casing under the moulding ------------ */}
      <div className="mt-3 flex items-stretch gap-3">
        {/* The big round button: it holds the specimen in the collection. */}
        <button
          type="button"
          disabled={!detail}
          onClick={() => detail && onToggleFavorite(detail.name)}
          aria-pressed={isFavorite}
          aria-label={
            detail
              ? isFavorite
                ? `Remove ${formatName(detail.name)} from favorites`
                : `Add ${formatName(detail.name)} to favorites`
              : "Favorite"
          }
          className={cn(
            "pd-press grid h-12 w-12 shrink-0 place-items-center rounded-full border-[3px] border-[var(--pd-black)]",
            "disabled:opacity-50",
            isFavorite ? "text-[#ff5b5b]" : "text-white/45",
          )}
          style={{
            background:
              "radial-gradient(circle at 34% 28%, rgb(255 255 255 / 0.28), transparent 46%), #26272b",
          }}
        >
          <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
        </button>

        {/* The lit green readout — the name, in the device's own voice. */}
        <div className="display flex min-w-0 flex-1 items-center px-3 py-2">
          <span className="truncate font-mono text-sm font-bold uppercase tracking-[0.1em]">
            {detail ? formatName(detail.name) : isLoading ? "Reading…" : "— no specimen —"}
          </span>
        </div>

        {/* The rocker that walks the index. It reads as one moulded part, the
            way the pad does on the device — but laid out along the row rather
            than as a cross: a three-row cross stands 88px tall, which on a
            768px-high screen was costing more of the left column than the
            index list it exists to drive. Nothing is lost with it, since the
            pad's up and down keys were bound to the same two steps as its
            left and right. */}
        <div
          className="flex shrink-0 items-stretch gap-[2px] overflow-hidden rounded-[8px] border-[2px] border-[var(--pd-black)]"
          role="group"
          aria-label="Step through the index"
        >
          <PadKey label="Previous entry" disabled={!canStepBack} onClick={() => onStep(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </PadKey>
          <span className="w-2 self-stretch bg-[#26272b]" aria-hidden />
          <PadKey label="Next entry" disabled={!canStepForward} onClick={() => onStep(1)}>
            <ChevronRight className="h-4 w-4" />
          </PadKey>
        </div>
      </div>
    </div>
  );
}

function PadKey({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        /* Full-height keys, 36px wide — comfortably thumb-sized on the
           landscape tablet where this layout is still in play, against the
           20px the cross's keys used to be. */
        "grid w-9 place-items-center self-stretch bg-[#26272b] text-white/80",
        "transition-colors hover:bg-[#3a3c42] disabled:opacity-35 disabled:hover:bg-[#26272b]",
      )}
    >
      {children}
    </button>
  );
}

/** What the screen shows with nothing loaded — a dormant ball, not a blank. */
function IdleScreen() {
  const ball = useBall();
  return (
    <div className="relative z-10 flex flex-col items-center gap-3 opacity-45">
      <PokeBall ball={ball} className="h-16 w-16" />
      <span className="readout">Select a specimen</span>
    </div>
  );
}
