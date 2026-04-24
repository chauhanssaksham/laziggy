/**
 * `ICache<T>` decorator that emits a `cache.access` metric for every read.
 *
 * Wraps any `ICache<T>` implementation (TTLCache today; Redis / etc. later)
 * and adds observability as a cross-cutting concern — Spring-style onion:
 *
 *   InstrumentedCache<T>   ← adds metrics
 *     └── TTLCache<T>      ← in-memory store + single-flight
 *
 * ## Metric shape
 *
 *   metrics.record("cache.access", {
 *       cache: <name>,       // "menu.vo" | "menu.ai" | "menu.active_id" | …
 *       hit: boolean,
 *       errored?: true,      // only set on the error path
 *   })
 *
 * ALS enrichment adds `requestId`, `anonymousId`, `http.route`, `env`, plus
 * domain attrs pushed by loaders (`restaurantId`, `menuId`, `demoId`, …) for
 * free — dashboards can slice hit-rate by route / restaurant without any
 * per-caller work.
 *
 * ## Instrumented methods + throw semantics
 *
 * Both `get()` and `getOrSet()` emit. JavaScript method dispatch binds `this`
 * to the actual instance at call time, so when `InstrumentedCache.getOrSet`
 * delegates to `inner.getOrSet`, the inner cache's own `this.get(key)`
 * internal peek runs on the inner — it does NOT go back through this
 * decorator. No double-emit per caller-facing call.
 *
 * Error handling:
 *   - `get()` rethrows on inner failure. Caller can't recover without a
 *     factory, so emit `cache.access { hit: false, errored: true }` and
 *     propagate.
 *   - `getOrSet()` swallows a peek failure as a miss, logs `errored: true`,
 *     and falls through to `inner.getOrSet`. Matches Guava's LoadingCache
 *     "degrade gracefully on read error" contract — a flaky distributed
 *     cache should not block authoritative source access.
 *
 * Construction goes through `cacheFactory.create(name)` — the factory
 * centralises the decorator chain so adding a new layer (TracedCache,
 * RedisCache, …) requires one-file changes, not edits at every cache
 * instantiation site.
 *
 * Design doc: DOCS/observability-and-error-handling.md
 */

import type { ICache } from "./ICache.server";
import type { IMetrics } from "@/shared/lib/telemetry/IMetrics";

export class InstrumentedCache<T extends {} | null> implements ICache<T> {
    constructor(
        private readonly inner: ICache<T>,
        private readonly name: string,
        private readonly metrics: IMetrics,
    ) {}

    get(key: string): T | undefined {
        try {
            const value = this.inner.get(key);
            this.metrics.record("cache.access", {
                cache: this.name,
                hit: value !== undefined,
                errored: false,
            });
            return value;
        } catch (err) {
            this.metrics.record("cache.access", {
                cache: this.name,
                hit: false,
                errored: true,
            });
            throw err;
        }
    }

    set(key: string, value: T): void {
        this.inner.set(key, value);
    }

    invalidate(key: string): void {
        this.inner.invalidate(key);
    }

    async getOrSet(key: string, factory: () => Promise<T>): Promise<T> {
        try {
            const cached = this.inner.get(key);
            this.metrics.record("cache.access", {
                cache: this.name,
                hit: cached !== undefined,
                errored: false
            });
            if (cached !== undefined) return cached;
        } catch {
            // Peek failed — record and degrade gracefully. Inner.getOrSet
            // may still succeed (its own read path could differ), but
            // otherwise the factory is our fallback.
            this.metrics.record("cache.access", {
                cache: this.name,
                hit: false,
                errored: true,
            });
        }
        return this.inner.getOrSet(key, factory);
    }
}
