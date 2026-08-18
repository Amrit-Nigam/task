import { CardSkeletonGrid } from "@/components/CardSkeleton";
import { PokemonCard } from "@/components/PokemonCard";
import type { PokemonSummary } from "@/types/pokemon";

interface PokemonGridProps {
  pokemon: PokemonSummary[];
  isLoading: boolean;
  skeletonCount: number;
  isFavorite: (name: string) => boolean;
  onToggleFavorite: (name: string) => void;
  isSelectedForCompare: (name: string) => boolean;
  onToggleCompare: (pokemon: PokemonSummary) => void;
}

/**
 * The card grid the closed device shows.
 *
 * Two columns from the narrowest phone up. One column looked calmer in
 * isolation but put a single specimen on a 667px screen — one row of a
 * 1,025-entry index per scroll, which is not a Pokédex, it is a slideshow.
 * The card carries a compact mode for that width instead.
 */
export function PokemonGrid({
  pokemon,
  isLoading,
  skeletonCount,
  isFavorite,
  onToggleFavorite,
  isSelectedForCompare,
  onToggleCompare,
}: PokemonGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
      {pokemon.map((entry, index) => (
        <PokemonCard
          key={entry.id}
          pokemon={entry}
          index={index % skeletonCount}
          isFavorite={isFavorite(entry.name)}
          onToggleFavorite={onToggleFavorite}
          isSelectedForCompare={isSelectedForCompare(entry.name)}
          onToggleCompare={onToggleCompare}
        />
      ))}
      {isLoading ? <CardSkeletonGrid count={skeletonCount} /> : null}
    </div>
  );
}
