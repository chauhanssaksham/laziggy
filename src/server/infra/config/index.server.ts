import { ConfigProvider } from "./provider/ConfigProvider.server";
import { ProcessEnvPropertySource } from "./sources/ProcessEnvPropertySource.server";
import { SupabasePropertySource } from "./sources/SupabasePropertySource.server";

import type { ServerConfig } from "./config-schema.server";
import type { ClientConfig } from "@/shared/config/client-config";

// Sources are ordered by priority — later sources override earlier ones.
// Supabase comes AFTER env so dynamic overrides can shadow static env vars.
const provider = new ConfigProvider([
    new ProcessEnvPropertySource(),
    new SupabasePropertySource(),
]);

// ── @PostConstruct: top-level await, runs once per cold start ──
try {
    await provider.init();
} catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[Config] Failed to initialize. Check your env vars.\n${message}`);
    throw err;
}

/** Sync access to the full server config. */
export function getConfig(): ServerConfig {
    return provider.getConfig();
}

/** Sync access to the client-safe config subset. */
export function getClientConfig(): ClientConfig {
    return provider.getClientConfig();
}

export type { ServerConfig } from "./config-schema.server";
export type { ClientConfig } from "@/shared/config/client-config";
