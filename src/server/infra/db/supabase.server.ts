import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getConfig } from "@/server/infra/config/index.server";

let dbClient: SupabaseClient | null = null;

/**
 * Get the Supabase database client (singleton).
 * Server-only - uses service-role key for full database access.
 */
export function getDbClient(): SupabaseClient {
    if (dbClient) return dbClient;

    const config = getConfig();
    dbClient = createClient(config.client.supabase.url, config.supabase.secretkey);
    return dbClient;
}
