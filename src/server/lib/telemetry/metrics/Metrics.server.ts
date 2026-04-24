/**
 * Server Metrics implementation — wraps an `IMetricSink` with AsyncLocalStorage
 * context enrichment, plus the `time()` / `start()` ergonomic helpers on top
 * of the raw `record()` API.
 *
 * Construction-only DI: the sink is `readonly` and final for the instance's
 * lifetime. Tests that need a spy sink use `vi.mock` on the sink module,
 * matching Spring's `@MockBean` semantics (same pattern as `PinoLogger`).
 *
 * This class is the only file that knows about ALS enrichment for metrics.
 * The IMetricSink itself is dumb — it just takes a flat props bag and emits.
 *
 * Design doc: DOCS/observability-and-error-handling.md
 */

import type { IMetrics, MetricProps, Timer } from "@/shared/lib/telemetry/IMetrics";
import type { IMetricSink } from "@/shared/lib/telemetry/IMetricSink";
import { getContextAttrs } from "../../context/request-context.server";

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
        // Capture `this` via arrow in the closure (Timer is returned, `this`
        // context would otherwise be lost at call time).
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
            this.sink.record(event, getContextAttrs(props));
        } catch {
            /* sink failures must never propagate */
        }
    }
}
