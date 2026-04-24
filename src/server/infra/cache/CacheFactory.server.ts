/**
 * Single place where the cache decorator chain is assembled.
 *
 * Today: `InstrumentedCache<T>` wrapping `TTLCache<T>`.
 * Future: slot a `TracedCache`, `RedisCache`, or similar layer here — every
 * consumer (MenuService, ConfigProvider, future services) picks it up
 * automatically, no call-site edits.
 *
 *   new InstrumentedCache(         ← adds cache.access metric
 *       new TTLCache(ttl),         ← in-memory store + single-flight
 *       name,
 *       metrics,
 *   )
 *
 * Matches the Spring pattern: one `CacheManager` configures the layering,
 * service code asks for a named cache and doesn't care about the layering.
 *
 * Design doc: DOCS/observability-and-error-handling.md
 */

import type { ICache } from "./ICache.server";
import type { IMetrics } from "@/shared/lib/telemetry/IMetrics";
import { TTLCache, FIVE_MINUTES } from "./TTLCache.server";
import { InstrumentedCache } from "./InstrumentedCache.server";

export class CacheFactory {
    constructor(private readonly metrics: IMetrics) {}

    /**
     * Build a named, instrumented, TTL-backed cache.
     *
     * @param name  identifier used as the `cache` property on `cache.access`
     *              events. Pick a stable, dotted-ish name (`"menu.vo"`,
     *              `"menu.ai"`, `"config"`) — it becomes a filter dimension
     *              in PostHog dashboards.
     * @param ttlMs time-to-live in milliseconds. Defaults to 5 minutes.
     */
    create<T extends {} | null>(name: string, ttlMs: number = FIVE_MINUTES): ICache<T> {
        return new InstrumentedCache<T>(
            new TTLCache<T>(ttlMs),
            name,
            this.metrics,
        );
    }
}
