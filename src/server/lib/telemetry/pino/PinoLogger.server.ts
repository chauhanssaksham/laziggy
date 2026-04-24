/**
 * Pino-backed `ILogger` implementation — structured JSON logs to stdout.
 *
 * Pino handles JSON formatting, error serialization (name + message + stack
 * + recursive `cause` chain), and level filtering. Every line is auto-enriched
 * with the current `AsyncLocalStorage` context (requestId, anonymousId,
 * http.route, env) via Pino's `mixin` hook.
 *
 * This class **only logs**. Routing errors to PostHog Error Tracking is a
 * separate `ILogger` impl (`PostHogExceptionCaptureLogger`); the server
 * facade composes them via `CompositeLogger`.
 *
 * This class is the only file that imports `pino`. `logger.server.ts`
 * exposes it behind `ILogger` so app code never sees Pino — swap this file
 * to change backends.
 *
 * Design doc: DOCS/observability-and-error-handling.md
 */

import pino, { type Logger as PinoInstance } from "pino";
import type { ILogger, LogContext } from "@/shared/lib/telemetry/ILogger";
import { getConfig } from "@/server/infra/config/index.server";
import { getContextAttrs } from "../../context/request-context.server";

export class PinoLogger implements ILogger {
    private readonly pino: PinoInstance;

    constructor() {
        // In dev, route Pino's output through `pino-pretty` so errors are red,
        // levels coloured, timestamps human-readable. In preview/prod we keep
        // raw JSON on stdout for log ingestion (Vercel, Axiom, etc.).
        const isDev = (process.env.VERCEL_ENV ?? "development") === "development";
        this.pino = pino({
            level: getConfig().log.level,
            // Drop pid + hostname; noise in serverless where every invocation
            // is a fresh process.
            base: undefined,
            timestamp: pino.stdTimeFunctions.isoTime,
            formatters: {
                // Emit "info" / "error" strings instead of Pino's numeric levels.
                level: (label) => ({ level: label }),
            },
            serializers: {
                // Handles name + message + stack + recursive cause chain.
                err: pino.stdSerializers.err,
            },
            // Auto-enrich every line with the ALS context attrs.
            mixin: () => getContextAttrs(),
            ...(isDev && {
                transport: {
                    target: "pino-pretty",
                    options: {
                        colorize: true,
                        translateTime: "SYS:HH:MM:ss.l",
                        ignore: "pid,hostname",
                        singleLine: false,
                    },
                },
            }),
        });
    }

    debug(msg: string, ctx?: LogContext): void {
        this.pino.debug(ctx ?? {}, msg);
    }

    info(msg: string, ctx?: LogContext): void {
        this.pino.info(ctx ?? {}, msg);
    }

    warn(msg: string, ctx?: LogContext): void {
        this.pino.warn(ctx ?? {}, msg);
    }

    /**
     * Logs the error. If `err` is omitted, a synthetic Error is built so the
     * stack serializer has something to walk. `Error.captureStackTrace(synth,
     * this.error)` strips the logger frames so the stack's top frame is the
     * caller of `logger.error`. Non-Error values (e.g. Supabase's
     * `PostgrestError` plain objects) are wrapped with `cause` so
     * `pino.stdSerializers.err` can walk the chain and render the underlying
     * fields — `String(err)` would collapse them to "[object Object]".
     */
    error(msg: string, err?: unknown, ctx?: LogContext): void {
        const payload: Record<string, unknown> = ctx ? { ...ctx } : {};

        // Pino's `err` key is reserved for stdSerializers.err. If a caller
        // passed their own `err` in ctx, preserve it under a different key
        // so the real error (below) isn't silently clobbered.
        if ("err" in payload) {
            payload.ctx_err = payload.err;
            delete payload.err;
        }

        let captured: unknown;
        if (err === undefined) {
            const synthetic = new Error(msg);
            if (typeof Error.captureStackTrace === "function") {
                Error.captureStackTrace(synthetic, this.error);
            }
            captured = synthetic;
        } else if (err instanceof Error) {
            captured = err;
        } else {
            captured = new Error(msg, { cause: err });
        }
        payload.err = captured;
        this.pino.error(payload, msg);
    }
}
