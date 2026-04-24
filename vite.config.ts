import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ isSsrBuild }) => ({
    plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    define: {
        // Expose VERCEL_DEPLOYMENT_ID to client-side code for PostHog release
        // tagging (used with `posthog.register({ $release: ... })`). Vercel
        // injects this at build time; local builds fall back to "dev".
        // NOTE: if you change the key name here, update entry.client.tsx too.
        "import.meta.env.VITE_VERCEL_DEPLOYMENT_ID": JSON.stringify(
            process.env.VERCEL_DEPLOYMENT_ID ?? "dev",
        ),
        // Expose VERCEL_ENV for PostHog env super-property tagging.
        // Vercel injects this as "production" | "preview" | "development";
        // local builds get "development".
        "import.meta.env.VITE_VERCEL_ENV": JSON.stringify(
            process.env.VERCEL_ENV ?? "development",
        ),
    },
    build: {
        // es2022 needed for top-level await in
        // src/server/infra/config/index.server.ts.
        target: "es2022",
        // Client build: "hidden" generates sourcemap files without
        // `//# sourceMappingURL=` references so PostHog can upload them for
        // readable prod stack traces; browsers can't download them directly.
        //
        // SSR build: `true` emits external `.map` files alongside each JS
        // file, with a `//# sourceMappingURL=` comment so Node's
        // `--enable-source-maps` (set as NODE_OPTIONS on Vercel) consults
        // them when constructing `err.stack`. The external-file form is
        // also what `@posthog/cli sourcemap upload` picks up during
        // postbuild, giving PostHog Error Tracking source context on
        // server frames — a strict upgrade over embedded inline maps,
        // which the CLI cannot upload.
        //
        // build/server/ is never served to the browser on Vercel — only
        // the Node runtime reads it — so exposing external `.map` files
        // there is not a leak.
        //
        // ⚠ Known cosmetic warning: RR7's build plugin emits
        //     "Source maps are enabled in production. This makes your
        //      server code publicly visible in the browser."
        //   …whenever sourcemap is truthy anywhere in the resolved config.
        //   See note above; the warning is benign.
        sourcemap: isSsrBuild ? true : "hidden",
    },
    ssr: {
        noExternal: ['posthog-js', '@posthog/react'],
        target: "node",
    },
}));
