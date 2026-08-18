import { GitCompareArrows, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { BallLoader } from "@/components/BallLoader";
import { Button } from "@/components/ui/button";
import { formatDexNumber, formatName } from "@/lib/format";
import { typeVars } from "@/lib/types-theme";
import { cn } from "@/lib/utils";
import type { PokemonSummary } from "@/types/pokemon";

interface IndexListProps {
  pokemon: PokemonSummary[];
  /** Name of the entry currently on the viewer screen. */
  activeName: string | null;
  isLoading: boolean;
  isFavorite: (name: string) => boolean;
  onToggleFavorite: (name: string) => void;
  isSelectedForCompare: (name: string) => boolean;
  onToggleCompare: (pokemon: PokemonSummary) => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  total: number;
}

/**
 * The index the device scrolls through — the left panel's lower half.
 *
 * Rows rather than cards: at this width a card grid would fit two across and
 * turn the whole left half into artwork, which is the viewer's job. A row
 * carries the sprite small, the dex number, the name and its type stripe, so
 * a hundred of them stay scannable in one column.
 */
export function IndexList({
  pokemon,
  activeName,
  isLoading,
  isFavorite,
  onToggleFavorite,
  isSelectedForCompare,
  onToggleCompare,
  hasMore,
  isLoadingMore,
  onLoadMore,
  total,
}: IndexListProps) {
  return (
    /* `min-h` rather than pure flex: the viewer and the controls above are
       fixed-height, so on a short screen the index was the only thing left to
       give and collapsed to a couple of pixels. */
    <div className="screen flex min-h-[9rem] flex-1 flex-col overflow-hidden">
      <ul className="min-h-0 flex-1 divide-y-2 divide-[var(--pd-black)] overflow-y-auto overscroll-contain">
        {pokemon.map((entry) => {
          const isActive = entry.name === activeName;
          return (
            <li key={entry.name} style={typeVars(entry.types)}>
              <div
                className={cn(
                  "group relative flex items-center gap-3 pl-0 pr-2 transition-colors",
                  isActive ? "bg-[rgb(var(--type-rgb)/0.16)]" : "hover:bg-ink/[0.05]",
                )}
              >
                {/* Type stripe doubles as the selection marker. */}
                <span
                  aria-hidden
                  className={cn(
                    "w-1.5 self-stretch transition-all",
                    isActive ? "bg-[rgb(var(--type-rgb))]" : "bg-[rgb(var(--type-rgb)/0.4)]",
                  )}
                />

                {entry.sprite ? (
                  <img
                    src={entry.sprite}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    width={44}
                    height={44}
                    className="h-10 w-10 shrink-0 object-contain"
                  />
                ) : (
                  <span className="h-10 w-10 shrink-0" />
                )}

                <span className="readout w-12 shrink-0 text-[10px]">
                  {formatDexNumber(entry.id)}
                </span>

                <Link
                  to={`/pokemon/${entry.name}`}
                  className={cn(
                    "min-w-0 flex-1 truncate py-2 text-[15px] font-semibold outline-none",
                    "after:absolute after:inset-0 after:content-['']",
                    isActive && "text-[rgb(var(--type-rgb))]",
                  )}
                >
                  {formatName(entry.name)}
                </Link>

                <span className="relative z-10 flex shrink-0 items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => onToggleCompare(entry)}
                    aria-pressed={isSelectedForCompare(entry.name)}
                    aria-label={
                      isSelectedForCompare(entry.name)
                        ? `Remove ${formatName(entry.name)} from compare`
                        : `Add ${formatName(entry.name)} to compare`
                    }
                    className={cn(
                      "grid h-9 w-9 place-items-center rounded-full transition-colors coarse:h-10 coarse:w-10",
                      isSelectedForCompare(entry.name)
                        ? "bg-ink text-canvas"
                        : "text-muted/60 hover:bg-ink/[0.08] hover:text-ink",
                    )}
                  >
                    <GitCompareArrows className="h-[15px] w-[15px]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(entry.name)}
                    aria-pressed={isFavorite(entry.name)}
                    aria-label={
                      isFavorite(entry.name)
                        ? `Unfavorite ${formatName(entry.name)}`
                        : `Favorite ${formatName(entry.name)}`
                    }
                    className={cn(
                      "grid h-9 w-9 place-items-center rounded-full transition-colors coarse:h-10 coarse:w-10",
                      isFavorite(entry.name)
                        ? "text-signal"
                        : "text-muted/60 hover:bg-ink/[0.08] hover:text-ink",
                    )}
                  >
                    <Heart
                      className={cn("h-4 w-4", isFavorite(entry.name) && "fill-current")}
                    />
                  </button>
                </span>
              </div>
            </li>
          );
        })}

        {isLoading
          ? Array.from({ length: 8 }, (_, index) => (
              <li key={`skeleton-${index}`} className="flex items-center gap-3 px-3 py-3">
                <span className="skeleton h-11 w-11 shrink-0 rounded-full" />
                <span className="skeleton h-3 w-12 shrink-0 rounded" />
                <span className="skeleton h-3.5 flex-1 rounded" />
              </li>
            ))
          : null}
      </ul>

      {hasMore ? (
        <div className="flex shrink-0 items-center justify-between gap-3 border-t-[3px] border-[var(--pd-black)] px-3 py-2.5">
          <span className="readout">
            {pokemon.length} of {total}
          </span>
          <Button variant="outline" size="sm" onClick={onLoadMore} disabled={isLoadingMore}>
            {isLoadingMore ? (
              <>
                <BallLoader variant="spin" className="h-4 w-4" />
                Loading
              </>
            ) : (
              "Load more"
            )}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
