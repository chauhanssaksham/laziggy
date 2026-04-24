/**
 * Tests for `installTraceHeaders` — header injection only.
 *
 * The fetch-timing metric lives in `./http-client-metrics.test.ts`.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const W3C_TRACEPARENT = /^00-[0-9a-f]{32}-[0-9a-f]{16}-01$/;
const SPAN_ID_16HEX = /^[0-9a-f]{16}$/;

describe("installTraceHeaders", () => {
    let originalFetch: typeof window.fetch;
    let innerSpy: ReturnType<typeof vi.fn>;

    beforeEach(async () => {
        originalFetch = window.fetch;
        innerSpy = vi.fn(async () => new Response(null, { status: 200 }));
        window.fetch = innerSpy as unknown as typeof window.fetch;

        vi.resetModules();
        const mod = await import("@/client/lib/telemetry/trace-headers.client");
        mod.installTraceHeaders();
    });

    afterEach(() => {
        window.fetch = originalFetch;
    });

    it("attaches a W3C traceparent on relative-URL fetches", async () => {
        await window.fetch("/api/demo?id=123");

        const [, init] = innerSpy.mock.calls[0]!;
        expect(new Headers(init?.headers).get("traceparent")).toMatch(W3C_TRACEPARENT);
    });

    it("attaches traceparent on same-origin absolute URLs", async () => {
        await window.fetch(`${window.location.origin}/api/demo`);

        const [, init] = innerSpy.mock.calls[0]!;
        expect(new Headers(init?.headers).get("traceparent")).toMatch(W3C_TRACEPARENT);
    });

    it("does NOT attach traceparent on cross-origin fetches", async () => {
        await window.fetch("https://third-party.example.com/api");

        const [, init] = innerSpy.mock.calls[0]!;
        expect(new Headers(init?.headers ?? {}).get("traceparent")).toBeNull();
    });

    it("preserves a VALID caller-supplied traceparent", async () => {
        const callerValue = "00-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa-bbbbbbbbbbbbbbbb-01";
        await window.fetch("/api/demo", { headers: { traceparent: callerValue } });

        const [, init] = innerSpy.mock.calls[0]!;
        expect(new Headers(init?.headers).get("traceparent")).toBe(callerValue);
    });

    it("OVERWRITES a malformed caller-supplied traceparent with a fresh mint", async () => {
        await window.fetch("/api/demo", { headers: { traceparent: "not-a-valid-traceparent" } });

        const [, init] = innerSpy.mock.calls[0]!;
        const sent = new Headers(init?.headers).get("traceparent");
        expect(sent).not.toBe("not-a-valid-traceparent");
        expect(sent).toMatch(W3C_TRACEPARENT);
    });

    it("handles Request objects — preserves content-type + attaches traceparent", async () => {
        const req = new Request("/api/chat", {
            method: "POST",
            body: JSON.stringify({ hi: "there" }),
            headers: { "content-type": "application/json" },
        });
        await window.fetch(req);

        const [firstArg] = innerSpy.mock.calls[0]!;
        expect(firstArg).toBeInstanceOf(Request);
        const req2 = firstArg as Request;
        expect(req2.headers.get("traceparent")).toMatch(W3C_TRACEPARENT);
        expect(req2.headers.get("content-type")).toBe("application/json");
    });

    it("generates a fresh span-id per call", async () => {
        await window.fetch("/a");
        await window.fetch("/b");

        const h1 = new Headers(innerSpy.mock.calls[0]![1]?.headers).get("traceparent");
        const h2 = new Headers(innerSpy.mock.calls[1]![1]?.headers).get("traceparent");
        expect(h1).not.toBe(h2);
    });

    it("is idempotent — calling install twice doesn't double-wrap fetch", async () => {
        const mod = await import("@/client/lib/telemetry/trace-headers.client");
        const patchedRef = window.fetch;
        mod.installTraceHeaders();
        expect(window.fetch).toBe(patchedRef);
    });

    it("generateTraceparent mints a valid W3C traceparent, extractSpanId pulls the span-id", async () => {
        const mod = await import("@/client/lib/telemetry/trace-headers.client");
        const tp = mod.generateTraceparent();
        expect(tp).toMatch(W3C_TRACEPARENT);
        expect(mod.extractSpanId(tp)).toBe(tp.split("-")[2]);
        expect(mod.extractSpanId(tp)).toMatch(SPAN_ID_16HEX);
    });
});
