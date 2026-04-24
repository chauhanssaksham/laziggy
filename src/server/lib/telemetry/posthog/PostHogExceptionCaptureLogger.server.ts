/**
 * An `ILogger` impl whose only job is to route `error()` calls to PostHog's
 * `captureException` API — i.e., fingerprinted errors land in PostHog's
 * Error Tracking dashboard with ALS-enriched attributes.
 *
 * `debug` / `info` / `warn` are intentionally no-op: structured logging for
 * non-error levels lives in `PinoLogger`, and the facade composes both via
 * `CompositeLogger`. This class stays narrow so PostHog billing only absorbs
 * noteworthy failures, not every info line.
 *
 * Placement mirrors the PostHog Metric sink: this is one of the few files
 * allowed to import from `posthog-node`. Swap or replace to migrate off
 * PostHog for error tracking without touching app code.
 *
 * ## Vercel serverless flush
 *
 * `posthog-node` queues events and flushes via fetch. On Vercel the handler
 * returns before that fetch resolves; the Lambda is terminated and the event
 * never lands. `fireAndForget(ph.flush())` wraps the flush in Vercel's
 * `waitUntil` so the function stays alive until delivery completes. Locally
 * it's a no-op.
 *
 * Design doc: DOCS/observability-and-error-handling.md
 */

import type { ILogger, LogContext } from "@/shared/lib/telemetry/ILogger";
import { getPostHog } from "./posthog.server";
import { fireAndForget } from "@/server/lib/fire-and-forget.server";
import { getContextAttrs } from "../../context/request-context.server";

export class PostHogExceptionCaptureLogger implements ILogger {
    debug(): void { /* intentionally noop — see class JSDoc */ }
    info(): void { /* intentionally noop — see class JSDoc */ }
    warn(): void { /* intentionally noop — see class JSDoc */ }

    error(msg: string, err?: unknown, ctx?: LogContext): void {
        const ph = getPostHog();
        if (!ph) return;

        // Normalise to Error so PostHog's fingerprinting works. For non-Error
        // values (e.g. Supabase's PostgrestError), preserve the original
        // object via `cause` rather than `String(err)` — stringifying loses
        // every useful field ("[object Object]") while `cause` lets PostHog
        // walk the chain and surface structure.
        const error =
            err instanceof Error
                ? err
                : err === undefined
                    ? new Error(msg)
                    : new Error(msg, { cause: err });

        // ALS-enriched attributes (requestId / anonymousId / http.route / env)
        // merge with any call-site ctx. Server-only — client impl skips this.
        const enriched = getContextAttrs(ctx);
        const distinctId =
            (enriched.anonymousId as string | undefined) ?? "anonymous-server";

        ph.captureException(error, distinctId, enriched);
        fireAndForget(ph.flush());
    }
}
