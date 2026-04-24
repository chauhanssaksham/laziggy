/**
 * PostHog client Metric sink — events → PostHog Insights.
 *
 * The matching exception-capture path now lives as a full `ILogger` impl
 * in `./PostHogExceptionCaptureLogger.client.ts`, wired through the logger
 * facade's `CompositeLogger` — this file is metrics-only.
 */

import posthog from "posthog-js";
import type { IMetricSink, MetricProps } from "@/shared/lib/telemetry/IMetricSink";

export class PostHogMetricSink implements IMetricSink {
    record(event: string, props?: MetricProps): void {
        if (typeof window === "undefined") return;
        try {
            posthog.capture(event, props);
        } catch (err) {
            console.error("[PostHog Client] capture failed:", err);
        }
    }
}
