/**
 * Client-side Metrics facade.
 *
 * App code imports `metrics` and gets a vendor-neutral `IMetrics`. The impl
 * (`Metrics` wrapping an `IMetricSink`) lives behind this facade.
 *
 * Always composes `[ConsoleMetricSink, PostHogMetricSink]`. The
 * ConsoleMetricSink self-gates on `VITE_VERCEL_ENV === "development"` so
 * preview + production builds silently skip it — no facade-level branching.
 *
 * Construction-only DI; tests use `vi.mock` to swap the sink.
 *
 * Design doc: DOCS/observability-and-error-handling.md
 */

import type { IMetrics } from "@/shared/lib/telemetry/IMetrics";
import { CompositeMetricSink } from "@/shared/lib/telemetry/CompositeMetricSink";
import { ConsoleMetricSink } from "@/shared/lib/telemetry/ConsoleMetricSink";
import { Metrics } from "./metrics/Metrics.client";
import { PostHogMetricSink } from "./posthog/posthog-sinks.client";

const metricSink = new CompositeMetricSink([
    new ConsoleMetricSink(),
    new PostHogMetricSink(),
]);

/** The app-wide client Metrics. Always use this; never import Metrics directly. */
export const metrics: IMetrics = new Metrics(metricSink);
