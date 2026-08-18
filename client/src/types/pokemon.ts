/** Mirrors the shapes served by the Pokédex API in `server/`. */

export type StatKey =
  | "hp"
  | "attack"
  | "defense"
  | "specialAttack"
  | "specialDefense"
  | "speed";

export type StatBlock = Record<StatKey, number>;

export interface PokemonSummary {
  id: number;
  name: string;
  types: string[];
  sprite: string | null;
  /** Decimetres. */
  height: number;
  /** Hectograms. */
  weight: number;
  stats: StatBlock;
}

export interface PokemonAbility {
  name: string;
  isHidden: boolean;
}

export interface PokemonMove {
  name: string;
  learnedAtLevel: number;
  learnMethod: string;
}

export interface PokemonDetail extends PokemonSummary {
  baseExperience: number | null;
  abilities: PokemonAbility[];
  moves: PokemonMove[];
  moveCount: number;
  description: string | null;
  genus: string | null;
}

export interface ListResponse {
  results: PokemonSummary[];
  total: number;
  offset: number;
  limit: number;
  nextOffset: number | null;
  indexing: boolean;
}

export interface TypeInfo {
  name: string;
  count: number;
}

export type SortKey = "id" | "name" | "hp" | "attack" | "defense" | "speed";
export type SortOrder = "asc" | "desc";

export interface ListQuery {
  type: string | null;
  search: string;
  sort: SortKey;
  order: SortOrder;
}

export const STAT_LABELS: Record<StatKey, string> = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  specialAttack: "Sp. Atk",
  specialDefense: "Sp. Def",
  speed: "Speed",
};

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "id", label: "Dex number" },
  { value: "name", label: "Name" },
  { value: "hp", label: "HP" },
  { value: "attack", label: "Attack" },
  { value: "speed", label: "Speed" },
  { value: "defense", label: "Defense" },
];
