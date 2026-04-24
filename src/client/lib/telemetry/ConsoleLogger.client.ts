/**
 * Console-backed `ILogger` implementation — browser devtools output only.
 *
 * Level → console method mapping so DevTools groups them correctly:
 *
 *   debug → console.debug    info  → console.log
 *   warn  → console.warn     error → console.error
 *
 * Routing errors to PostHog Error Tracking is a separate `ILogger` impl
 * (`PostHogExceptionCaptureLogger`); the client facade composes them via
 * `CompositeLogger`.
 *
 * Design doc: DOCS/observability-and-error-handling.md
 */

import type { ILogger, LogContext } from "@/shared/lib/telemetry/ILogger";

type Level = "debug" | "info" | "warn" | "error";

export class ConsoleLogger implements ILogger {
    debug(msg: string, ctx?: LogContext): void { this.emit("debug", msg, ctx); }
    info (msg: string, ctx?: LogContext): void { this.emit("info", msg, ctx); }
    warn (msg: string, ctx?: LogContext): void { this.emit("warn", msg, ctx); }
    error(msg: string, err?: unknown, ctx?: LogContext): void {
        this.emit("error", msg, ctx, err);
    }

    private emit(level: Level, msg: string, ctx?: LogContext, err?: unknown): void {
        const fn = consoleFor(level);
        const payload: Record<string, unknown> = ctx ? { ...ctx } : {};
        if (err !== undefined) payload.err = err;
        if (Object.keys(payload).length > 0) {
            fn(`[${level}]`, msg, payload);
        } else {
            fn(`[${level}]`, msg);
        }
    }
}

function consoleFor(level: Level): (...args: unknown[]) => void {
    switch (level) {
        case "debug": return console.debug.bind(console);
        case "info":  return console.log.bind(console);
        case "warn":  return console.warn.bind(console);
        case "error": return console.error.bind(console);
    }
}
