/**
 * Composite logger — fans out every call to a list of child `ILogger`s in
 * order. One child throwing does NOT prevent the others from running; each
 * call is wrapped in an individual try/catch. Matches the pattern of
 * `CompositeMetricSink`.
 *
 * Typical usage:
 *   new CompositeLogger([new ConsoleLogger(), new PostHogExceptionCaptureLogger()])
 *
 * Because children implement the same `ILogger`, we can mix-and-match:
 *   - A "full" logger (Pino on server, Console on client) that handles every
 *     level — the structured-logging backbone.
 *   - An "error-only" logger (PostHogExceptionCaptureLogger) that no-ops on
 *     debug/info/warn and only reacts to `error()`.
 *
 * Design doc: DOCS/observability-and-error-handling.md
 */

import type { ILogger, LogContext } from "./ILogger";

export class CompositeLogger implements ILogger {
    private readonly children: readonly ILogger[];

    constructor(children: readonly ILogger[]) {
        this.children = children;
    }

    debug(msg: string, ctx?: LogContext): void {
        this.forEach((l) => l.debug(msg, ctx));
    }

    info(msg: string, ctx?: LogContext): void {
        this.forEach((l) => l.info(msg, ctx));
    }

    warn(msg: string, ctx?: LogContext): void {
        this.forEach((l) => l.warn(msg, ctx));
    }

    error(msg: string, err?: unknown, ctx?: LogContext): void {
        this.forEach((l) => l.error(msg, err, ctx));
    }

    private forEach(fn: (l: ILogger) => void): void {
        for (const child of this.children) {
            try {
                fn(child);
            } catch {
                /* one child failure must not prevent others from running */
            }
        }
    }
}
