import { describe, it, expect } from "vitest";
import { unflatten, deepFreeze } from "@/shared/lib/object-helpers";

// =============================================================================
// unflatten
// =============================================================================

describe("unflatten", () => {
    it("expands dot-keyed entries into a nested object", () => {
        const result = unflatten({ "a.b.c": 1, "a.b.d": 2, "e": 3 });
        expect(result).toEqual({ a: { b: { c: 1, d: 2 } }, e: 3 });
    });

    it("handles a single key with no dots", () => {
        expect(unflatten({ "foo": "bar" })).toEqual({ foo: "bar" });
    });

    it("later values overwrite earlier ones at the same path", () => {
        const flat: Record<string, unknown> = {};
        flat["a.b"] = "first";
        flat["a.b"] = "second";
        expect(unflatten(flat)).toEqual({ a: { b: "second" } });
    });

    it("handles deep nesting", () => {
        expect(unflatten({ "a.b.c.d.e": "deep" })).toEqual({ a: { b: { c: { d: { e: "deep" } } } } });
    });

    it("does not pollute Object.prototype via __proto__", () => {
        const before = ({} as Record<string, unknown>)["polluted"];
        unflatten({ "__proto__.polluted": "yes" });
        const after = ({} as Record<string, unknown>)["polluted"];
        expect(before).toBeUndefined();
        expect(after).toBeUndefined();
    });

    it("handles empty input", () => {
        expect(unflatten({})).toEqual({});
    });

    it("throws when scalar is set, then descends into it", () => {
        // foo="bar" then foo.baz="qux" — can't descend into a string
        expect(() => unflatten({ "foo": "bar", "foo.baz": "qux" })).toThrow(/collision/);
    });

    it("throws when object is set, then overwritten with scalar", () => {
        // foo.baz="qux" then foo="bar" — can't overwrite an object with a scalar
        expect(() => unflatten({ "foo.baz": "qux", "foo": "bar" })).toThrow(/collision/);
    });

    it("allows siblings at the same level", () => {
        expect(unflatten({ "a.b": 1, "a.c": 2 })).toEqual({ a: { b: 1, c: 2 } });
    });
});

// =============================================================================
// deepFreeze
// =============================================================================

describe("deepFreeze", () => {
    it("freezes the top-level object", () => {
        const obj = { a: 1 };
        deepFreeze(obj);
        expect(Object.isFrozen(obj)).toBe(true);
    });

    it("freezes nested objects", () => {
        const obj = { a: { b: { c: 1 } } };
        deepFreeze(obj);
        expect(Object.isFrozen(obj.a)).toBe(true);
        expect(Object.isFrozen(obj.a.b)).toBe(true);
    });

    it("freezes arrays", () => {
        const obj = { list: [1, 2, 3] };
        deepFreeze(obj);
        expect(Object.isFrozen(obj.list)).toBe(true);
    });

    it("is idempotent on already-frozen objects", () => {
        const obj = { a: 1 };
        deepFreeze(obj);
        expect(() => deepFreeze(obj)).not.toThrow();
    });

    it("returns the same reference", () => {
        const obj = { a: 1 };
        expect(deepFreeze(obj)).toBe(obj);
    });

    it("prevents mutation of nested properties", () => {
        const obj: { a: { b: number } } = { a: { b: 1 } };
        deepFreeze(obj);
        expect(() => { obj.a.b = 99; }).toThrow();
    });
});
