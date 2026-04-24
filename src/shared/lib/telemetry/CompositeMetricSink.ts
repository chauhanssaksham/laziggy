/**
 * Composite metric sink — fans out `record()` to multiple `IMetricSink`
 * instances in order. A failure in one sink does NOT prevent the others
 * from running; each call is wrapped in an individual try/catch.
 *
 * Typical dev-mode usage:
 *   new CompositeMetricSink([new ConsoleMetricSink(), new PostHogMetricSink()])
 *
 * Design doc: DOCS/observability-and-error-handling.md
 */

import type { IMetricSink, MetricProps } from "./IMetricSink";

export class CompositeMetricSink implements IMetricSink {
    private readonly sinks: IMetricSink[];

    constructor(sinks: IMetricSink[]) {
        this.sinks = sinks;
    }

    record(event: string, props?: MetricProps): void {
        for (const sink of this.sinks) {
            try {
                sink.record(event, props);
            } catch {
                /* one sink failure must not prevent others from running */
            }
        }
    }
}
