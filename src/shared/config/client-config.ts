import { z } from "zod";

/**
 * Client-safe config schema.
 *
 * Only properties defined here can reach the browser. The server config
 * schema nests this under `client`, and `getClientConfig()` returns
 * exactly this shape — server-only secrets cannot leak by construction.
 *
 * Uses `z.object()` (silent strip) so operators can set extra `VITE_*`
 * vars (e.g. for local debugging) without breaking boot. Only keys
 * defined here appear in `ClientConfig`.
 *
 * Shared between server and client (lives in `src/shared/`).
 */
export const clientConfigSchema = z.object({
    /** Current deployment environment — used to tag PostHog events so
     *  dashboards can filter by env. Always defined; defaults to
     *  "development" when VERCEL_ENV isn't set (local / test). */
    env: z.enum(["production", "preview", "development"]).default("development"),
    supabase: z.object({
        url: z.string().min(1),
    }),
    posthog: z.object({
        key: z.string().min(1).optional(),
        host: z.string().min(1).optional(),
    }).default({}),
});

export type ClientConfig = z.infer<typeof clientConfigSchema>;
