/**
 * Typed error hierarchy.
 *
 * Throw these from services + loaders instead of bare `new Error(...)`.
 * The API error handler maps them to HTTP status + a sanitized response.
 *
 * `userMessage` is safe to show users. Internal details (DB IDs, raw driver
 * errors) belong in `cause` — logged server-side, never returned to the client.
 *
 * Each subclass sets `this.name` to an explicit string literal (not
 * `new.target.name`) so the class identity survives JS minification —
 * PostHog Error Tracking fingerprints by `error.name`, and minified names
 * like `"t"` would collapse every subclass into one group. Vercel Node
 * isn't minified today, but making this robust costs one line.
 *
 * Design doc: DOCS/observability-and-error-handling.md
 */

export interface AppErrorOptions {
    /** Original error being wrapped — logged, never returned to the client. */
    cause?: unknown;
    /** Richer message for logs. Defaults to `userMessage`. */
    internalMessage?: string;
}

export class AppError extends Error {
    readonly status: number;
    readonly userMessage: string;

    constructor(userMessage: string, status: number, opts?: AppErrorOptions) {
        super(opts?.internalMessage ?? userMessage, opts?.cause !== undefined ? { cause: opts.cause } : undefined);
        this.name = "AppError";
        this.status = status;
        this.userMessage = userMessage;
    }
}

export class NotFoundError extends AppError {
    constructor(userMessage = "Not found", opts?: AppErrorOptions) {
        super(userMessage, 404, opts);
        this.name = "NotFoundError";
    }
}

export class ValidationError extends AppError {
    constructor(userMessage: string, opts?: AppErrorOptions) {
        super(userMessage, 400, opts);
        this.name = "ValidationError";
    }
}

export class UnauthorizedError extends AppError {
    constructor(userMessage = "Unauthorized", opts?: AppErrorOptions) {
        super(userMessage, 401, opts);
        this.name = "UnauthorizedError";
    }
}

/** 403 — authenticated but lacks permission. Distinct from 401 (not logged in). */
export class ForbiddenError extends AppError {
    constructor(userMessage = "Forbidden", opts?: AppErrorOptions) {
        super(userMessage, 403, opts);
        this.name = "ForbiddenError";
    }
}

export class MethodNotAllowedError extends AppError {
    constructor(userMessage = "Method not allowed", opts?: AppErrorOptions) {
        super(userMessage, 405, opts);
        this.name = "MethodNotAllowedError";
    }
}

/** 409 — request conflicts with current state (duplicate resource, stale update). */
export class ConflictError extends AppError {
    constructor(userMessage = "Conflict", opts?: AppErrorOptions) {
        super(userMessage, 409, opts);
        this.name = "ConflictError";
    }
}

/** 413 — request body exceeds size limit (e.g., upload too large). */
export class PayloadTooLargeError extends AppError {
    constructor(userMessage = "Payload too large", opts?: AppErrorOptions) {
        super(userMessage, 413, opts);
        this.name = "PayloadTooLargeError";
    }
}

/** 429 — client hit a rate limit. */
export class RateLimitError extends AppError {
    constructor(userMessage = "Too many requests", opts?: AppErrorOptions) {
        super(userMessage, 429, opts);
        this.name = "RateLimitError";
    }
}

export class InternalError extends AppError {
    constructor(userMessage = "Something went wrong", opts?: AppErrorOptions) {
        super(userMessage, 500, opts);
        this.name = "InternalError";
    }
}

/** 501 — handler exists but deliberately doesn't support this operation.
 *  Use for interface methods that don't apply (e.g., a polymorphic service
 *  that should never be hit for a given backend). Distinct from 500 —
 *  signals "known operation, not available here" rather than "something broke". */
export class NotImplementedError extends AppError {
    constructor(userMessage = "Not implemented", opts?: AppErrorOptions) {
        super(userMessage, 501, opts);
        this.name = "NotImplementedError";
    }
}

export function isAppError(err: unknown): err is AppError {
    return err instanceof AppError;
}
