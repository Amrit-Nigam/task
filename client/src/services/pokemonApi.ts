import type {
  ListQuery,
  ListResponse,
  PokemonDetail,
  TypeInfo,
} from "@/types/pokemon";

/**
 * In development Vite proxies /api to the local server, so the default base is
 * a relative path. Set VITE_API_BASE for a deployed API on another origin.
 */
const API_BASE = (import.meta.env.VITE_API_BASE ?? "").replace(/\/$/, "");

/** An API failure the UI can render: carries a code and a usable message. */
export class PokedexApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "PokedexApiError";
  }

  get isNotFound() {
    return this.code === "NOT_FOUND";
  }
}

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE}/api${path}`, {
      signal,
      headers: { accept: "application/json" },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new PokedexApiError(
      "NETWORK_ERROR",
      "Can't reach the Pokédex service. Check your connection and try again.",
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new PokedexApiError(
      "BAD_RESPONSE",
      "The Pokédex service sent something we couldn't read.",
      response.status,
    );
  }

  if (!response.ok) {
    const error = (payload as { error?: { code?: string; message?: string } })?.error;
    throw new PokedexApiError(
      error?.code ?? "REQUEST_FAILED",
      error?.message ?? "The Pokédex service couldn't complete that request.",
      response.status,
    );
  }

  return payload as T;
}

export function fetchTypes(
  signal?: AbortSignal,
): Promise<{ types: TypeInfo[]; total: number }> {
  return request<{ types: TypeInfo[]; total: number }>("/types", signal);
}

export function fetchPokemonList(
  query: ListQuery & { offset: number; limit: number },
  signal?: AbortSignal,
): Promise<ListResponse> {
  const params = new URLSearchParams({
    offset: String(query.offset),
    limit: String(query.limit),
    sort: query.sort,
    order: query.order,
  });
  if (query.type) params.set("type", query.type);
  if (query.search.trim()) params.set("q", query.search.trim());

  return request<ListResponse>(`/pokemon?${params.toString()}`, signal);
}

export function fetchPokemon(nameOrId: string, signal?: AbortSignal): Promise<PokemonDetail> {
  return request<PokemonDetail>(`/pokemon/${encodeURIComponent(nameOrId)}`, signal);
}
