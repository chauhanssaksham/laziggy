import type { IConfigProvider } from "./IConfigProvider.server";
import type { IPropertySource } from "../sources/IPropertySource.server";
import type { ICache } from "@/server/infra/cache/ICache.server";
import { TTLCache, FIVE_MINUTES } from "@/server/infra/cache/TTLCache.server";
import { serverConfigSchema, type ServerConfig } from "../config-schema.server";
import type { ClientConfig } from "@/shared/config/client-config";
import { unflatten, deepFreeze } from "@/shared/lib/object-helpers";
import { parseJsonValues } from "../config-helpers.server";

/**
 * Module-level singleton that provides sync access to resolved config.
 *
 * ## One TTL, one mechanism
 *
 * The injected `ICache` is the single refresh authority. Its TTL controls
 * how often config re-resolves from sources. When `cache.get()` returns
 * undefined (TTL expired), the next `getConfig()` triggers a background
 * `resolve()` which goes through `cache.getOrSet()` → factory runs →
 * fresh value cached. No separate `_resolvedAt` or refresh interval.
 *
 * ## Data flow
 *
 * `_config` is the in-memory source of truth for sync reads. Always
 * populated after `init()`. `getConfig()` returns `_config` immediately.
 * Background refreshes update `_config` when the resolve settles.
 *
 * ## Cache as cross-instance sharing
 *
 * With TTLCache (default): per-instance, same as a plain field.
 * With RedisCache (future): cross-instance. A new cold start checks
 * Redis via `cache.getOrSet` → hit from another instance's recent
 * resolve → skip source resolution entirely.
 *
 * ## Stale-while-revalidate
 *
 * On TTL expiry, the current caller gets the stale `_config` immediately.
 * The background resolve updates `_config` for the next caller.
 * Single-flight guard prevents stampedes.
 */
export class ConfigProvider implements IConfigProvider {
    private _config: ServerConfig | null = null;
    private _refreshing = false;
    private readonly cache: ICache<ServerConfig>;
    private static readonly CACHE_KEY = "config";

    constructor(
        private readonly sources: readonly IPropertySource[],
        cache?: ICache<ServerConfig>,
    ) {
        this.cache = cache ?? new TTLCache<ServerConfig>(FIVE_MINUTES);
    }

    async init(): Promise<void> {
        const start = Date.now();
        console.log("[Config] Initializing...");
        this._config = await this.resolve();
        console.log(`[Config] Initialized in ${Date.now() - start}ms`);
    }

    getConfig(): ServerConfig {
        if (!this._config) {
            throw new Error(
                "ConfigProvider not initialized. Did you forget `await configProvider.init()` in index.server.ts?",
            );
        }

        // Cache expired → trigger background refresh
        if (!this._refreshing && !this.cache.get(ConfigProvider.CACHE_KEY)) {
            this._refreshing = true;
            const refreshStart = Date.now();
            console.log("[Config] Cache expired, starting refresh...");
            this.resolve()
                .then((fresh) => {
                    this._config = fresh;
                    console.log(`[Config] Refreshed in ${Date.now() - refreshStart}ms`);
                })
                .catch((err) => {
                    console.error("[Config] Refresh failed, keeping last-known-good:", err);
                })
                .finally(() => {
                    this._refreshing = false;
                });
        }

        return this._config;
    }

    getClientConfig(): ClientConfig {
        return this.getConfig().client;
    }

    /**
     * Resolve config through cache. Cache hit → return cached. Cache miss →
     * resolve from sources, cache the result, return it. Deep-frozen to
     * prevent accidental mutation of shared state.
     */
    private async resolve(): Promise<ServerConfig> {
        const config = await this.cache.getOrSet(
            ConfigProvider.CACHE_KEY,
            () => this.resolveFromSources(),
        );
        return deepFreeze(config) as ServerConfig;
    }

    /** Merge all sources, parse JSON values, unflatten, validate via Zod,
     *  then apply the server→client property projection so `config.client`
     *  is the single source of truth (no derivation at read time). */
    private async resolveFromSources(): Promise<ServerConfig> {
        const merged: Record<string, unknown> = {};
        for (const source of this.sources) {
            const entries = await source.load();
            Object.assign(merged, entries);
        }
        parseJsonValues(merged);
        const nested = unflatten(merged);
        const config = serverConfigSchema.parse(nested);
        return {
            ...config,
            client: { ...config.client, ...this.mapServerToClientProperties(config) },
        };
    }

    /**
     * Properties that live in the server config but must also reach the
     * browser. Returns the subset to merge into `config.client` during
     * resolve, so downstream reads of `config.client` always see the
     * derived values (no read-time logic in `getClientConfig()`).
     *
     * Add an entry here for any new "server-derived client value":
     *   - `env`: mirrors `vercel.env` so PostHog super-properties carry
     *     the correct deployment environment for dashboard filtering.
     *
     * Note: the spread in `resolveFromSources` is shallow — if we ever
     * need to derive a nested client field (e.g. `client.posthog.env`),
     * either flatten the nested structure or switch to a deep-merge.
     */
    private mapServerToClientProperties(config: ServerConfig): Partial<ClientConfig> {
        return {
            env: config.vercel.env,
        };
    }
}
