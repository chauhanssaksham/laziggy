/**
 * Per-request context propagated via AsyncLocalStorage — Node's equivalent of
 * Spring's ThreadLocal. Any code running inside `runWithContext` can read the
 * context via `getContext()` without it being threaded through function
 * parameters. Works across `await` boundaries.
 *
 * This module is deliberately transport-agnostic. HTTP-specific building
 * (traceparent header, cookies, etc.) lives in
 * `./context/HttpRequestContextProvider.server.ts`. For a different transport
 * (queue worker, CLI) subclass `BaseRequestContextProvider<YourSource>`.
 *
 * Note: AsyncLocalStorage works on Vercel's Node runtime. It does NOT work on
 * Vercel's Edge runtime — if we move routes to Edge, the logger falls back to
 * context-less mode.
 *
 * Design doc: DOCS/observability-and-error-handling.md
 */

import { AsyncLocalStorage } from "node:async_hooks";

export interface RequestContext {
    /** Unique per HTTP request — extracted from traceparent header or minted. */
    requestId: string;
    /** Stable per-device identifier (maps to PostHog `distinct_id` at the sink). */
    anonymousId?: string;
    /** Route path for grouping in dashboards (OTel `http.route`). */
    route?: string;
    /** Deployment environment — "production" | "preview" | "development".
     *  Auto-enriched onto every log line and metric event so dashboards can
     *  filter by env without requiring manual prop threading. */
    env?: string;
    /**
     * Catch-all bag for domain/app-level attrs the middleware or handler wants
     * on every log line (sessionId, restaurantId, menuId, tableId, …). Keep
     * keys stable — they become log field names and Insights filter dimensions.
     *
     * Populated by callers that know the domain (loaders / actions), not by
     * the infra-layer provider. See "Deferred: session cookie unification"
     * in DOCS/observability-and-error-handling.md for why sessionId lives
     * here instead of on the transport-layer extractor.
     */
    extra?: Record<string, unknown>;
}

const als = new AsyncLocalStorage<RequestContext>();

/** Run `fn` with `ctx` as the current request context. */
export function runWithContext<T>(ctx: RequestContext, fn: () => Promise<T>): Promise<T> {
    return als.run(ctx, fn);
}

/** Get the current request context, or undefined if called outside `runWithContext`. */
export function getContext(): RequestContext | undefined {
    return als.getStore();
}

/**
 * Merge domain-specific attrs into the current ALS context's `extra` bag.
 * No-op if called outside `runWithContext`.
 *
 * Use from loaders / services to push attrs that should appear on every
 * downstream log line + metric event for the remaining lifetime of the
 * request — e.g. `sessionId` after cookie verification, `restaurantId` /
 * `menuId` once the route is resolved, `demoId` for the demo surface.
 *
 * ALS is authoritative: fields set here are merged by `getContextAttrs`
 * UNDER any additional caller `extra` on a per-call basis, so downstream
 * callers can't (accidentally) override them. See the ALS-wins contract
 * on `getContextAttrs`.
 */
export function addToContext(fields: Record<string, unknown>): void {
    const ctx = als.getStore();
    if (!ctx) return;
    ctx.extra = { ...ctx.extra, ...fields };
}

/**
 * Flat attribute map for logs / metric events. Reads the current ALS context
 * and maps field names to the output convention (`route` → `http.route`); the
 * `extra` bag is merged in UNDER the ALS fields.
 *
 * **ALS is authoritative for identity / request-shaped fields.** Caller-passed
 * `extra` fills in non-ALS slots (e.g., `model`, `cacheHit`) and CANNOT
 * override ALS values — a caller who accidentally passes
 * `{ anonymousId: "hacker" }` does not win against the real ALS-derived id.
 * This is the contract consumers (PostHog sinks, Pino mixin) rely on.
 *
 * Used by the Pino mixin, `Metrics.safeRecord`, and PostHog sinks — single
 * source of truth for the log-line / event shape.
 */
export function getContextAttrs(extra?: Record<string, unknown>): Record<string, unknown> {
    const ctx = als.getStore();
    const out: Record<string, unknown> = {};
    // Put caller-passed `extra` first so ALS fields overwrite on conflict.
    if (extra) Object.assign(out, extra);
    if (ctx) {
        const { route, env, extra: ctxExtra, ...rest } = ctx;
        Object.assign(out, rest);
        if (route) out["http.route"] = route;
        if (env) out["env"] = env;
        if (ctxExtra) Object.assign(out, ctxExtra);
    }
    return out;
}
