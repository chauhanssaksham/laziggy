/**
 * `withErrorCapture` — HOF that wraps a loader or action with the four-job
 * error pipeline:
 *
 *   1. **Wrap**     — non-`AppError` throws become `InternalError` so response
 *                     bodies never leak raw DB errors / stack fragments. The
 *                     original cause is preserved on `.cause` for server logs.
 *   2. **Capture**  — one `logger.error(...)` call fans out to Pino (stdout
 *                     JSON line enriched via ALS mixin with requestId /
 *                     anonymousId / http.route / env) AND the composed
 *                     `PostHogExceptionCaptureLogger` child of the logger →
 *                     PostHog `$exception` event.
 *   3. **Respond**  — branch on route shape:
 *                       - `/api/*` → return `Response.json({ error, requestId },
 *                         { status })`. Clients calling via `fetch()` get a
 *                         typed JSON body with the AppError's HTTP status.
 *                       - page routes → rethrow the `AppError`; RR7 hands it
 *                         to the nearest `ErrorBoundary` for HTML rendering.
 *   4. **SRP**      — no other code needs a try/catch or `logger.error` call
 *                     for route-level errors; this is the single source.
 *
 * ## Why path-based branching
 *
 * RR7's default synthesized error Response for resource routes is unusable:
 * status is hardcoded to 500, body is plain text `"Unexpected Server Error\n\n
 * <ErrorClass>: <message>"` (not JSON). Constructing our own Response.json on
 * the `/api/*` path preserves the AppError's HTTP status and gives callers a
 * parseable `{ error, requestId }` body.
 *
 * Page routes rely on RR7's default path (→ `ErrorBoundary`), which IS what
 * we want for HTML rendering — so we rethrow there.
 *
 * ## Why a HOF, not middleware
 *
 * RR7 catches loader/action throws *inside* `next()` and converts them to a
 * Response before middleware's `try/catch` can see them (verified against
 * reactrouter.com/how-to/middleware §"next() and Error Handling"). The HOF
 * runs *inside* the loader/action body, before RR7's catch layer, so the raw
 * `Error` — stack, `.cause`, instanceof checks — is still in scope.
 *
 * ## Usage
 *
 *   export const action = withErrorCapture(async ({ request }) => { ... });
 *   export const loader = withErrorCapture(async ({ params }) => { ... });
 *
 * ## Design doc
 *
 * DOCS/observability-and-error-handling.md — "Error handling" section.
 */

import { AppError, InternalError, isAppError } from "@/shared/lib/errors";
import { logger } from "../telemetry/logger.server";
import { getContext } from "../context/request-context.server";

type HandlerArgs = { request: Request } & Record<string, unknown>;

export function withErrorCapture<Args extends HandlerArgs, Ret>(
    fn: (args: Args) => Ret | Promise<Ret>,
): (args: Args) => Promise<Ret | Response> {
    return async (args: Args): Promise<Ret | Response> => {
        try {
            return await fn(args);
        } catch (err) {
            const appErr: AppError = isAppError(err)
                ? err
                : new InternalError("Something went wrong", { cause: err });

            logger.error(`Handler error: ${appErr.name}`, err, {
                "exception.type": appErr.name,
                "http.response.status_code": appErr.status,
            });

            if (isApiRoute(args.request)) {
                return Response.json(
                    { error: appErr.userMessage, requestId: getContext()?.requestId },
                    { status: appErr.status },
                );
            }
            throw appErr;
        }
    };
}

function isApiRoute(request: Request): boolean {
    try {
        return new URL(request.url).pathname.startsWith("/api/");
    } catch {
        return false;
    }
}
