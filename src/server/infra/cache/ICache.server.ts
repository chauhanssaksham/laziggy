/**
 * Generic cache interface.
 * Implementations: `TTLCache` (in-memory), `InstrumentedCache` (metrics
 * decorator), future Redis/distributed caches. Compose via `CacheFactory`.
 *
 * ## Type constraint
 *
 * `T extends {} | null` — TypeScript's idiom for "any value except
 * `undefined`." We reserve `undefined` as the "not-found" sentinel for
 * `get()`; caching `undefined` as a value is unsupported (indistinguishable
 * from a miss). Matches Guava / Caffeine conventions.
 *
 * Every primitive and object satisfies this — `ICache<string>`,
 * `ICache<MenuVO>` are all fine; only `ICache<undefined>` / `ICache<void>`
 * would fail to compile.
 */
export interface ICache<T extends {} | null> {
    /**
     * Get the cached value or `undefined` if the key is absent / expired.
     *
     * Reserved sentinel: `undefined` ⇒ "not in cache." Do not store
     * `undefined` as a value — a miss and a cached-`undefined` would be
     * indistinguishable. If a legitimate domain value may be absent, wrap
     * in `null` (or use a `{ value: T } | null` shape at the caller).
     */
    get(key: string): T | undefined;
    set(key: string, value: T): void;
    invalidate(key: string): void;
    /** Get from cache or compute via factory, cache the result, and return it. */
    getOrSet(key: string, factory: () => Promise<T>): Promise<T>;
}
