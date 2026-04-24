import { PostHog } from "posthog-node";
import { getConfig } from "@/server/infra/config/index.server";

/**
 * Lazy-constructed shared PostHog instance. Both sink classes in
 * `posthog-sinks.server.ts` call this to emit events; keeping a single
 * instance avoids multiple network connections from one Node process.
 *
 * Returns null if VITE_POSTHOG_KEY / VITE_POSTHOG_HOST are not set —
 * safe to call in local dev without env vars; callers skip silently.
 */

let posthogInstance: PostHog | null | undefined = undefined; // undefined = not yet resolved

// Vitest sets `VITEST=true` on every test worker. Hard-gate the PostHog
// client so intentional test throws never end up polluting the real Error
// Tracking dashboard. NODE_ENV is included as a belt-and-braces fallback
// for any runner that doesn't set VITEST.
const IS_TEST_RUNNER =
    process.env.VITEST === "true" || process.env.NODE_ENV === "test";

export function getPostHog(): PostHog | null {
    if (posthogInstance !== undefined) return posthogInstance;
    if (IS_TEST_RUNNER) {
        posthogInstance = null;
        return null;
    }
    const { posthog } = getConfig().client;
    if (!posthog.key || !posthog.host) {
        // Local/test env without PostHog credentials — emit nothing.
        posthogInstance = null;
        return null;
    }
    posthogInstance = new PostHog(posthog.key, {
        host: posthog.host,
        flushAt: 1,
        flushInterval: 0,
    });
    return posthogInstance;
}

/**
 * Extract PostHog's `distinct_id` from its browser cookie on the server.
 *
 * PostHog's JS SDK writes a JS-readable (not HttpOnly) cookie after
 * `posthog.init(...)`. Format: `ph_<project-token>_posthog=<URL-encoded JSON>`
 * where the JSON contains `{ distinct_id, session_id, ... }`. The cookie is
 * attached to every same-origin fetch automatically by the browser — no
 * client-side header injection needed.
 *
 * ⚠ This is the ONE function that knows PostHog's cookie shape on the server.
 * If PostHog changes the cookie name or payload structure (rare — stable for
 * years), or we migrate off PostHog entirely, this function is where the
 * bridge breaks. Keep the coupling localized here.
 *
 * Used by `HttpRequestContextProvider.extractAnonymousId()` to populate the
 * request context for log / metric enrichment.
 */
const POSTHOG_COOKIE_RE = /ph_[A-Za-z0-9_]+_posthog=([^;]+)/;

export function extractPostHogDistinctId(request: Request): string | undefined {
    const cookie = request.headers.get("cookie");
    if (!cookie) return undefined;
    const match = cookie.match(POSTHOG_COOKIE_RE);
    if (!match) return undefined;
    try {
        const payload = JSON.parse(decodeURIComponent(match[1]!)) as { distinct_id?: unknown };
        return typeof payload.distinct_id === "string" ? payload.distinct_id : undefined;
    } catch {
        return undefined;
    }
}
