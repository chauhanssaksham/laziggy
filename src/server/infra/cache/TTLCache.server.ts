import type { ICache } from "./ICache.server";

// ── TTL presets (milliseconds) ────────────────────────────────────────────────
// Named durations for constructing caches. Prefer these over literal numbers
// at call sites so intent is obvious: `new TTLCache(ONE_HOUR)` vs `new TTLCache(3600000)`.

export const ONE_SECOND = 1000;
export const ONE_MINUTE = 60 * ONE_SECOND;
export const FIVE_MINUTES = 5 * ONE_MINUTE;
export const THIRTY_MINUTES = 30 * ONE_MINUTE;
export const ONE_HOUR = 60 * ONE_MINUTE;
export const THREE_HOURS = 3 * ONE_HOUR;
export const SIX_HOURS = 6 * ONE_HOUR;
export const TWELVE_HOURS = 12 * ONE_HOUR;
export const ONE_DAY = 24 * ONE_HOUR;
export const SEVEN_DAYS = 7 * ONE_DAY;
export const FOURTEEN_DAYS = 14 * ONE_DAY;
export const THIRTY_ONE_DAYS = 31 * ONE_DAY;
export const SIX_MONTHS = 182 * ONE_DAY;   // ~half a year
export const ONE_YEAR = 365 * ONE_DAY;

/**
 * In-memory TTL cache with single-flight semantics.
 *
 * - Entries expire after the configured duration.
 * - `getOrSet` dedupes concurrent in-flight computations for the same key, so
 *   a stampede of simultaneous cache misses triggers the factory exactly once.
 * - Module-level instances persist across warm serverless invocations.
 */
export class TTLCache<T extends {} | null> implements ICache<T> {
    private store = new Map<string, { value: T; expiresAt: number }>();
    private inFlight = new Map<string, Promise<T>>();

    constructor(private ttlMs: number) {}

    get(key: string): T | undefined {
        const entry = this.store.get(key);
        if (!entry) return undefined;
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return undefined;
        }
        return entry.value;
    }

    set(key: string, value: T): void {
        this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
    }

    invalidate(key: string): void {
        this.store.delete(key);
    }

    async getOrSet(key: string, factory: () => Promise<T>): Promise<T> {
        const cached = this.get(key);
        if (cached !== undefined) return cached;

        // Single-flight: if a computation for this key is already running,
        // await that promise instead of starting a new one. Prevents cache
        // stampedes when many callers hit the same cold key simultaneously.
        const existing = this.inFlight.get(key);
        if (existing) return existing;

        const promise = factory()
            .then((value) => {
                this.set(key, value);
                return value;
            })
            .finally(() => {
                // Always clear the in-flight slot — whether the factory
                // resolved or rejected. On rejection, leaving it here would
                // poison the key for all subsequent callers.
                this.inFlight.delete(key);
            });

        this.inFlight.set(key, promise);
        return promise;
    }
}
