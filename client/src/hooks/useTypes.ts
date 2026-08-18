import { useEffect, useState } from "react";
import { fetchTypes } from "@/services/pokemonApi";
import type { TypeInfo } from "@/types/pokemon";

/** The list of Pokémon types with how many Pokémon each holds. */
export function useTypes() {
  const [state, setState] = useState<{ types: TypeInfo[]; total: number }>({
    types: [],
    total: 0,
  });

  useEffect(() => {
    const controller = new AbortController();
    fetchTypes(controller.signal)
      .then(setState)
      // The type rail is an enhancement; if it fails the grid still works.
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  return state;
}
