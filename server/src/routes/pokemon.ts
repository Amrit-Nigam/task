import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { ApiError } from "../lib/errors.js";
import {
  getDetail,
  getNameIndex,
  getStatsFor,
  getSummaries,
  getTypePool,
  getTypes,
  isIndexWarm,
} from "../services/pokeapi.js";
import type { ListResponse, SortKey, SortOrder, StatBlock } from "../types.js";

const SORT_KEYS: SortKey[] = ["id", "name", "hp", "attack", "defense", "speed"];
const STAT_SORT_KEYS: Partial<Record<SortKey, keyof StatBlock>> = {
  hp: "hp",
  attack: "attack",
  defense: "defense",
  speed: "speed",
};
const MAX_PAGE_SIZE = 60;

function parseSort(value: unknown): SortKey {
  if (typeof value !== "string" || value === "") return "id";
  if (!SORT_KEYS.includes(value as SortKey)) {
    throw ApiError.badRequest(`Sort by one of: ${SORT_KEYS.join(", ")}.`);
  }
  return value as SortKey;
}

function parseNumber(value: unknown, fallback: number, { min, max }: { min: number; max: number }) {
  const parsed = typeof value === "string" ? Number(value) : fallback;
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(parsed)));
}

export const pokemonRouter = Router();

pokemonRouter.get("/types", asyncHandler(async (_request, response) => {
  const [types, index] = await Promise.all([getTypes(), getNameIndex()]);
  // `total` is the number of Pokémon, not the sum of type counts: dual-type
  // Pokémon appear under both of their types.
  response.json({ types, total: index.size });
}));

pokemonRouter.get("/pokemon", asyncHandler(async (request, response) => {
  const { type, q } = request.query;
  const sort = parseSort(request.query.sort);
  const order: SortOrder = request.query.order === "desc" ? "desc" : "asc";
  const limit = parseNumber(request.query.limit, 24, { min: 1, max: MAX_PAGE_SIZE });
  const offset = parseNumber(request.query.offset, 0, { min: 0, max: 100_000 });

  const index = await getNameIndex();
  let names =
    typeof type === "string" && type !== "" && type !== "all"
      ? await getTypePool(type.toLowerCase())
      : [...index.keys()];

  if (typeof q === "string" && q.trim() !== "") {
    const needle = q.trim().toLowerCase();
    names = names.filter((name) => name.includes(needle));
  }

  const statKey = STAT_SORT_KEYS[sort];
  if (statKey) {
    const stats = await getStatsFor(names);
    names = [...names].sort(
      (a, b) => (stats.get(b)?.[statKey] ?? 0) - (stats.get(a)?.[statKey] ?? 0),
    );
    // Stat sorts read best highest-first, so "asc" reverses the natural order.
    if (order === "asc") names.reverse();
  } else if (sort === "name") {
    names = [...names].sort((a, b) => a.localeCompare(b));
    if (order === "desc") names.reverse();
  } else {
    names = [...names].sort((a, b) => (index.get(a) ?? 0) - (index.get(b) ?? 0));
    if (order === "desc") names.reverse();
  }

  const page = names.slice(offset, offset + limit);
  const results = await getSummaries(page);
  const nextOffset = offset + limit < names.length ? offset + limit : null;

  const payload: ListResponse = {
    results,
    total: names.length,
    offset,
    limit,
    nextOffset,
    indexing: Boolean(statKey) && !isIndexWarm(),
  };
  response.json(payload);
}));

pokemonRouter.get("/pokemon/:key", asyncHandler(async (request, response) => {
  const key = request.params.key?.trim().toLowerCase();
  if (!key) throw ApiError.badRequest("Ask for a Pokémon by name or number.");
  response.json(await getDetail(key));
}));
