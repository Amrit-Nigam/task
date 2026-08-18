import { useCallback, useEffect, useRef, useState } from "react";
import { PokedexApiError, fetchPokemonList } from "@/services/pokemonApi";
import type { ListQuery, PokemonSummary } from "@/types/pokemon";

const PAGE_SIZE = 24;

interface ListState {
  items: PokemonSummary[];
  total: number;
  nextOffset: number | null;
  indexing: boolean;
  status: "loading" | "loading-more" | "ready" | "error";
  error: PokedexApiError | null;
}

const INITIAL_STATE: ListState = {
  items: [],
  total: 0,
  nextOffset: 0,
  indexing: false,
  status: "loading",
  error: null,
};

function isAbort(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

/**
 * Loads a page of Pokémon for the current filter/sort/search, and appends
 * further pages on demand. Changing the query starts a fresh first page.
 */
export function usePokemonList(query: ListQuery) {
  const [state, setState] = useState<ListState>(INITIAL_STATE);
  const [reloadToken, setReloadToken] = useState(0);
  const controllerRef = useRef<AbortController | null>(null);

  const load = useCallback(
    async (offset: number, mode: "replace" | "append") => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      setState((current) =>
        mode === "replace"
          ? { ...INITIAL_STATE, status: "loading" }
          : { ...current, status: "loading-more", error: null },
      );

      try {
        const page = await fetchPokemonList(
          { ...query, offset, limit: PAGE_SIZE },
          controller.signal,
        );

        setState((current) => ({
          items: mode === "replace" ? page.results : [...current.items, ...page.results],
          total: page.total,
          nextOffset: page.nextOffset,
          indexing: page.indexing,
          status: "ready",
          error: null,
        }));
      } catch (error) {
        if (isAbort(error)) return;
        setState((current) => ({
          ...current,
          status: "error",
          error:
            error instanceof PokedexApiError
              ? error
              : new PokedexApiError("UNKNOWN", "Something went wrong loading the Pokédex."),
        }));
      }
    },
    [query],
  );

  useEffect(() => {
    void load(0, "replace");
    return () => controllerRef.current?.abort();
  }, [load, reloadToken]);

  const loadMore = useCallback(() => {
    if (state.nextOffset === null || state.status === "loading-more") return;
    void load(state.nextOffset, "append");
  }, [load, state.nextOffset, state.status]);

  const retry = useCallback(() => setReloadToken((token) => token + 1), []);

  return {
    ...state,
    hasMore: state.nextOffset !== null,
    loadMore,
    retry,
    pageSize: PAGE_SIZE,
  };
}
