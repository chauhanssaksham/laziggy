/**
 * Tests for `installHttpClientMetrics` — emits `http.client.request` via
 * `metrics.start` / `Timer.end` per same-origin fetch.
 *
 * Note: this wrapper is normally installed AFTER `installTraceHeaders`, so
 * at call time the `traceparent` header is already on the request. These
 * tests install the metrics wrapper alone and pre-set the header on the
 * caller side to simulate the composed chain without coupling the tests.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { MetricProps, Timer } from "@/shared/lib/telemetry/IMetrics";

const SPAN_ID_16HEX = /^[0-9a-f]{16}$/;

const endSpy = vi.fn<(extra?: MetricProps) => void>();
const startSpy = vi.fn<(event: string, props?: MetricProps) => Timer>(() => ({
    end: endSpy,
}));
vi.mock("@/client/lib/telemetry/metrics.client", () => ({
    metrics: { record: vi.fn(), time: vi.fn(), start: startSpy },
}));

describe("installHttpClientMetrics", () => {
    let originalFetch: typeof window.fetch;
    let innerSpy: ReturnType<typeof vi.fn>;

    beforeEach(async () => {
        originalFetch = window.fetch;
        innerSpy = vi.fn(async () => new Response(null, { status: 200 }));
        window.fetch = innerSpy as unknown as typeof window.fetch;
        startSpy.mockClear();
        endSpy.mockClear();

        vi.resetModules();
        const mod = await import("@/client/lib/telemetry/http-client-metrics.client");
        mod.installHttpClientMetrics();
    });

    afterEach(() => {
        window.fetch = originalFetch;
    });

    it("starts a timer with method/route/requestId; ends with status_code", async () => {
        innerSpy.mockResolvedValueOnce(new Response(null, { status: 201 }));
        const tp = "00-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa-bbbbbbbbbbbbbbbb-01";
        await window.fetch("/api/demo?id=abc", {
            method: "POST",
            headers: { traceparent: tp },
        });

        expect(startSpy).toHaveBeenCalledOnce();
        const [event, startProps] = startSpy.mock.calls[0]!;
        expect(event).toBe("http.client.request");
        expect(startProps).toMatchObject({
            "http.request.method": "POST",
            "http.route": "/api/demo",
            requestId: "bbbbbbbbbbbbbbbb",
        });

        expect(endSpy).toHaveBeenCalledOnce();
        expect(endSpy).toHaveBeenCalledWith({ "http.response.status_code": 201 });
    });

    it("emits requestId='' when no traceparent is present (no trace-headers installed)", async () => {
        await window.fetch("/api/demo");

        const [, startProps] = startSpy.mock.calls[0]!;
        expect(startProps!.requestId).toBe("");
    });

    it("reads span-id from the traceparent header if present", async () => {
        const tp = "00-1111111111111111111111111111aaaa-1234567890abcdef-01";
        await window.fetch("/api/demo", { headers: { traceparent: tp } });

        const [, startProps] = startSpy.mock.calls[0]!;
        expect(startProps!.requestId).toBe("1234567890abcdef");
        expect(startProps!.requestId).toMatch(SPAN_ID_16HEX);
    });

    it("does NOT emit a metric for cross-origin fetches", async () => {
        await window.fetch("https://third-party.example.com/api");
        expect(startSpy).not.toHaveBeenCalled();
    });

    it("still ends the timer when fetch throws (status_code = 0)", async () => {
        const networkError = new TypeError("Failed to fetch");
        innerSpy.mockRejectedValueOnce(networkError);

        await expect(window.fetch("/api/demo")).rejects.toBe(networkError);

        expect(startSpy).toHaveBeenCalledOnce();
        expect(endSpy).toHaveBeenCalledWith({ "http.response.status_code": 0 });
    });

    it("is idempotent — calling install twice doesn't double-wrap fetch", async () => {
        const mod = await import("@/client/lib/telemetry/http-client-metrics.client");
        const patchedRef = window.fetch;
        mod.installHttpClientMetrics();
        expect(window.fetch).toBe(patchedRef);
    });
});
