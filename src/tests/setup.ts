import { beforeEach, vi } from "vitest";

// Silence Pino in tests — must run before any test file imports logger.server.ts.
// "silent" disables all log output; tests can still assert on sink/metric calls
// by overriding setExceptionSink / setMetricSink with spies.
process.env.LOG_LEVEL = "silent";

// Minimum config to satisfy serverConfigSchema when tests transitively import
// the observability stack (api-handler → logger → posthog-sink → posthog.server
// → config/index.server with top-level `await provider.init()`). Dummy values
// are fine — tests that actually touch Supabase/Gemini use fakes, not real
// clients. PostHog key/host are intentionally omitted — getPostHog() returns
// null when they're absent, so sinks are no-ops in test (no network calls).
process.env.VITE_SUPABASE_URL ??= "https://test.supabase.invalid";
process.env.SUPABASE_SECRETKEY ??= "test-secret";
process.env.SESSION_HMACSECRET ??= "test-hmac-secret-at-least-some-length";
process.env.AI_GEMINIKEY ??= "test-gemini-key";

// Reset all mocks before each test
beforeEach(() => {
    vi.clearAllMocks();
});
