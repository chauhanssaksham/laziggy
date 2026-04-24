/**
 * PostHog server Metric sink — aggregatable events → PostHog Insights.
 *
 * The matching exception-capture path now lives as a full `ILogger` impl
 * in `./PostHogExceptionCaptureLogger.server.ts`, wired through the logger
 * facade's `CompositeLogger` — this file is metrics-only.
 *
 * **Identity comes from ALS, not from `props`.** `anonymousId` — our
 * vendor-neutral device id, which maps to PostHog's `distinct_id` — is read
 * directly via `getContextAttrs()` at emit time. The upstream `Metrics`
 * facade also merges ALS fields into `props` for visibility in other sinks
 * (e.g., `ConsoleMetricSink` dev output), but this sink does NOT trust
 * `props` for identity — a caller can't (even accidentally) attribute an
 * event to a different device by passing `{ anonymousId: "foo" }`. Same
 * `getContextAttrs` contract guarantees ALS wins, see request-context.server.
 *
 * ⚠ Known regression: per-request admin-skip is not yet implemented.
 * Without a `Request` on the call path, we cannot call `isAdminRequest()`.
 * Admin users in prod will appear in PostHog until `isAdmin` is stashed in
 * the ALS context. Tracked in DOCS/observability-and-error-handling.md.
 */

import type { IMetricSink, MetricProps } from "@/shared/lib/telemetry/IMetricSink";
import { getPostHog } from "./posthog.server";
import { fireAndForget } from "@/server/lib/fire-and-forget.server";
import { getContextAttrs } from "@/server/lib/context/request-context.server";

export class PostHogMetricSink implements IMetricSink {
    record(event: string, props?: MetricProps): void {
        const ph = getPostHog();
        if (!ph) return;
        const distinctId = (getContextAttrs().anonymousId as string | undefined) ?? "anonymous-server";
        ph.capture({ event, distinctId, properties: props });
        fireAndForget(ph.flush());
    }
}
