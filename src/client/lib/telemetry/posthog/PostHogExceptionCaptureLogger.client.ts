/**
 * An `ILogger` impl whose only job is to route `error()` calls to PostHog's
 * `captureException` API — i.e., fingerprinted errors land in PostHog's
 * Error Tracking dashboard alongside autocaptured browser errors.
 *
 * `debug` / `info` / `warn` are intentionally no-op: structured logging for
 * non-error levels lives in `ConsoleLogger`, and the facade composes both via
 * `CompositeLogger`. This class stays narrow so PostHog billing only absorbs
 * noteworthy failures, not every info line.
 *
 * No ALS on the browser — we pass `ctx` straight through. Correlation with
 * server logs works via the `traceparent`-derived `requestId` that either
 * the server-side logger attached to its own capture or the caller included
 * in `ctx`.
 *
 * Design doc: DOCS/observability-and-error-handling.md
 */

import posthog from "posthog-js";
import type { ILogger, LogContext } from "@/shared/lib/telemetry/ILogger";

export class PostHogExceptionCaptureLogger implements ILogger {
    debug(): void { /* intentionally noop — see class JSDoc */ }
    info(): void { /* intentionally noop — see class JSDoc */ }
    warn(): void { /* intentionally noop — see class JSDoc */ }

    error(msg: string, err?: unknown, ctx?: LogContext): void {
        if (typeof window === "undefined") return;

        // Non-Error values (e.g. rejected fetch responses) are wrapped with
        // `cause` so PostHog sees the structure. `String(err)` would collapse
        // to "[object Object]" for most non-Error inputs.
        const error =
            err instanceof Error
                ? err
                : err === undefined
                    ? new Error(msg)
                    : new Error(msg, { cause: err });

        try {
            posthog.captureException(error, ctx);
        } catch (sinkErr) {
            console.error("[PostHog Client] captureException failed:", sinkErr);
        }
    }
}
