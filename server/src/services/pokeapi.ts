import { TtlCache, singleFlight } from "../lib/cache.js";
import { mapWithLimit } from "../lib/concurrency.js";
import { ApiError } from "../lib/errors.js";
import type {
  PokemonDetail,
  PokemonSummary,
  StatBlock,
  TypeInfo,
} from "../types.js";

const BASE_URL = process.env.POKEAPI_BASE_URL ?? "https://pokeapi.co/api/v2";
const REQUEST_TIMEOUT_MS = 12_000;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
/** Ids above this belong to alternate forms, which clutter a browsing index. */
const MAX_SPECIES_ID = 10_000;
/** Concurrent upstream requests. PokéAPI is generous but not unlimited. */
const FETCH_CONCURRENCY = 16;

const detailCache = new TtlCache<PokemonDetail>(CACHE_TTL_MS);
const typePoolCache = new TtlCache<string[]>(CACHE_TTL_MS);

/** name -> national dex id, for every Pokémon in the browsing index. */
let nameIndex: Map<string, number> | null = null;
let typeList: TypeInfo[] | null = null;
let warmState: "idle" | "running" | "done" = "idle";

async function fetchJson<T>(path: string, { allowMissing = false } = {}): Promise<T | null> {
  const url = `${BASE_URL}${path}`;
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        headers: { accept: "application/json" },
      });

      if (response.status === 404) {
        if (allowMissing) return null;
        throw ApiError.notFound(`Nothing at ${path} in the Pokédex.`);
      }
      if (response.status >= 500) {
        lastError = new Error(`PokéAPI responded ${response.status}`);
        continue; // transient; retry once
      }
      if (!response.ok) {
        throw ApiError.upstream(`PokéAPI responded ${response.status} for ${path}.`);
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      lastError = error;
    }
  }

  throw ApiError.upstream(
    `PokéAPI is unreachable (${lastError instanceof Error ? lastError.message : "unknown error"}).`,
  );
}

/* -------------------------------------------------------------------------- */
/* Normalisation                                                              */
/* -------------------------------------------------------------------------- */

interface RawNamedRef {
  name: string;
  url: string;
}

interface RawPokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number | null;
  types: { slot: number; type: RawNamedRef }[];
  abilities: { ability: RawNamedRef; is_hidden: boolean; slot: number }[];
  stats: { base_stat: number; stat: RawNamedRef }[];
  moves: {
    move: RawNamedRef;
    version_group_details: { level_learned_at: number; move_learn_method: RawNamedRef }[];
  }[];
  sprites: {
    front_default: string | null;
    other?: {
      "official-artwork"?: { front_default: string | null };
      dream_world?: { front_default: string | null };
      home?: { front_default: string | null };
    };
  };
}

interface RawSpecies {
  genera: { genus: string; language: RawNamedRef }[];
  flavor_text_entries: { flavor_text: string; language: RawNamedRef }[];
}

const STAT_NAME_MAP: Record<string, keyof StatBlock> = {
  hp: "hp",
  attack: "attack",
  defense: "defense",
  "special-attack": "specialAttack",
  "special-defense": "specialDefense",
  speed: "speed",
};

function emptyStats(): StatBlock {
  return { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 };
}

/**
 * PokéAPI hands back sprite URLs pointing at raw.githubusercontent.com, which
 * is a source host rather than a CDN: it is rate limited, uncached, and blocked
 * outright on plenty of corporate and ISP networks — where every sprite in the
 * Pokédex silently fails to load and the whole app renders as empty halos.
 *
 * jsDelivr mirrors the exact same repository at the exact same paths, so the
 * rewrite is a host swap and nothing else. Anything that is not the sprites
 * repo is left untouched.
 */
const SPRITE_SOURCE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/";
const SPRITE_CDN = "https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/";

function toCdn(url: string | null): string | null {
  if (!url) return null;
  return url.startsWith(SPRITE_SOURCE) ? SPRITE_CDN + url.slice(SPRITE_SOURCE.length) : url;
}

function pickSprite(sprites: RawPokemon["sprites"]): string | null {
  return toCdn(
    sprites.other?.["official-artwork"]?.front_default ??
      sprites.other?.home?.front_default ??
      sprites.other?.dream_world?.front_default ??
      sprites.front_default ??
      null,
  );
}

function normaliseDetail(raw: RawPokemon, species: RawSpecies | null): PokemonDetail {
  const stats = emptyStats();
  for (const entry of raw.stats) {
    const key = STAT_NAME_MAP[entry.stat.name];
    if (key) stats[key] = entry.base_stat;
  }

  // Level-up moves read best in a detail panel; keep them ordered by level.
  const levelUpMoves = raw.moves
    .flatMap((entry) => {
      const detail = entry.version_group_details.find(
        (version) => version.move_learn_method.name === "level-up",
      );
      return detail
        ? [{
            name: entry.move.name,
            learnedAtLevel: detail.level_learned_at,
            learnMethod: detail.move_learn_method.name,
          }]
        : [];
    })
    .sort((a, b) => a.learnedAtLevel - b.learnedAtLevel || a.name.localeCompare(b.name));

  const englishFlavour = species?.flavor_text_entries.find(
    (entry) => entry.language.name === "en",
  );
  const englishGenus = species?.genera.find((entry) => entry.language.name === "en");

  return {
    id: raw.id,
    name: raw.name,
    types: [...raw.types].sort((a, b) => a.slot - b.slot).map((entry) => entry.type.name),
    sprite: pickSprite(raw.sprites),
    height: raw.height,
    weight: raw.weight,
    stats,
    baseExperience: raw.base_experience,
    abilities: [...raw.abilities]
      .sort((a, b) => a.slot - b.slot)
      .map((entry) => ({ name: entry.ability.name, isHidden: entry.is_hidden })),
    moves: levelUpMoves.slice(0, 12),
    moveCount: raw.moves.length,
    description: englishFlavour
      ? englishFlavour.flavor_text
          .replace(/[\n\f\r]+/g, " ")
          // PokéAPI ships flavour text shouting "POKéMON"; the UI sets its own case.
          .replace(/POK[Éé]MON/g, "Pokémon")
          .trim()
      : null,
    genus: englishGenus?.genus ?? null,
  };
}

export function toSummary(detail: PokemonDetail): PokemonSummary {
  const { id, name, types, sprite, height, weight, stats } = detail;
  return { id, name, types, sprite, height, weight, stats };
}

/* -------------------------------------------------------------------------- */
/* Public accessors                                                           */
/* -------------------------------------------------------------------------- */

/** Every Pokémon in the index, in national dex order. */
export async function getNameIndex(): Promise<Map<string, number>> {
  if (nameIndex) return nameIndex;

  const payload = await fetchJson<{ results: RawNamedRef[] }>("/pokemon?limit=20000&offset=0");
  const index = new Map<string, number>();

  for (const entry of payload!.results) {
    const id = Number(entry.url.replace(/\/$/, "").split("/").pop());
    if (Number.isFinite(id) && id < MAX_SPECIES_ID) index.set(entry.name, id);
  }

  nameIndex = index;
  return index;
}

export async function getTypes(): Promise<TypeInfo[]> {
  if (typeList) return typeList;

  const payload = await fetchJson<{ results: RawNamedRef[] }>("/type");
  // "unknown" and "shadow" hold no browsable Pokémon.
  const names = payload!.results
    .map((entry) => entry.name)
    .filter((name) => name !== "unknown" && name !== "shadow");

  const counted = await mapWithLimit(names, 8, async (name) => ({
    name,
    count: (await getTypePool(name)).length,
  }));

  // A type nobody belongs to (Stellar) would only be a dead filter.
  typeList = counted.filter((type) => type.count > 0);
  return typeList;
}

/** Names of every Pokémon of a type, in national dex order. */
export const getTypePool = singleFlight(async (type: string): Promise<string[]> => {
  const cached = typePoolCache.get(type);
  if (cached) return cached;

  const payload = await fetchJson<{ pokemon: { pokemon: RawNamedRef }[] }>(
    `/type/${encodeURIComponent(type)}`,
    { allowMissing: true },
  );
  if (!payload) throw ApiError.notFound(`No Pokémon type called "${type}".`);

  const index = await getNameIndex();
  const names = payload.pokemon
    .map((entry) => entry.pokemon.name)
    .filter((name) => index.has(name))
    .sort((a, b) => (index.get(a) ?? 0) - (index.get(b) ?? 0));

  return typePoolCache.set(type, names);
});

/** Full detail for one Pokémon, by name or id. Cached across requests. */
export const getDetail = singleFlight(async (key: string): Promise<PokemonDetail> => {
  const cacheKey = key.toLowerCase();
  const cached = detailCache.get(cacheKey);
  if (cached) return cached;

  const raw = await fetchJson<RawPokemon>(`/pokemon/${encodeURIComponent(cacheKey)}`, {
    allowMissing: true,
  });
  if (!raw) throw ApiError.notFound(`No Pokémon named "${key}".`);

  // Species data is optional polish — never fail the request over it.
  const species = await fetchJson<RawSpecies>(`/pokemon-species/${raw.id}`, {
    allowMissing: true,
  }).catch(() => null);

  const detail = normaliseDetail(raw, species);
  detailCache.set(cacheKey, detail);
  detailCache.set(String(detail.id), detail);
  detailCache.set(detail.name, detail);
  return detail;
});

export async function getSummaries(names: readonly string[]): Promise<PokemonSummary[]> {
  const details = await mapWithLimit(names, FETCH_CONCURRENCY, (name) => getDetail(name));
  return details.map(toSummary);
}

/* -------------------------------------------------------------------------- */
/* Stat index                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Sorting by a base stat needs every candidate's details, so the whole index is
 * warmed once in the background at boot. Callers can check `isIndexWarm()` and
 * tell the user the ordering is still settling.
 */
export function isIndexWarm() {
  return warmState === "done";
}

/**
 * What the service is holding, for the health probe.
 *
 * Reported rather than recomputed: every value here is already in memory, so
 * the probe stays a constant-time read and never touches the upstream API. A
 * health check that reaches out to a third party reports *their* outage as
 * ours, and gets the instance killed for someone else's downtime.
 */
export function getServiceState() {
  return {
    /** `idle` before the warm-up starts or after it failed and can retry. */
    statIndex: warmState,
    /* Entries, not Pokémon: each detail is stored under its lookup key, its
       id and its name, so this runs to roughly three times the number of
       species held. Reported raw rather than divided — it is a cache-occupancy
       figure, and guessing at a species count from it would be worse. */
    detailCacheEntries: detailCache.size,
    typePoolCacheEntries: typePoolCache.size,
    knownSpecies: nameIndex?.size ?? null,
    upstream: BASE_URL,
  };
}

export async function warmStatIndex(): Promise<void> {
  if (warmState !== "idle") return;
  warmState = "running";

  try {
    const names = [...(await getNameIndex()).keys()];
    await mapWithLimit(names, FETCH_CONCURRENCY, async (name) => {
      try {
        await getDetail(name);
      } catch {
        // A single missing entry must not abort the warm-up.
      }
    });
    warmState = "done";
  } catch {
    warmState = "idle"; // allow a later retry
  }
}

/** Cached stats if we already hold them, otherwise fetches them. */
export async function getStatsFor(names: readonly string[]): Promise<Map<string, StatBlock>> {
  const details = await mapWithLimit(names, FETCH_CONCURRENCY, async (name) => {
    try {
      return await getDetail(name);
    } catch {
      return null;
    }
  });

  const stats = new Map<string, StatBlock>();
  for (const detail of details) {
    if (detail) stats.set(detail.name, detail.stats);
  }
  return stats;
}
