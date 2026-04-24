/**
 * Shared cache factory singleton.
 *
 * Every service that needs a named cache imports `cacheFactory` from here
 * rather than constructing its own. Keeps the decorator chain (Instrumented
 * → TTLCache today; Redis / Traced / … tomorrow) wired once, so swapping
 * layers is a one-file change.
 *
 * ## Why `TTLCache` isn't re-exported from this barrel
 *
 * Deliberate. Every new cache should go through `cacheFactory.create(name)`
 * so it participates in `cache.access` instrumentation. Leaving the raw
 * `TTLCache` export here would invite "just grab it directly" patterns that
 * silently skip observability. Anyone who really needs raw `TTLCache`
 * imports it directly from `./TTLCache.server` — that extra friction is
 * the point.
 *
 * ## Exception: `ConfigProvider`
 *
 * The one legitimate raw-`TTLCache` consumer is
 * `src/server/infra/config/provider/ConfigProvider.server.ts`. It can NOT
 * go through the factory without causing infinite recursion:
 *
 *   cache.get → metrics.record → PostHogMetricSink.record
 *             → getPostHog() → getConfig() → cache.get → …
 *
 * Plus `getConfig()` is hot-path (every log line, every request boundary),
 * so even without the loop the resulting `cache.access` event volume
 * would dominate the PostHog event quota. Config caches are a different
 * beast from domain caches; they legitimately stay un-instrumented.
 */

import { metrics } from "@/server/lib/telemetry/metrics.server";
import { CacheFactory } from "./CacheFactory.server";

export { CacheFactory } from "./CacheFactory.server";
export { InstrumentedCache } from "./InstrumentedCache.server";
export type { ICache } from "./ICache.server";

export const cacheFactory = new CacheFactory(metrics);
