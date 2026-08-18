import { useEffect, useState } from "react";
import { fetchPokemon } from "@/services/pokemonApi";
import type { PokemonSummary } from "@/types/pokemon";

interface FavoriteState {
  /** The name list this result belongs to, so stale records are never shown. */
  key: string;
  items: PokemonSummary[];
}

const EMPTY: FavoriteState = { key: "", items: [] };

/**
 * Favourites are stored as names, so the saved set is resolved to full records
 * here. Only runs while the favourites view is open.
 */
export function useFavoritePokemon(names: string[], enabled: boolean) {
  const [state, setState] = useState<FavoriteState>(EMPTY);
  const key = names.join(",");

  useEffect(() => {
    if (!enabled || names.length === 0) return;
    const controller = new AbortController();

    Promise.all(names.map((name) => fetchPokemon(name, controller.signal).catch(() => null)))
      .then((results) => {
        if (controller.signal.aborted) return;
        // A favourite that no longer resolves is simply left out.
        setState({ key, items: results.filter((result) => result !== null) });
      })
      .catch(() => setState({ key, items: [] }));

    return () => controller.abort();
    // `key` stands in for the name list, which is a new array every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);

  const isCurrent = state.key === key;
  return {
    items: enabled && isCurrent ? state.items : [],
    isLoading: enabled && names.length > 0 && !isCurrent,
  };
}
