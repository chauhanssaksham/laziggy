/**
 * A source of configuration properties.
 *
 * Implementations return flat dot-keyed maps; the resolver merges them
 * in priority order, unflattens, and hands the result to Zod for parsing.
 *
 * Priority is determined by ordering in the resolver's source array —
 * later sources override earlier ones (same convention as Spring's
 * ordered `PropertySource`s).
 *
 * Example shape returned by `load()`:
 *   {
 *     "client.supabase.url": "https://xxx.supabase.co",
 *     "supabase.secretkey":  "eyJ...",
 *     "vercel.env":          "production",
 *   }
 */
export interface IPropertySource {
    /** Human-readable name for logging/debugging. */
    readonly name: string;

    /** Load all properties as a flat dot-keyed map. */
    load(): Promise<Record<string, unknown>>;
}
