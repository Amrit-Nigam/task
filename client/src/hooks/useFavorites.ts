import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "pokedex.favorites";

function readFavorites(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((name): name is string => typeof name === "string") : [];
  } catch {
    return [];
  }
}

/** Favourite Pokémon names, persisted to localStorage. */
export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set(readFavorites()));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]));
  }, [favorites]);

  const toggleFavorite = useCallback((name: string) => {
    setFavorites((current) => {
      const next = new Set(current);
      if (!next.delete(name)) next.add(name);
      return next;
    });
  }, []);

  const isFavorite = useCallback((name: string) => favorites.has(name), [favorites]);

  return { favorites, isFavorite, toggleFavorite };
}
