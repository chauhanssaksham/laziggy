/**
 * Pluggable metric sink — where `metrics.record(...)` calls end up.
 *
 * Implemented today by the PostHog adapters (`posthog-sinks.server.ts` /
 * `posthog-metrics-sink.client.ts`) which emit events via
 * `posthog.capture(...)`. PostHog Insights then aggregate these events into
 * metric-style dashboards (avg, p95, counts, trends).
 *
 * If we outgrow event-based metrics (see Scaling Considerations in
 * DOCS/observability-and-error-handling.md), swap this adapter for a
 * Prometheus / OTel exporter — call sites don't change.
 */

import type { MetricProps } from "./IMetrics";

export type { MetricProps };

export interface IMetricSink {
    record(event: string, props?: MetricProps): void;
}

export const noopMetricSink: IMetricSink = {
    record() {
        /* noop */
    },
};
