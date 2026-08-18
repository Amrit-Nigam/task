import { useCallback, useEffect, useState } from "react";
import { PokedexApiError, fetchPokemon } from "@/services/pokemonApi";
import type { PokemonDetail } from "@/types/pokemon";

interface DetailState {
  /** Which Pokémon this state describes, so a stale record is never shown. */
  key: string | null;
  detail: PokemonDetail | null;
  status: "loading" | "ready" | "error";
  error: PokedexApiError | null;
}

const INITIAL: DetailState = { key: null, detail: null, status: "loading", error: null };

/** Loads one Pokémon's full record. Passing null clears it. */
export function usePokemonDetail(nameOrId: string | null) {
  const [state, setState] = useState<DetailState>(INITIAL);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!nameOrId) return;
    const controller = new AbortController();

    fetchPokemon(nameOrId, controller.signal)
      .then((detail) =>
        setState({ key: nameOrId, detail, status: "ready", error: null }),
      )
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setState({
          key: nameOrId,
          detail: null,
          status: "error",
          error:
            error instanceof PokedexApiError
              ? error
              : new PokedexApiError("UNKNOWN", "Something went wrong loading this Pokémon."),
        });
      });

    return () => controller.abort();
  }, [nameOrId, reloadToken]);

  const retry = useCallback(() => setReloadToken((token) => token + 1), []);

  // Until the request for the current name lands, the panel is loading.
  const isCurrent = state.key === nameOrId;
  return {
    detail: isCurrent ? state.detail : null,
    status: isCurrent ? state.status : ("loading" as const),
    error: isCurrent ? state.error : null,
    retry,
  };
}
