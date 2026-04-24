/**
 * Expand a flat dot-keyed map into a nested object.
 *
 *   { "a.b.c": 1, "a.b.d": 2, "e": 3 }
 * → { a: { b: { c: 1, d: 2 } }, e: 3 }
 *
 * Uses `Object.create(null)` for all intermediate objects to prevent
 * prototype pollution — an input key like `__proto__.x` becomes a plain
 * key, not a backdoor into `Object.prototype`.
 *
 * Throws on scalar ↔ object collisions (e.g. both `foo=bar` and
 * `foo.baz=qux` set). Otherwise one value silently overwrites the
 * other, with behavior depending on iteration order — which can cause
 * tests to pass but production to fail, or vice versa.
 */
export function unflatten(flat: Record<string, unknown>): Record<string, unknown> {
    const out = Object.create(null) as Record<string, unknown>;
    for (const [key, value] of Object.entries(flat)) {
        const parts = key.split(".");
        let cursor = out;
        for (let i = 0; i < parts.length - 1; i++) {
            const segment = parts[i];
            const next = cursor[segment];
            if (next === undefined) {
                cursor[segment] = Object.create(null) as Record<string, unknown>;
            } else if (next === null || typeof next !== "object") {
                throw new Error(
                    `Key collision: "${key}" wants to descend into "${parts.slice(0, i + 1).join(".")}", but that path is already set to a scalar value. Remove one of the conflicting keys.`,
                );
            }
            cursor = cursor[segment] as Record<string, unknown>;
        }
        const lastSegment = parts[parts.length - 1];
        const existing = cursor[lastSegment];
        if (existing !== undefined && existing !== null && typeof existing === "object") {
            throw new Error(
                `Key collision: "${key}" wants to set a scalar, but that path is already a nested object. Remove one of the conflicting keys.`,
            );
        }
        cursor[lastSegment] = value;
    }
    return out;
}

/**
 * Recursively freeze an object and all nested objects/arrays.
 * Prevents accidental mutation of shared state.
 *
 * Idempotent — safe to call on already-frozen objects.
 */
export function deepFreeze<T>(obj: T): T {
    Object.freeze(obj);
    for (const val of Object.values(obj as Record<string, unknown>)) {
        if (val && typeof val === "object" && !Object.isFrozen(val)) {
            deepFreeze(val);
        }
    }
    return obj;
}
