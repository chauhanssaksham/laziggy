/// <reference types="vite/client" />

/**
 * Typed `import.meta.env` keys. Declaring these narrows the Vite defaults
 * from `string | undefined` to precise types, which lets call sites drop
 * `?? "development"` fallbacks when the value is guaranteed by a `define`
 * block in vite.config.ts.
 *
 * When adding a new `VITE_*` env var, declare it here AND make sure it's
 * either set in `.env.*` files / Vercel env vars or injected via
 * `vite.config.ts`'s `define` with a safe default.
 */
interface ImportMetaEnv {
    /** Deployment env — `VERCEL_ENV` from Vercel, or `"development"` locally.
     *  Injected via vite.config.ts `define` with a default, so never undefined. */
    readonly VITE_VERCEL_ENV: "production" | "preview" | "development";

    /** Deployment ID — `VERCEL_DEPLOYMENT_ID` from Vercel, or `"dev"` locally.
     *  Used as PostHog's `$release` for sourcemap matching. Injected with a
     *  default, so never undefined. */
    readonly VITE_VERCEL_DEPLOYMENT_ID: string;

    /** PostHog public project key (`phc_…`). Set in `.env.local` and Vercel
     *  project env vars. May be empty string / undefined in test envs. */
    readonly VITE_POSTHOG_KEY: string;

    /** PostHog ingest host, e.g. `https://us.i.posthog.com`. */
    readonly VITE_POSTHOG_HOST: string;

    /** Supabase project URL. Set in `.env.local` and Vercel project env vars. */
    readonly VITE_SUPABASE_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
