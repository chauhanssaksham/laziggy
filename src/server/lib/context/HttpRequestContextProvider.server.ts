/**
 * HTTP adapter for `RequestContextProvider`. Builds a `RequestContext` from
 * an incoming `Request` by parsing standard headers (W3C traceparent) and
 * browser cookies.
 *
 * This class is HTTP-ONLY. For other transports, subclass
 * `BaseRequestContextProvider<YourSource>` — don't extend this one.
 *
 * The individual `extract*` methods are instance members so tests can
 * exercise them in isolation (see
 * `src/tests/server/HttpRequestContextProvider.test.ts`).
 *
 * A module-level singleton `httpRequestContextProvider` is exported for the
 * API middleware to use directly. Stateless — the same instance can serve
 * every request.
 *
 * ⚠ sessionId is NOT extracted here — see "Deferred: session cookie
 * unification" in DOCS/observability-and-error-handling.md. Loaders push
 * sessionId into the context via `addToContext` once they've verified
 * the cookie against the current route's restaurantId.
 */

import { randomUUID } from "node:crypto";
import { BaseRequestContextProvider } from "./RequestContextProvider.server";
import type { RequestContext } from "./request-context.server";
import { extractPostHogDistinctId } from "../telemetry/posthog/posthog.server";
import { getConfig } from "@/server/infra/config/index.server";

// W3C Trace Context §3.2.2.2 — receivers MUST be case-insensitive on hex.
const SPAN_ID_RE = /^[a-fA-F0-9]{16}$/;
const TRACE_ID_RE = /^[a-fA-F0-9]{32}$/;
const HEX_BYTE_RE = /^[a-fA-F0-9]{2}$/;

export class HttpRequestContextProvider extends BaseRequestContextProvider<Request> {
    create(request: Request): RequestContext {
        return {
            requestId: this.extractOrMintRequestId(request),
            anonymousId: this.extractAnonymousId(request),
            route: this.safePath(request),
            env: getConfig().vercel.env,
        };
    }

    /**
     * Extract a request ID from the W3C `traceparent` header, or mint one.
     * Format: `<version:2hex>-<trace-id:32hex>-<span-id:16hex>-<flags:2hex>`.
     * We use the span-id so each hop is distinct; trace-id may repeat.
     */
    extractOrMintRequestId(request: Request): string {
        const traceparent = request.headers.get("traceparent");
        if (traceparent) {
            const parts = traceparent.split("-");
            if (
                parts.length === 4 &&
                parts[0] === "00" &&
                TRACE_ID_RE.test(parts[1]!) &&
                SPAN_ID_RE.test(parts[2]!) &&
                HEX_BYTE_RE.test(parts[3]!)
            ) {
                return parts[2]!.toLowerCase();
            }
        }
        return randomUUID();
    }

    /**
     * Extract the anonymous device ID.
     *
     * Source: PostHog's browser cookie. The JS SDK sets a JS-readable cookie
     * after `posthog.init(...)`; the browser attaches it to every same-origin
     * request automatically, so we can read it server-side without any
     * client-side header injection.
     *
     * The parsing lives in `posthog.server.ts::extractPostHogDistinctId` —
     * that function owns the PostHog cookie-shape coupling. If we ever swap
     * vendors, change that one function; this caller is unaware.
     */
    extractAnonymousId(request: Request): string | undefined {
        return extractPostHogDistinctId(request);
    }

    /** Route path for the `http.route` log field. */
    safePath(request: Request): string | undefined {
        try {
            return new URL(request.url).pathname;
        } catch {
            return undefined;
        }
    }
}

/** Singleton — stateless, safe to reuse across requests. */
export const httpRequestContextProvider = new HttpRequestContextProvider();
