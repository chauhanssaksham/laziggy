import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { IPropertySource } from "./IPropertySource.server";

/**
 * Reads config from the `app_config` Supabase table.
 *
 * Each row is `(key, value)` where key is a dot-path (e.g. `features.chat.enabled`)
 * and value is a string. Values that look like JSON (arrays, objects, booleans,
 * numbers) get auto-parsed downstream via `parseJsonValues`.
 *
 * **Why direct `process.env` for connection creds**: this source runs during
 * `ConfigProvider.init()`, which is itself what populates `getConfig()`. Using
 * `getDbClient()` here would create a circular dependency (supabase.server.ts
 * imports getConfig). Reading VITE_SUPABASE_URL + SUPABASE_SECRETKEY directly
 * is the bootstrap escape hatch — same env vars, just accessed before the
 * config system is ready.
 *
 * **Priority**: wire this source AFTER `ProcessEnvPropertySource` in the
 * resolver array so Supabase values override env vars for any overlapping key.
 *
 * **Graceful failure**: if the table doesn't exist or the query fails, logs
 * and returns empty. env config is then the only source — boot succeeds.
 */
export class SupabasePropertySource implements IPropertySource {
    readonly name = "supabase-app-config";

    private db: SupabaseClient | null = null;

    private getDb(): SupabaseClient {
        if (this.db) return this.db;
        const url = process.env.VITE_SUPABASE_URL;
        const key = process.env.SUPABASE_SECRETKEY;
        if (!url || !key) {
            throw new Error("SupabasePropertySource: VITE_SUPABASE_URL or SUPABASE_SECRETKEY missing from env");
        }
        this.db = createClient(url, key);
        return this.db;
    }

    async load(): Promise<Record<string, unknown>> {
        try {
            const { data, error } = await this.getDb()
                .from("app_config")
                .select("key, value");

            if (error) {
                console.warn(`[Config] SupabasePropertySource query failed, falling back to env only: ${error.message}`);
                return {};
            }

            const out: Record<string, unknown> = {};
            for (const row of data ?? []) {
                out[row.key] = row.value;
            }
            return out;
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            console.warn(`[Config] SupabasePropertySource load failed, falling back to env only: ${message}`);
            return {};
        }
    }
}
