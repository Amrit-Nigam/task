/**
 * Every Pokémon type gets one hue, tuned so the same value reads correctly as a
 * chip on light paper and as an accent on a dark panel. Colours are stored as
 * "r g b" triples so they can be dropped into a CSS variable and re-used with
 * arbitrary alpha.
 */
const TYPE_RGB = {
  normal: "154 160 168",
  fire: "242 98 46",
  water: "59 130 214",
  electric: "233 168 27",
  grass: "76 163 85",
  ice: "79 195 217",
  fighting: "196 72 60",
  poison: "155 89 182",
  ground: "199 154 75",
  flying: "127 165 222",
  psychic: "224 91 138",
  bug: "134 163 42",
  rock: "169 141 94",
  ghost: "107 92 165",
  dragon: "90 91 199",
  dark: "85 84 94",
  steel: "125 139 153",
  fairy: "224 122 168",
} as const;

const FALLBACK_RGB = "128 138 150";

export type PokemonType = keyof typeof TYPE_RGB;

export const POKEMON_TYPES = Object.keys(TYPE_RGB) as PokemonType[];

export function typeRgb(type: string | undefined): string {
  if (!type) return FALLBACK_RGB;
  return TYPE_RGB[type as PokemonType] ?? FALLBACK_RGB;
}

/** CSS variables a component sets so its children can tint themselves. */
export function typeVars(types: readonly string[]): React.CSSProperties {
  return {
    "--type-rgb": typeRgb(types[0]),
    "--type-rgb-2": typeRgb(types[1] ?? types[0]),
  } as React.CSSProperties;
}
