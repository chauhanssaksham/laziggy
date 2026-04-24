/**
 * Server-side Metrics facade.
 *
 * App code imports `metrics` from here and gets a vendor-neutral `Metrics`
 * interface. The impl (`Metrics` wrapping a `PostHogMetricSink`) lives
 * behind this facade — swap the one constructor call to change either the
 * enrichment layer or the backend.
 *
 * Sink injection is construction-only; tests spy via `vi.mock` on the sink
 * module (same pattern as `logger.server.ts`).
 *
 * Design doc: DOCS/observability-and-error-handling.md
 */

import type { IMetrics } from "@/shared/lib/telemetry/IMetrics";
import { CompositeMetricSink } from "@/shared/lib/telemetry/CompositeMetricSink";
import { ConsoleMetricSink } from "@/shared/lib/telemetry/ConsoleMetricSink";
import { Metrics } from "./metrics/Metrics.server";
import { PostHogMetricSink } from "./posthog/posthog-sinks.server";

/**
 * Composed metric sink: Console + PostHog. ConsoleMetricSink self-gates on
 * `VERCEL_ENV === "development"` (no-op in preview/prod), so the facade
 * wires both unconditionally. Matches the client-side pattern.
 */
const metricSink = new CompositeMetricSink([
    new ConsoleMetricSink(),
    new PostHogMetricSink(),
]);

/** The app-wide Metrics. Always use this; never import the Metrics class directly. */
export const metrics: IMetrics = new Metrics(metricSink);
