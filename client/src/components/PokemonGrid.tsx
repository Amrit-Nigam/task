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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
