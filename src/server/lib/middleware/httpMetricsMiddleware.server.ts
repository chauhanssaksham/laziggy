/**
 * `httpMetricsMiddleware` — emits one `http.server.request` metric per HTTP
 * request with `duration_ms`, `http.request.method`, and
 * `http.response.status_code`. `http.route` is auto-added by the `Metrics`
 * facade's ALS enrichment (via `requestContextMiddleware`), so queries can
 * group by route for free.
 *
 * ## RED pattern
 *
 * Rate, Errors, Duration — the three numbers every HTTP service needs. With
 * this one event, PostHog Insights supports:
 *
 *   - Rate: event count over time, group by `http.route`.
 *   - Duration: histogram of `duration_ms`, p50/p95/p99 per route.
 *   - Errors: filter `http.response.status_code >= 500`, same group-by.
 *
 * Adding a new route → free instrumentation. No per-handler hooks needed.
 *
 * ## Wire order
 *
 * Must run after `requestContextMiddleware` so ALS is populated when the
 * metric is recorded. Put it second in `root.tsx`'s middleware array.
 *
 * ## Why try/finally
 *
 * RR7 guarantees `next()` resolves with a `Response` (even for thrown
 * loaders/actions — see reactrouter.com/how-to/middleware §"next() and
 * Error Handling"), so the `try` path is the common one. The `finally`
 * ensures we still emit when a *middleware-layer* throw escapes past
 * `next()` — rare, but the cost is zero and we lose the metric otherwise.
 *
 * Design doc: DOCS/observability-and-error-handling.md
 */

import type { MiddlewareFunction } from "react-router";
import { metrics } from "../telemetry/metrics.server";

export const httpMetricsMiddleware: MiddlewareFunction<Response> =
    async ({ request }, next) => {
        const timer = metrics.start("http.server.request", {
            "http.request.method": request.method,
        });
        let status = 500;
        try {
            const response = await next();
            status = response.status;
            return response;
        } finally {
            timer.end({ "http.response.status_code": status });
        }
    };
