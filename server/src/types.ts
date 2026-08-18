/** Shapes returned by this API. The client imports the same names. */

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
  /** Best available artwork, falling back through the sprite variants. */
  sprite: string | null;
  /** Decimetres, as PokéAPI reports it. */
  height: number;
  /** Hectograms, as PokéAPI reports it. */
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
  /** Species flavour text, whitespace-normalised. Null when unavailable. */
  description: string | null;
  genus: string | null;
}

export interface ListResponse {
  results: PokemonSummary[];
  total: number;
  offset: number;
  limit: number;
  nextOffset: number | null;
  /** True while the stat index is still being built in the background. */
  indexing: boolean;
}

export interface TypeInfo {
  name: string;
  count: number;
}

export type SortKey = "id" | "name" | "hp" | "attack" | "defense" | "speed";
export type SortOrder = "asc" | "desc";
