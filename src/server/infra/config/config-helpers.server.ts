/**
 * Try to JSON-parse string values in a flat map, in place.
 *
 * Env vars are always strings. Complex values (arrays, objects) arrive
 * as JSON strings like `'["a","b"]'` or `'{"key":"val"}'`. This parses
 * them before Zod validates, so schemas can use plain `z.array(z.string())`
 * without needing a wrapper.
 *
 * Non-JSON strings (e.g. `"s3cr3t"`) fail JSON.parse silently and stay
 * as strings. Already-parsed values (from Supabase JSONB) aren't strings,
 * so they're skipped.
 *
 * Caveat: secrets that happen to be valid JSON (`"true"`, `"null"`,
 * `"12345"`) will be coerced to their parsed type. Use distinctive
 * secret values to avoid this edge case.
 */
export function parseJsonValues(map: Record<string, unknown>): void {
    for (const key of Object.keys(map)) {
        const value = map[key];
        if (typeof value === "string") {
            try { map[key] = JSON.parse(value); } catch { /* keep as string */ }
        }
    }
}
