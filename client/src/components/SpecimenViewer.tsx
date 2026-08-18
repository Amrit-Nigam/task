import { Heart } from "lucide-react";
import { TypeChip } from "@/components/TypeChip";
import { formatDexNumber, formatName } from "@/lib/format";
import { typeVars } from "@/lib/types-theme";
import { cn } from "@/lib/utils";
import type { PokemonDetail } from "@/types/pokemon";

interface SpecimenViewerProps {
  detail: PokemonDetail | null;
  isLoading: boolean;
  isFavorite: boolean;
  onToggleFavorite: (name: string) => void;
}

/**
 * The device's main screen — the left half of the Pokédex.
 *
 * It shows one thing at a time and shows it large: the artwork of whatever is
 * selected in the index, lit by its own type halo, with the dex number, name
 * and types stamped underneath. Everything written about the specimen lives on
 * the other half, which is the whole point of the two-panel layout — the
 * picture never has to compete with the data for room.
 */
export function SpecimenViewer({
  detail,
  isLoading,
  isFavorite,
  onToggleFavorite,
}: SpecimenViewerProps) {
  return (
    <div style={detail ? typeVars(detail.types) : undefined}>
      {/* Capped by viewport height as well as aspect: on a short window the
          artwork gives room back to the index rather than pushing it off. */}
      <div className="screen relative grid aspect-[5/4] max-h-[34vh] w-full place-items-center overflow-hidden">
        {/* Scanline wash — the display is lit, not printed. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.055]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgb(var(--ink)) 0px, rgb(var(--ink)) 1px, transparent 1px, transparent 4px)",
          }}
        />

        {detail ? (
          <>
            <span className="halo absolute inset-6 rounded-full" aria-hidden />
            <span
              className="halo-ring inset-y-4 aspect-square opacity-70"
              aria-hidden
            />
            <span className="readout absolute left-4 top-3.5 text-[11px]">
              {formatDexNumber(detail.id)}
            </span>
            <button
              type="button"
              onClick={() => onToggleFavorite(detail.name)}
              aria-pressed={isFavorite}
              aria-label={
                isFavorite
                  ? `Remove ${formatName(detail.name)} from favorites`
                  : `Add ${formatName(detail.name)} to favorites`
              }
              className={cn(
                "absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full transition-colors",
                isFavorite ? "text-signal" : "text-muted hover:bg-ink/[0.08] hover:text-ink",
              )}
            >
              <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
            </button>
            {detail.sprite ? (
              <img
                key={detail.name}
                src={detail.sprite}
                alt={formatName(detail.name)}
                width={340}
                height={340}
                className="relative z-10 h-[78%] w-[78%] animate-fade-up object-contain drop-shadow-[0_18px_28px_rgb(var(--type-rgb)/0.4)]"
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

      <div className="mt-3 min-h-[4.25rem]">
        {detail ? (
          <>
            <h2 className="font-display text-2xl font-bold leading-none tracking-tight text-white">
              {formatName(detail.name)}
            </h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {detail.types.map((type) => (
                <TypeChip key={type} type={type} />
              ))}
            </div>
          </>
        ) : (
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-white/70">
            {isLoading ? "Reading…" : "No specimen selected"}
          </p>
        )}
      </div>
    </div>
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
