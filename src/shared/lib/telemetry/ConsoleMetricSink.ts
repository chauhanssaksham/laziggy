/**
 * Console metric sink — logs every `record()` call to `console.debug`.
 *
 * Self-gating on env: only logs when `VITE_VERCEL_ENV === "development"`.
 * Preview + production get a silent no-op, so facades compose
 * `[Console, PostHog]` unconditionally with no env-branching.
 *
 * Works on both client and server: Vite's `define` block in vite.config.ts
 * replaces `import.meta.env.VITE_VERCEL_ENV` at build time for both client
 * and SSR bundles, so this single file is safe in either runtime.
 *
 * Design doc: DOCS/observability-and-error-handling.md
 */

import type { IMetricSink, MetricProps } from "./IMetricSink";

const ENABLED = import.meta.env.VITE_VERCEL_ENV === "development";

export class ConsoleMetricSink implements IMetricSink {
    record(event: string, props?: MetricProps): void {
        if (!ENABLED) return;
        console.debug("[metric]", event, props);
    }
}
