/**
 * Client-side `traceparent` injection — correlation infra only.
 *
 * Patches `window.fetch` so every same-origin request carries a W3C
 * `traceparent` header:
 *
 *   traceparent: 00-<trace-id:32hex>-<span-id:16hex>-<flags:2hex>
 *
 * The server reads the header in `HttpRequestContextProvider.extractOrMintRequestId`
 * and uses the span-id as the request's `requestId`. Client-initiated fetches
 * then correlate cleanly to server Pino logs + PostHog events.
 *
 * ## Scope
 *
 * This file is ONLY responsible for header injection. Per-fetch timing
 * metrics (`http.client.request`) live in `./http-client-metrics.client.ts`
 * — a separate wrapper installed on top of this one, so the two concerns
 * stay uncoupled. Either can be swapped or removed without touching the
 * other.
 *
 * ## Caller-supplied traceparent
 *
 * If the caller has already set a `traceparent`, we validate the shape
 * (W3C strict regex) and preserve it. Malformed caller values are
 * overwritten with a fresh mint — silently forwarding garbage would
 * desync from the server's extractor, which rejects and mints its own.
 *
 * `generateTraceparent()` / `extractSpanId()` are exported for callers
 * that want to pre-mint (for correlating a client event with the server
 * completion via a shared `requestId`, for example).
 *
 * ## Same-origin only
 *
 * Cross-origin fetches go untouched — no trace-id leak to third parties,
 * no instrumentation of PostHog's own ingest fetch.
 *
 * ## Idempotent
 *
 * Safe to call twice (e.g., HMR reruns `entry.client.tsx`).
 */

// W3C Trace Context §3.2.2 — canonical format. Case-insensitive on hex.
const TRACEPARENT_RE = /^00-[0-9a-f]{32}-[0-9a-f]{16}-[0-9a-f]{2}$/i;

let installed = false;

export function installTraceHeaders(): void {
    if (installed) return;
    installed = true;

    const originalFetch = window.fetch.bind(window);

    window.fetch = (input, init) => {
        const url =
            typeof input === "string"
                ? input
                : input instanceof Request
                    ? input.url
                    : input.toString();

        if (!isSameOrigin(url)) {
            return originalFetch(input, init);
        }

        const existingHeaders =
            input instanceof Request ? input.headers : init?.headers;
        const headers = new Headers(existingHeaders ?? {});

        // Validate caller-supplied traceparent — if missing or malformed,
        // mint fresh. Silently using a bad caller value would desync from
        // the server's requestId (its extractor rejects and mints its own).
        const supplied = headers.get("traceparent");
        const traceparent =
            supplied && TRACEPARENT_RE.test(supplied)
                ? supplied
                : generateTraceparent();
        if (traceparent !== supplied) {
            headers.set("traceparent", traceparent);
        }

        if (input instanceof Request) {
            return originalFetch(new Request(input, { headers }), init);
        }
        return originalFetch(input, { ...init, headers });
    };
}

function isSameOrigin(url: string): boolean {
    return url.startsWith("/") || url.startsWith(window.location.origin);
}

/** Mint a fresh W3C `traceparent` — `00-<32hex trace-id>-<16hex span-id>-01`. */
export function generateTraceparent(): string {
    return `00-${randomHex(16)}-${randomHex(8)}-01`;
}

/** Pull the span-id (16hex) out of a `traceparent` string. Assumes valid shape. */
export function extractSpanId(traceparent: string): string {
    return traceparent.split("-")[2] ?? "";
}

function randomHex(bytes: number): string {
    const arr = new Uint8Array(bytes);
    crypto.getRandomValues(arr);
    return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}
