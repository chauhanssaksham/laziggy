/**
 * Client-side Logger facade.
 *
 * App code imports `logger` and gets a vendor-neutral `ILogger`. The backend
 * is a `CompositeLogger` fanning out to:
 *
 *   - `ConsoleLogger`: DevTools output on every level.
 *   - `PostHogExceptionCaptureLogger`: routes only `error()` to PostHog's
 *     `captureException` API; debug/info/warn are no-ops.
 *
 * One call per error site (`logger.error(...)`) gets both effects. To swap
 * backends or add another destination (Sentry, etc.), implement `ILogger`
 * and slot it into the composite list here — no caller changes needed.
 *
 * Metrics are a separate concern — see `./metrics.client.ts`.
 *
 * Design doc: DOCS/observability-and-error-handling.md
 */

import type { ILogger } from "@/shared/lib/telemetry/ILogger";
import { CompositeLogger } from "@/shared/lib/telemetry/CompositeLogger";
import { ConsoleLogger } from "./ConsoleLogger.client";
import { PostHogExceptionCaptureLogger } from "./posthog/PostHogExceptionCaptureLogger.client";

/** The app-wide client Logger. Always use this; never import the individual impls directly. */
export const logger: ILogger = new CompositeLogger([
    new ConsoleLogger(),
    new PostHogExceptionCaptureLogger(),
]);
