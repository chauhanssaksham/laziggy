import { describe, it, expect, vi } from "vitest";
import { InstrumentedCache } from "@/server/infra/cache/InstrumentedCache.server";
import { TTLCache, ONE_HOUR } from "@/server/infra/cache/TTLCache.server";
import type { ICache } from "@/server/infra/cache/ICache.server";
import type { IMetrics } from "@/shared/lib/telemetry/IMetrics";

function makeMetrics(): IMetrics & { recordSpy: ReturnType<typeof vi.fn> } {
    const recordSpy = vi.fn();
    return {
        record: recordSpy,
        time: async (_, fn) => fn(),
        start: () => ({ end: () => {} }),
        recordSpy,
    };
}

describe("InstrumentedCache", () => {
    it("emits cache.access with hit=false on cold get(), hit=true after set()", () => {
        const m = makeMetrics();
        const cache = new InstrumentedCache<string>(
            new TTLCache<string>(ONE_HOUR),
            "test.cache",
            m,
        );

        expect(cache.get("k")).toBeUndefined();
        expect(m.recordSpy).toHaveBeenLastCalledWith("cache.access", {
            cache: "test.cache",
            hit: false,
            errored: false,
        });

        cache.set("k", "v");
        expect(cache.get("k")).toBe("v");
        expect(m.recordSpy).toHaveBeenLastCalledWith("cache.access", {
            cache: "test.cache",
            hit: true,
            errored: false,
        });
    });

    it("emits one cache.access per getOrSet — hit=false on miss, hit=true on subsequent", async () => {
        const m = makeMetrics();
        const cache = new InstrumentedCache<string>(
            new TTLCache<string>(ONE_HOUR),
            "x",
            m,
        );

        const factory = vi.fn(async () => "computed");

        // First call: cache miss → emit hit=false, factory runs.
        const v1 = await cache.getOrSet("k", factory);
        expect(v1).toBe("computed");
        expect(factory).toHaveBeenCalledTimes(1);
        expect(m.recordSpy).toHaveBeenLastCalledWith("cache.access", {
            cache: "x",
            hit: false,
            errored: false,
        });

        // Second call: cache hit → emit hit=true, factory NOT re-run.
        const v2 = await cache.getOrSet("k", factory);
        expect(v2).toBe("computed");
        expect(factory).toHaveBeenCalledTimes(1);
        expect(m.recordSpy).toHaveBeenLastCalledWith("cache.access", {
            cache: "x",
            hit: true,
            errored: false,
        });

        // Total: exactly 2 metric events across 2 getOrSet calls.
        expect(m.recordSpy).toHaveBeenCalledTimes(2);
    });

    it("preserves single-flight semantics — stampede still hits factory once", async () => {
        const m = makeMetrics();
        const cache = new InstrumentedCache<string>(
            new TTLCache<string>(ONE_HOUR),
            "x",
            m,
        );

        const factory = vi.fn(async () => {
            await new Promise((r) => setTimeout(r, 10));
            return "once";
        });

        // Simulate stampede: 5 concurrent getOrSet calls on the same cold key.
        const results = await Promise.all(
            Array.from({ length: 5 }, () => cache.getOrSet("k", factory)),
        );

        expect(results).toEqual(["once", "once", "once", "once", "once"]);
        expect(factory).toHaveBeenCalledTimes(1);
    });

    it("delegates invalidate to the inner cache", () => {
        const m = makeMetrics();
        const inner = new TTLCache<string>(ONE_HOUR);
        const cache = new InstrumentedCache(inner, "x", m);

        cache.set("k", "v");
        expect(inner.get("k")).toBe("v");

        cache.invalidate("k");
        expect(inner.get("k")).toBeUndefined();
    });

    // Contract: `undefined` is the "miss" sentinel. Every other value —
    // including falsy ones (null, 0, false, "") — is a hit. The decorator
    // uses `value !== undefined` rather than truthiness for exactly this
    // reason. ICache<T>'s type constraint (`T extends {} | null`) forbids
    // undefined as a value at compile time.
    describe("falsy-value hits", () => {
        it.each([
            ["null", null],
            ["0", 0],
            ["false", false],
            ['""', ""],
        ] as const)("reports hit=true when cached value is %s", (_label, falsy) => {
            const m = makeMetrics();
            // Use unknown-typed cache to reach every falsy shape in one loop.
            const cache = new InstrumentedCache<typeof falsy>(
                new TTLCache<typeof falsy>(ONE_HOUR),
                "x",
                m,
            );
            cache.set("k", falsy);
            m.recordSpy.mockClear();

            const value = cache.get("k");
            expect(value).toBe(falsy);
            expect(m.recordSpy).toHaveBeenCalledWith("cache.access", {
                cache: "x",
                hit: true,
                errored: false,
            });
        });
    });

    // ── Throw handling ───────────────────────────────────────────────────────

    /**
     * Mock inner cache whose `get()` always throws — simulates a failing
     * distributed cache (e.g., a future Redis impl with a network error).
     *
     * Note `getOrSet` here does NOT throw; that's fine because
     * `InstrumentedCache.getOrSet` calls `inner.get(key)` for the peek,
     * NOT `inner.getOrSet` — so the decorator's peek-throw path is
     * exercised via `get()`, not routed through `getOrSet`. The
     * `getOrSet()` fallthrough simulates a degraded cache that's
     * recovered enough to run the factory.
     */
    class ThrowingCache<T extends {} | null> implements ICache<T> {
        get(): T | undefined {
            throw new Error("read failed");
        }
        set(): void {
            /* no-op */
        }
        invalidate(): void {
            /* no-op */
        }
        async getOrSet(_key: string, factory: () => Promise<T>): Promise<T> {
            return factory();
        }
    }

    it("get() — inner throw is recorded as errored miss and rethrown", () => {
        const m = makeMetrics();
        const cache = new InstrumentedCache(new ThrowingCache<string>(), "x", m);

        expect(() => cache.get("k")).toThrow("read failed");
        expect(m.recordSpy).toHaveBeenLastCalledWith("cache.access", {
            cache: "x",
            hit: false,
            errored: true,
        });
    });

    it("getOrSet() — inner peek throw is recorded as errored, factory still runs", async () => {
        const m = makeMetrics();
        const cache = new InstrumentedCache(new ThrowingCache<string>(), "x", m);
        const factory = vi.fn(async () => "fallback");

        const result = await cache.getOrSet("k", factory);
        expect(result).toBe("fallback");
        expect(factory).toHaveBeenCalledTimes(1);
        expect(m.recordSpy).toHaveBeenLastCalledWith("cache.access", {
            cache: "x",
            hit: false,
            errored: true,
        });
    });
});
