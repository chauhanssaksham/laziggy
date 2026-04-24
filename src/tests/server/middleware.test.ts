import { describe, it, expect, vi, afterEach } from "vitest";
import { RouterContextProvider } from "react-router";
import { requestContextMiddleware } from "@/server/lib/middleware/requestContextMiddleware.server";
import { httpMetricsMiddleware } from "@/server/lib/middleware/httpMetricsMiddleware.server";
import { withErrorCapture } from "@/server/lib/middleware/withErrorCapture.server";
import { getContext } from "@/server/lib/context/request-context.server";
import { CompositeMetricSink } from "@/shared/lib/telemetry/CompositeMetricSink";
import {
    AppError,
    InternalError,
    NotFoundError,
    UnauthorizedError,
    ValidationError,
} from "@/shared/lib/errors";

// =============================================================================
// Helpers — mock the RR7 middleware args + compose middleware + HOF-wrapped
// handler the way RR7 does.
//
// The vitest `happy-dom` environment strips the Cookie header on Headers
// construction; our middleware doesn't need cookies for these tests, so plain
// `new Request(...)` works.
// =============================================================================

function apiArgs(url = "https://example.com/api/test") {
    return {
        request: new Request(url, { method: "POST" }),
        params: {} as Record<string, string>,
        context: new RouterContextProvider(),
    };
}

function pageArgs(url = "https://example.com/menu/taas") {
    return {
        request: new Request(url),
        params: {} as Record<string, string>,
        context: new RouterContextProvider(),
    };
}

/**
 * Composes [requestContextMiddleware, withErrorCapture(final)] the way RR7
 * would at runtime — outer middleware wraps the wrapped handler.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function runChain(args: any, final: (a: any) => Promise<Response> | Response): Promise<Response> {
    const wrapped = withErrorCapture(final);
    return (await requestContextMiddleware(args, () => Promise.resolve(wrapped(args)))) as Response;
}

// =============================================================================
// Happy path — wrapper is transparent when nothing throws
// =============================================================================

describe("withErrorCapture — success path", () => {
    it("returns the handler's response unchanged when nothing throws", async () => {
        const response = await runChain(apiArgs(), () =>
            Response.json({ ok: true }, { status: 201 }),
        );
        expect(response.status).toBe(201);
        expect(await response.json()).toEqual({ ok: true });
    });

    it("supports async handlers", async () => {
        const response = await runChain(pageArgs(), async () => {
            await Promise.resolve();
            return new Response("hello", { status: 200 });
        });
        expect(response.status).toBe(200);
        expect(await response.text()).toBe("hello");
    });
});

// =============================================================================
// requestContextMiddleware — populates ALS so handler can read getContext()
// =============================================================================

describe("requestContextMiddleware", () => {
    it("populates the request context for the duration of the handler", async () => {
        let seenContext: ReturnType<typeof getContext>;
        await runChain(apiArgs(), () => {
            seenContext = getContext();
            return Response.json({});
        });
        expect(seenContext).toBeDefined();
        expect(seenContext!.requestId).toMatch(/^[0-9a-f-]{8,36}$/);
        expect(seenContext!.route).toBe("/api/test");
    });

    it("different requests produce different requestIds", async () => {
        let id1: string | undefined;
        let id2: string | undefined;
        await runChain(apiArgs(), () => {
            id1 = getContext()?.requestId;
            return Response.json({});
        });
        await runChain(apiArgs(), () => {
            id2 = getContext()?.requestId;
            return Response.json({});
        });
        expect(id1).toBeDefined();
        expect(id2).toBeDefined();
        expect(id1).not.toBe(id2);
    });
});

// =============================================================================
// withErrorCapture — /api/* routes convert AppError → JSON Response
//
// RR7's default synthesized error Response for resource routes is unusable
// (status always 500, plain-text body). The HOF constructs its own
// Response.json with the AppError's status + userMessage so clients get a
// parseable body.
// =============================================================================

describe("withErrorCapture — /api/* returns JSON Response", () => {
    it.each([
        { name: "NotFoundError", status: 404, err: () => new NotFoundError("Menu unavailable") },
        { name: "ValidationError", status: 400, err: () => new ValidationError("Bad input") },
        { name: "UnauthorizedError", status: 401, err: () => new UnauthorizedError("Nope") },
        { name: "InternalError", status: 500, err: () => new InternalError("Boom") },
    ])("$name → status $status with userMessage + requestId in body", async ({ status, err }) => {
        const thrown = err();
        const response = await runChain(apiArgs(), () => { throw thrown; });
        expect(response.status).toBe(status);
        const body = (await response.json()) as { error?: string; requestId?: string };
        expect(body.error).toBe(thrown.userMessage);
        expect(body.requestId).toMatch(/^[0-9a-f-]{8,36}$/);
    });

    it("custom AppError subclass honours its status + userMessage", async () => {
        class TeapotError extends AppError {
            constructor() { super("I am a teapot", 418); }
        }
        const response = await runChain(apiArgs(), () => { throw new TeapotError(); });
        expect(response.status).toBe(418);
        const body = (await response.json()) as { error?: string };
        expect(body.error).toBe("I am a teapot");
    });

    it("plain Error is wrapped — body is generic, internals never leak", async () => {
        const response = await runChain(apiArgs(), () => {
            throw new Error("internal connection string leaked here");
        });
        expect(response.status).toBe(500);
        const body = (await response.json()) as { error?: string };
        expect(body.error).toBe("Something went wrong");
        expect(body.error).not.toContain("connection string");
    });

    it("non-Error throws (raw string) also become 500 JSON", async () => {
        const response = await runChain(apiArgs(), () => { throw "raw string error"; });
        expect(response.status).toBe(500);
        const body = (await response.json()) as { error?: string };
        expect(body.error).toBe("Something went wrong");
    });
});

// =============================================================================
// withErrorCapture — page routes rethrow so ErrorBoundary can render
// =============================================================================

describe("withErrorCapture — page routes rethrow", () => {
    it("rethrows the original AppError on a non-/api/ path", async () => {
        const thrown = new NotFoundError("Menu not found");
        await expect(runChain(pageArgs(), () => { throw thrown; })).rejects.toBe(thrown);
    });

    it("wraps non-AppError in InternalError before rethrowing", async () => {
        const cause = new Error("oops");
        let thrown: unknown;
        try {
            await runChain(pageArgs(), () => { throw cause; });
        } catch (e) {
            thrown = e;
        }
        expect(thrown).toBeInstanceOf(InternalError);
        const err = thrown as InternalError;
        expect(err.status).toBe(500);
        expect(err.userMessage).toBe("Something went wrong");
        expect(err.cause).toBe(cause);
    });
});

// =============================================================================
// httpMetricsMiddleware — emits one http.server.request metric per request
// =============================================================================

/**
 * Runs [requestContextMiddleware → httpMetricsMiddleware → final]. Used only
 * by the httpMetricsMiddleware block below; other tests use `runChain` which
 * skips the metrics middleware to keep spy assertions local to this block.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function runWithMetrics(args: any, final: () => Promise<Response> | Response): Promise<Response> {
    const step2 = () => Promise.resolve(httpMetricsMiddleware(args, () => Promise.resolve(final())));
    return (await requestContextMiddleware(args, step2 as () => Promise<Response>)) as Response;
}

describe("httpMetricsMiddleware", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("records http.server.request with method, status, and duration_ms", async () => {
        // Middleware uses metrics.start()/Timer.end() so we spy on the sink
        // (lowest common boundary — record() goes through `safeRecord → sink.record`).
        const spy = vi.spyOn(CompositeMetricSink.prototype, "record");
        await runWithMetrics(apiArgs(), () => Response.json({ ok: true }, { status: 201 }));

        expect(spy).toHaveBeenCalledOnce();
        const [event, props] = spy.mock.calls[0]!;
        expect(event).toBe("http.server.request");
        expect(props).toMatchObject({
            "http.request.method": "POST",
            "http.response.status_code": 201,
        });
        expect(props!.duration_ms).toBeTypeOf("number");
        expect(props!.duration_ms).toBeGreaterThanOrEqual(0);
    });

    it("records the actual status returned by the handler (not a default)", async () => {
        const spy = vi.spyOn(CompositeMetricSink.prototype, "record");
        await runWithMetrics(pageArgs(), () => new Response("not found", { status: 404 }));

        expect(spy).toHaveBeenCalledOnce();
        const [, props] = spy.mock.calls[0]!;
        expect(props).toMatchObject({ "http.response.status_code": 404 });
    });
});
