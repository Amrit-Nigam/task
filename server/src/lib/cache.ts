/**
 * Minimal in-process cache. PokéAPI data is effectively immutable, so entries
 * live for a long TTL and the map is bounded only by the size of the Pokédex.
 */
export class TtlCache<T> {
  private readonly entries = new Map<string, { value: T; expiresAt: number }>();

  constructor(private readonly ttlMs: number) {}

  get(key: string): T | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt < Date.now()) {
      this.entries.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: T): T {
    this.entries.set(key, { value, expiresAt: Date.now() + this.ttlMs });
    return value;
  }

  has(key: string) {
    return this.get(key) !== undefined;
  }

  get size() {
    return this.entries.size;
  }
}

/**
 * Wraps a loader so concurrent callers asking for the same key share one
 * in-flight promise instead of stampeding the upstream API.
 */
export function singleFlight<T>(loader: (key: string) => Promise<T>) {
  const inFlight = new Map<string, Promise<T>>();
  return (key: string): Promise<T> => {
    const existing = inFlight.get(key);
    if (existing) return existing;
    const promise = loader(key).finally(() => inFlight.delete(key));
    inFlight.set(key, promise);
    return promise;
  };
}
