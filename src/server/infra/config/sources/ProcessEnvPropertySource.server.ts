import type { IPropertySource } from "./IPropertySource.server";

/**
 * Reads config from `process.env` with a single auto-conversion rule:
 * lowercase + `_` → `.`.
 *
 *   `SUPABASE_SECRETKEY`       → `supabase.secretkey`
 *   `SESSION_HMACSECRET`       → `session.hmacsecret`
 *   `AI_GEMINIKEY`             → `ai.geminikey`
 *   `VERCEL_ENV`               → `vercel.env`
 *   `VERCEL_GIT_COMMIT_SHA`    → `vercel.git.commit.sha`
 *   `NODE_ENV`                 → `node.env`
 *   `PATH`                     → `path`
 *
 * `VITE_*` vars additionally get prepended with `client.`:
 *   `VITE_POSTHOG_KEY`         → `client.posthog.key`
 *   `VITE_SUPABASE_URL`        → `client.supabase.url`
 *
 * No deny list. Env vars not in the schema (`npm_*`, `TURBO_*`, etc.) are
 * silently stripped by Zod during validation. The schema is the allowlist.
 */
export class ProcessEnvPropertySource implements IPropertySource {
    readonly name = "process-env";

    async load(): Promise<Record<string, unknown>> {
        const out: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(process.env)) {
            if (value === undefined) continue;

            if (key.startsWith("VITE_")) {
                out["client." + key.slice(5).toLowerCase().replace(/_/g, ".")] = value;
            } else {
                out[key.toLowerCase().replace(/_/g, ".")] = value;
            }
        }

        // Drop scalar keys whose path is also used as a namespace prefix by
        // another key. Examples:
        //   - Vercel: `VERCEL=1` + `VERCEL_BRANCH_URL=...` → drop `vercel` scalar
        //   - Terminal: `TERM_PROGRAM=iTerm.app` + `TERM_PROGRAM_VERSION=3.5`
        //     → drop `term.program` scalar
        // Any scalar would collide with its namespaced descendants during unflatten.
        // The schema silently strips anything unused, so losing these is fine.
        const allPaths = Object.keys(out);
        const ancestorPaths = new Set<string>();
        for (const path of allPaths) {
            const parts = path.split(".");
            for (let i = 1; i < parts.length; i++) {
                ancestorPaths.add(parts.slice(0, i).join("."));
            }
        }
        for (const ancestor of ancestorPaths) {
            if (ancestor in out) delete out[ancestor];
        }

        return out;
    }
}
