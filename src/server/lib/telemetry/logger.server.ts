/**
 * Server-side Logger facade.
 *
 * App code imports `logger` and gets a vendor-neutral `ILogger`. The backend
 * is a `CompositeLogger` fanning out to:
 *
 *   - `PinoLogger`: JSON log line to stdout on every level, with ALS
 *     enrichment via Pino's `mixin` hook.
 *   - `PostHogExceptionCaptureLogger`: routes only `error()` to PostHog's
 *     `captureException` API; debug/info/warn are no-ops.
 *
 * One call per error site (`logger.error(...)`) gets both effects. To swap
 * backends or add another destination (Sentry, Axiom), implement `ILogger`
 * and slot it into the composite list here — no caller changes needed.
 *
 * Metrics are a separate concern — see `./metrics.server.ts`.
 *
 * Design doc: DOCS/observability-and-error-handling.md
 */

import type { ILogger } from "@/shared/lib/telemetry/ILogger";
import { CompositeLogger } from "@/shared/lib/telemetry/CompositeLogger";
import { PinoLogger } from "./pino/PinoLogger.server";
import { PostHogExceptionCaptureLogger } from "./posthog/PostHogExceptionCaptureLogger.server";

/** The app-wide Logger. Always use this; never import the individual impls directly. */
export const logger: ILogger = new CompositeLogger([
    new PinoLogger(),
    new PostHogExceptionCaptureLogger(),
]);
