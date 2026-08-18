import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Heart } from "lucide-react";
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
        <div className="screen relative flex h-[clamp(190px,26vh,280px)] w-full items-center justify-center overflow-hidden p-3">
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
            <span className="skeleton h-[70%] w-[70%] rounded-full" />
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
      <div className="mt-3 flex items-center gap-3">
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

        {/* The D-pad. Left/up steps back, right/down steps forward. */}
        <div className="grid shrink-0 grid-cols-3 grid-rows-3 gap-[2px]" role="group" aria-label="Step through the index">
          <PadKey className="col-start-2 row-start-1" label="Previous" disabled={!canStepBack} onClick={() => onStep(-1)}>
            <ChevronUp className="h-3.5 w-3.5" />
          </PadKey>
          <PadKey className="col-start-1 row-start-2" label="Previous entry" disabled={!canStepBack} onClick={() => onStep(-1)}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </PadKey>
          <span className="col-start-2 row-start-2 bg-[#26272b]" aria-hidden />
          <PadKey className="col-start-3 row-start-2" label="Next entry" disabled={!canStepForward} onClick={() => onStep(1)}>
            <ChevronRight className="h-3.5 w-3.5" />
          </PadKey>
          <PadKey className="col-start-2 row-start-3" label="Next" disabled={!canStepForward} onClick={() => onStep(1)}>
            <ChevronDown className="h-3.5 w-3.5" />
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
  className,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "grid h-5 w-5 place-items-center bg-[#26272b] text-white/80",
        "transition-colors hover:bg-[#3a3c42] disabled:opacity-35 disabled:hover:bg-[#26272b]",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** What the screen shows with nothing loaded — a dormant ball, not a blank. */
function IdleScreen() {
  return (
    <div className="relative z-10 flex flex-col items-center gap-3 opacity-40">
      <span className="relative h-20 w-20 overflow-hidden rounded-full border-[3px] border-[var(--pd-black)]">
        <span className="absolute inset-x-0 top-0 h-1/2 bg-[var(--pd-dome)]" />
        <span className="absolute inset-x-0 bottom-0 h-1/2 bg-[rgb(var(--surface))]" />
        <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 bg-[var(--pd-black)]" />
        <span className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[var(--pd-black)] bg-[rgb(var(--surface))]" />
      </span>
      <span className="readout">Select a specimen</span>
    </div>
  );
}
