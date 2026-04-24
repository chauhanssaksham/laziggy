import type { ServerConfig } from "../config-schema.server";
import type { ClientConfig } from "@/shared/config/client-config";

/**
 * Sync access to resolved config.
 *
 * Implementations are module-level singletons that initialize once via
 * top-level await. After init, `getConfig()` and `getClientConfig()` are
 * fully synchronous — no awaits at call sites. Stale-while-revalidate
 * handles TTL refresh transparently.
 */
export interface IConfigProvider {
    /** Initialize (called once at module load via top-level await). */
    init(): Promise<void>;

    /** Sync access to full server config. Never blocks. */
    getConfig(): ServerConfig;

    /** Sync access to client-safe subset. Never blocks. */
    getClientConfig(): ClientConfig;
}
