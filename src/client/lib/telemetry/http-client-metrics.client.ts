/**
 * Per-fetch RUM metric — `http.client.request`.
 *
 * Wraps `window.fetch` to emit one metric event per same-origin fetch via
 * `metrics.start` / `Timer.end` — `duration_ms` is auto-computed by the
 * timer. Props: `http.request.method`, `http.response.status_code`,
 * `http.route`, `requestId` (span-id from whichever `traceparent` ends up
 * on the wire).
 *
 * ## Install order
 *
 * Install AFTER `installTraceHeaders`:
 *
 *   installHttpClientMetrics();  // inner wrapper — emits metric
 *   installTraceHeaders();       // outer wrapper — injects header first
 *
 * At call time, trace-headers runs first (adds the `traceparent` header),
 * then this wrapper runs (reads the now-populated header to derive
 * `requestId`), then the original fetch. Timer ends in `finally` so
 * network errors still emit with `status_code = 0`.
 *
 * ## Joining
 *
 * `http.client.request.requestId` ↔ `http.server.request.requestId` →
 * network + Vercel edge overhead for every request (client duration minus
 * server duration).
 *
 * ## Same-origin only + idempotent
 *
 * Cross-origin fetches pass through. Safe to call twice.
 */

import { metrics } from "./metrics.client";
import { extractSpanId } from "./trace-headers.client";

let installed = false;

export function installHttpClientMetrics(): void {
    if (installed) return;
    installed = true;

    const originalFetch = window.fetch.bind(window);

    window.fetch = async (input, init) => {
        const url =
            typeof input === "string"
                ? input
                : input instanceof Request
                    ? input.url
                    : input.toString();

        if (!isSameOrigin(url)) {
            return originalFetch(input, init);
        }

        const requestHeaders =
            input instanceof Request ? input.headers : init?.headers;
        const traceparent = new Headers(requestHeaders ?? {}).get("traceparent");
        const requestId = traceparent ? extractSpanId(traceparent) : "";

        const method =
            (input instanceof Request ? input.method : init?.method) ?? "GET";
        const pathname = urlPathname(url);

        const timer = metrics.start("http.client.request", {
            "http.request.method": method,
            "http.route": pathname,
            requestId,
        });
        let status = 0;

        try {
            const response = await originalFetch(input, init);
            status = response.status;
            return response;
        } finally {
            try {
                timer.end({ "http.response.status_code": status });
            } catch {
                /* metric emission must never break the fetch */
            }
        }
    };
}

function isSameOrigin(url: string): boolean {
    return url.startsWith("/") || url.startsWith(window.location.origin);
}

function urlPathname(url: string): string {
    try {
        return new URL(url, window.location.origin).pathname;
    } catch {
        return url;
    }
}
