import { describe, it, expect } from "vitest";
import {
    getContext,
    getContextAttrs,
    runWithContext,
    addToContext,
} from "@/server/lib/context/request-context.server";

describe("request-context", () => {
    it("getContext returns undefined outside runWithContext", () => {
        expect(getContext()).toBeUndefined();
    });

    it("getContextAttrs returns {} outside runWithContext + no extra", () => {
        expect(getContextAttrs()).toEqual({});
    });

    it("getContextAttrs remaps `route` → `http.route`", async () => {
        await runWithContext(
            { requestId: "r-1", route: "/menu/taas", env: "development" },
            async () => {
                const attrs = getContextAttrs();
                expect(attrs).toMatchObject({
                    requestId: "r-1",
                    "http.route": "/menu/taas",
                    env: "development",
                });
                expect(attrs.route).toBeUndefined();
            },
        );
    });

    it("getContextAttrs merges ctx.extra at top level", async () => {
        await runWithContext(
            {
                requestId: "r-2",
                extra: { sessionId: "s-abc", demoId: "d-xyz" },
            },
            async () => {
                const attrs = getContextAttrs();
                expect(attrs).toMatchObject({
                    requestId: "r-2",
                    sessionId: "s-abc",
                    demoId: "d-xyz",
                });
                // the raw `extra` key shouldn't appear as a nested object.
                expect(attrs.extra).toBeUndefined();
            },
        );
    });

    it("getContextAttrs merges caller `extra` through for non-ALS fields", async () => {
        await runWithContext({ requestId: "r-3" }, async () => {
            const attrs = getContextAttrs({ model: "gemini-3-pro", tokens: 42 });
            expect(attrs).toMatchObject({
                requestId: "r-3",
                model: "gemini-3-pro",
                tokens: 42,
            });
        });
    });

    // Contract: ALS is the authoritative source for identity / request-shape
    // fields. A caller passing `extra: { anonymousId, requestId, ... }`
    // CANNOT override ALS values. Guards against both accidental overrides
    // (two props bags colliding on a shared key) and malicious overrides
    // (caller attributing an event to a different device).
    it("ALS wins over caller `extra` on conflicting keys", async () => {
        await runWithContext(
            {
                requestId: "r-real",
                anonymousId: "device-real",
                route: "/api/test",
                env: "production",
            },
            async () => {
                const attrs = getContextAttrs({
                    anonymousId: "device-spoofed",
                    requestId: "r-spoofed",
                    "http.route": "/spoofed",
                    env: "development",
                    model: "gemini-3-pro", // non-ALS field — should pass through
                });
                expect(attrs).toMatchObject({
                    anonymousId: "device-real",
                    requestId: "r-real",
                    "http.route": "/api/test",
                    env: "production",
                    model: "gemini-3-pro",
                });
            },
        );
    });

    it("runWithContext propagates across async boundaries", async () => {
        await runWithContext({ requestId: "r-async" }, async () => {
            await new Promise((resolve) => setTimeout(resolve, 1));
            expect(getContext()?.requestId).toBe("r-async");
        });
    });

    // addToContext lets loaders push domain-specific attrs (sessionId,
    // menuId, demoId, etc.) after the middleware has set up the base context.
    // Downstream logs + metrics then emit them automatically via ALS.
    describe("addToContext", () => {
        it("merges fields into ctx.extra and makes them appear via getContextAttrs", async () => {
            await runWithContext({ requestId: "r-1" }, async () => {
                addToContext({ sessionId: "s-1", menuId: "m-1" });
                const attrs = getContextAttrs();
                expect(attrs).toMatchObject({
                    requestId: "r-1",
                    sessionId: "s-1",
                    menuId: "m-1",
                });
            });
        });

        it("multiple calls merge — later keys win on conflict", async () => {
            await runWithContext({ requestId: "r-2" }, async () => {
                addToContext({ sessionId: "s-first", menuId: "m-1" });
                addToContext({ sessionId: "s-second" });
                const attrs = getContextAttrs();
                expect(attrs).toMatchObject({
                    sessionId: "s-second",
                    menuId: "m-1",
                });
            });
        });

        it("is a no-op outside runWithContext", () => {
            // Should not throw and should not alter anything.
            addToContext({ something: "foo" });
            expect(getContext()).toBeUndefined();
        });

        it("propagates across async boundaries — attrs set before await still apply after", async () => {
            await runWithContext({ requestId: "r-3" }, async () => {
                addToContext({ sessionId: "s-3" });
                await new Promise((r) => setTimeout(r, 1));
                expect(getContextAttrs().sessionId).toBe("s-3");
            });
        });
    });

    it("different contexts for concurrent runs don't bleed", async () => {
        const [a, b] = await Promise.all([
            runWithContext({ requestId: "r-A" }, async () => {
                await new Promise((r) => setTimeout(r, 5));
                return getContext()?.requestId;
            }),
            runWithContext({ requestId: "r-B" }, async () => {
                await new Promise((r) => setTimeout(r, 1));
                return getContext()?.requestId;
            }),
        ]);
        expect(a).toBe("r-A");
        expect(b).toBe("r-B");
    });
});
