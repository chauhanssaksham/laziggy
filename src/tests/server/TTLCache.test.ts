import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TTLCache, ONE_MINUTE, ONE_HOUR } from "@/server/infra/cache/TTLCache.server";

// =============================================================================
// Basic get / set / invalidate
// =============================================================================

describe("TTLCache — basic operations", () => {
    it("get returns undefined for a key that was never set", () => {
        const cache = new TTLCache<string>(ONE_HOUR);
        expect(cache.get("missing")).toBeUndefined();
    });

    it("set followed by get returns the stored value", () => {
        const cache = new TTLCache<string>(ONE_HOUR);
        cache.set("foo", "bar");
        expect(cache.get("foo")).toBe("bar");
    });

    it("set overwrites an existing value for the same key", () => {
        const cache = new TTLCache<string>(ONE_HOUR);
        cache.set("foo", "first");
        cache.set("foo", "second");
        expect(cache.get("foo")).toBe("second");
    });

    it("set stores arbitrary reference types — the exact object is returned", () => {
        const cache = new TTLCache<{ a: number }>(ONE_HOUR);
        const value = { a: 1 };
        cache.set("k", value);
        // Reference equality: no cloning, no serialization
        expect(cache.get("k")).toBe(value);
    });

    it("invalidate removes a key — subsequent get returns undefined", () => {
        const cache = new TTLCache<string>(ONE_HOUR);
        cache.set("foo", "bar");
        cache.invalidate("foo");
        expect(cache.get("foo")).toBeUndefined();
    });

    it("invalidate on a non-existent key is a no-op (does not throw)", () => {
        const cache = new TTLCache<string>(ONE_HOUR);
        expect(() => cache.invalidate("never-set")).not.toThrow();
    });

    it("different keys do not collide", () => {
        const cache = new TTLCache<string>(ONE_HOUR);
        cache.set("a", "1");
        cache.set("b", "2");
        expect(cache.get("a")).toBe("1");
        expect(cache.get("b")).toBe("2");
    });

    // Contract: `get()` returns `undefined` iff the key is absent or expired.
    // A cached falsy value (null, 0, false, "") must round-trip unchanged —
    // the internal truthy-check in `get()` guards the WRAPPER, not the value.
    // Refactoring the store to hold raw T would silently break this.
    describe("falsy values are preserved (wrapper guards the truthy check)", () => {
        it("null round-trips", () => {
            const cache = new TTLCache<string | null>(ONE_HOUR);
            cache.set("k", null);
            expect(cache.get("k")).toBeNull();
            expect(cache.get("k")).not.toBeUndefined();
        });

        it("0 round-trips", () => {
            const cache = new TTLCache<number>(ONE_HOUR);
            cache.set("k", 0);
            expect(cache.get("k")).toBe(0);
        });

        it("false round-trips", () => {
            const cache = new TTLCache<boolean>(ONE_HOUR);
            cache.set("k", false);
            expect(cache.get("k")).toBe(false);
        });

        it("empty string round-trips", () => {
            const cache = new TTLCache<string>(ONE_HOUR);
            cache.set("k", "");
            expect(cache.get("k")).toBe("");
        });
    });
});

// =============================================================================
// TTL / expiry behavior
// =============================================================================

describe("TTLCache — expiry", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("get returns the value immediately after set (t=0)", () => {
        const cache = new TTLCache<string>(ONE_MINUTE);
        cache.set("foo", "bar");
        expect(cache.get("foo")).toBe("bar");
    });

    it("get returns the value just before expiry (t = ttl - 1)", () => {
        const cache = new TTLCache<string>(ONE_MINUTE);
        cache.set("foo", "bar");
        vi.advanceTimersByTime(ONE_MINUTE - 1);
        expect(cache.get("foo")).toBe("bar");
    });

    it("get returns undefined just after expiry (t = ttl + 1)", () => {
        const cache = new TTLCache<string>(ONE_MINUTE);
        cache.set("foo", "bar");
        vi.advanceTimersByTime(ONE_MINUTE + 1);
        expect(cache.get("foo")).toBeUndefined();
    });

    it("set after expiry extends the entry's lifetime by a fresh TTL", () => {
        const cache = new TTLCache<string>(ONE_MINUTE);
        cache.set("foo", "bar");
        vi.advanceTimersByTime(ONE_MINUTE + 1);
        // Expired
        cache.set("foo", "baz");
        vi.advanceTimersByTime(ONE_MINUTE - 1);
        // Still within the new TTL window
        expect(cache.get("foo")).toBe("baz");
    });

    it("different entries expire independently based on their own set time", () => {
        const cache = new TTLCache<string>(ONE_MINUTE);
        cache.set("early", "1");
        vi.advanceTimersByTime(ONE_MINUTE / 2); // t = 30s
        cache.set("late", "2");
        vi.advanceTimersByTime(ONE_MINUTE / 2 + 1); // t = 60s + 1 — "early" expired, "late" still valid
        expect(cache.get("early")).toBeUndefined();
        expect(cache.get("late")).toBe("2");
    });
});

// =============================================================================
// getOrSet
// =============================================================================

describe("TTLCache — getOrSet", () => {
    it("calls the factory and returns its value on a cold cache", async () => {
        const cache = new TTLCache<string>(ONE_HOUR);
        const factory = vi.fn(async () => "computed");
        const result = await cache.getOrSet("key", factory);
        expect(result).toBe("computed");
        expect(factory).toHaveBeenCalledTimes(1);
    });

    it("caches the factory's return value — a subsequent get sees it", async () => {
        const cache = new TTLCache<string>(ONE_HOUR);
        await cache.getOrSet("key", async () => "computed");
        expect(cache.get("key")).toBe("computed");
    });

    it("does NOT call the factory when the key is already cached", async () => {
        const cache = new TTLCache<string>(ONE_HOUR);
        cache.set("key", "preloaded");
        const factory = vi.fn(async () => "computed");
        const result = await cache.getOrSet("key", factory);
        expect(result).toBe("preloaded");
        expect(factory).not.toHaveBeenCalled();
    });

    it("calls the factory again after the cached entry expires", async () => {
        vi.useFakeTimers();
        try {
            const cache = new TTLCache<string>(ONE_MINUTE);
            const factory = vi.fn(async () => "fresh");
            await cache.getOrSet("key", factory);
            vi.advanceTimersByTime(ONE_MINUTE + 1);
            await cache.getOrSet("key", factory);
            expect(factory).toHaveBeenCalledTimes(2);
        } finally {
            vi.useRealTimers();
        }
    });

    it("does not poison the cache when the factory throws — subsequent calls retry", async () => {
        const cache = new TTLCache<string>(ONE_HOUR);
        const factory = vi
            .fn<() => Promise<string>>()
            .mockRejectedValueOnce(new Error("transient"))
            .mockResolvedValueOnce("recovered");
        await expect(cache.getOrSet("key", factory)).rejects.toThrow("transient");
        // Cache is empty, not populated with undefined or a rejected promise
        expect(cache.get("key")).toBeUndefined();
        // Retry succeeds
        const result = await cache.getOrSet("key", factory);
        expect(result).toBe("recovered");
        expect(factory).toHaveBeenCalledTimes(2);
    });
});

// =============================================================================
// Concurrent stampede — single-flight behavior
// =============================================================================

describe("TTLCache — concurrent access (stampede)", () => {
    it("two concurrent getOrSet calls for the same cold key: factory runs exactly once", async () => {
        const cache = new TTLCache<string>(ONE_HOUR);
        let calls = 0;
        const factory = async () => {
            calls++;
            // Simulate a slow resolver so both callers race into the critical section
            await new Promise((r) => setTimeout(r, 10));
            return "value";
        };

        const [a, b] = await Promise.all([
            cache.getOrSet("key", factory),
            cache.getOrSet("key", factory),
        ]);

        expect(a).toBe("value");
        expect(b).toBe("value");
        // Single-flight contract: both callers share one in-flight computation
        expect(calls).toBe(1);
    });
});
