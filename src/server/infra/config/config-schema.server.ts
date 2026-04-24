import { z } from "zod";
import { clientConfigSchema } from "@/shared/config/client-config";

/**
 * Full server config schema.
 *
 * The client-safe subset is nested under `client` (imported from `src/shared/`),
 * so server secrets and the public subset live in structurally separate subtrees.
 * `getClientConfig()` returns only `config.client` — server-only secrets are
 * physically unreachable from anything that serializes to the browser.
 *
 * Uses `z.object()` (NOT strict) — unknown keys are silently stripped. This
 * means:
 *   - Platform-injected env vars (npm_*, TURBO_*, etc.) land as dot-keys
 *     but get stripped here without breaking boot.
 *   - Operators can add arbitrary env vars in Vercel without breaking us.
 *   - Trade-off: typos in our OWN config env vars go undetected until
 *     downstream code fails with `undefined`.
 *
 * Platform-injected env vars we actually read (VERCEL_*, NODE_ENV, PATH, etc.)
 * are modeled as optional so they don't break boot in local/dev where they're
 * missing.
 */
export const serverConfigSchema = z.object({
    /** Client-safe subset — serialized to the browser via the root loader. */
    client: clientConfigSchema,

    /** Server-only secrets and app config. */
    supabase: z.object({
        secretkey: z.string().min(1),
    }),

    /** Logger config. `LOG_LEVEL` env var feeds `log.level` via the env source. */
    log: z.object({
        level: z
            .enum(["trace", "debug", "info", "warn", "error", "fatal", "silent"])
            .default("info"),
    }).default({ level: "info" }),

    // ── Platform-injected (only the ones we actually read) ────────────────
    // Schema is non-strict, so any other platform vars (USER, TERM, PATH,
    // npm_*, TURBO_*, etc.) get silently stripped — no need to declare them.

    vercel: z.object({
        // Default to "development" so `getConfig().vercel.env` is always a
        // usable string — no `?? "development"` at call sites.
        env: z.enum(["production", "preview", "development"]).default("development"),
        url: z.string().optional(),
        region: z.string().optional(),
    }).default({ env: "development" }),

    node: z.object({
        env: z.string().optional(),
    }).optional(),
});

export type ServerConfig = z.infer<typeof serverConfigSchema>;
