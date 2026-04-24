/**
 * Vendor-free Metrics interface — separate from Logger because metrics are
 * a different concern (numeric aggregates on a dashboard, not narrative logs).
 *
 * Pino (the Logger backend) doesn't know or care about metrics. The two
 * subsystems stay on separate paths so we can swap either independently —
 * e.g., move Metrics to Prometheus while logs stay on stdout.
 *
 * Three ways to emit measurements, pick the one that fits the flow:
 *   - `record(event, props)`              — discrete measurement; no timing
 *   - `time(event, fn, props)`            — wrap an async block; auto `duration_ms`
 *   - `start(event, props)`               — imperative timer; returns `Timer`
 *
 * Design doc: DOCS/observability-and-error-handling.md
 */

export type MetricProps = Record<string, unknown>;

export interface Timer {
    /**
     * Stop the timer and emit the event with `duration_ms` (ms elapsed since
     * `start` was called). `extraProps` merges over the props captured at
     * `start()` time — useful for tagging success/failure after the fact.
     * Idempotent: calling `end()` a second time is a noop.
     */
    end(extraProps?: MetricProps): void;
}

export interface IMetrics {
    /** Emit a metric event. Props can include numeric or string dimensions. */
    record(event: string, props?: MetricProps): void;

    /**
     * Time an async block. Emits `event` with `duration_ms` regardless of
     * whether `fn` resolves or rejects; re-throws the rejection so callers
     * see the original error.
     *
     * Best for one-liners:
     *   `const menu = await metrics.time("menu_fetch", () => service.get(id))`
     *
     * For complex control flow (try/catch, conditional tagging), prefer
     * `start()` / `Timer.end()` instead — avoids the extra `async () => {…}`
     * scaffolding.
     */
    time<T>(event: string, fn: () => Promise<T>, props?: MetricProps): Promise<T>;

    /**
     * Start an imperative timer. Caller must call `.end()` on the returned
     * handle to emit the event. Use when the work spans try/catch, when
     * extra props are known only at end-time, or when the function-wrapper
     * style would force extra indirection.
     *
     *   const t = metrics.start("menu_fetch", { menuId })
     *   try { …; t.end({ cacheHit: false }) }
     *   catch (e) { t.end({ error: true }); throw e }
     */
    start(event: string, props?: MetricProps): Timer;
}
