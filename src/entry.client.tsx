import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

import posthog from "posthog-js";
import { PostHogProvider } from "@posthog/react";
import { installTraceHeaders } from "@/client/lib/telemetry/trace-headers.client";
import { installHttpClientMetrics } from "@/client/lib/telemetry/http-client-metrics.client";

// Deployment environment + release ID — both injected at build time via
// vite.config.ts `define`. The `define` block guarantees non-empty string
// values (defaults to "development" / "dev" locally), so no `??` needed here.
// See `src/vite-env.d.ts` for the type declarations.
const deploymentEnv = import.meta.env.VITE_VERCEL_ENV;
const deploymentRelease = import.meta.env.VITE_VERCEL_DEPLOYMENT_ID;

posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_POSTHOG_HOST,
    defaults: "2025-11-30",
});

// Patch fetch for observability. Order matters: metrics FIRST (inner
// wrapper), trace-headers SECOND (outer wrapper). At call time,
// trace-headers injects the `traceparent` header, then the metrics
// wrapper reads it to derive `requestId` before calling the real fetch.
installHttpClientMetrics();
installTraceHeaders();

// Register super-properties that appear on every event.
// `env`      — deployment environment for dashboard filtering.
// `$release` — matches the --release flag in the postbuild sourcemap upload
//              so PostHog can symbolicate stack traces against the right map.
posthog.register({
    env: deploymentEnv,
    $release: deploymentRelease,
});

// Stop session recording in non-prod to avoid replay billing on
// local / preview traffic. Events still flow (so plumbing is testable);
// only the recording is suppressed.
if (deploymentEnv !== "production") {
    posthog.stopSessionRecording();
}

// Logger / metrics sinks are wired at construction time in their facades
// (`logger.client.ts` / `metrics.client.ts`). The anonymous ID flows to the
// server via PostHog's JS-readable cookie, which the browser attaches to
// every same-origin request automatically — no client-side interception
// needed. See HttpRequestContextProvider.extractAnonymousId() + the
// `extractPostHogDistinctId` helper in posthog.server.ts.

startTransition(() => {
    hydrateRoot(
        document,
        <PostHogProvider client={posthog}>
            <StrictMode>
                <HydratedRouter />
            </StrictMode>
        </PostHogProvider>
    );
});
