/**
 * Client-side `IMetrics` implementation. Wraps an `IMetricSink` and adds
 * the `time()` / `start()` ergonomic helpers on top of `record()`.
 *
 * No ALS on the client — metric props flow in directly from callers. If
 * we ever want cross-component enrichment (e.g., route, session id), we
 * can add a decorator class; today the flat pass-through is enough.
 *
 * Construction-only DI. Tests use `vi.mock` to swap the sink.
 *
 * Design doc: DOCS/observability-and-error-handling.md
 */

import type { IMetrics, MetricProps, Timer } from "@/shared/lib/telemetry/IMetrics";
import type { IMetricSink } from "@/shared/lib/telemetry/IMetricSink";

export class Metrics implements IMetrics {
    private readonly sink: IMetricSink;

    constructor(sink: IMetricSink) {
        this.sink = sink;
    }

    record(event: string, props?: MetricProps): void {
        this.safeRecord(event, props ?? {});
    }

    async time<T>(event: string, fn: () => Promise<T>, props?: MetricProps): Promise<T> {
        const startedAt = Date.now();
        try {
            return await fn();
        } finally {
            this.safeRecord(event, { ...props, duration_ms: Date.now() - startedAt });
        }
    }

    start(event: string, props?: MetricProps): Timer {
        const startedAt = Date.now();
        let ended = false;
        const record = (extra: MetricProps) => this.safeRecord(event, extra);
        return {
            end(extraProps) {
                if (ended) return;
                ended = true;
                record({ ...props, ...extraProps, duration_ms: Date.now() - startedAt });
            },
        };
    }

    private safeRecord(event: string, props: MetricProps): void {
        try {
            this.sink.record(event, props);
        } catch {
            /* sink failures must never propagate */
        }
    }
}
