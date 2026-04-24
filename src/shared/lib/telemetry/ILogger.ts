/**
 * Vendor-free Logger interface shared by server + client implementations.
 *
 * App code imports `logger` from `@/server/lib/telemetry/logger.server` or
 * `@/client/lib/telemetry/logger.client`. Both implement this interface; the
 * implementation decides how lines are formatted and where errors are forwarded.
 *
 * Metrics are a separate concern — see `@/shared/lib/telemetry/IMetrics` and the
 * `metrics` export from the matching server/client module.
 *
 * Design doc: DOCS/observability-and-error-handling.md
 */

export type LogContext = Record<string, unknown>;

export interface ILogger {
    debug(msg: string, ctx?: LogContext): void;
    info(msg: string, ctx?: LogContext): void;
    /** Use for recoverable issues. Logged, NOT forwarded to the exception sink. */
    warn(msg: string, ctx?: LogContext): void;
    /** Use for errors worth seeing on a dashboard. Logged AND forwarded to the sink. */
    error(msg: string, err?: unknown, ctx?: LogContext): void;
}
