const STORAGE_KEY = "laziggy_client_id";

/**
 * Get the current user ID.
 *
 * For anonymous users: returns 'anon_{uuid}' (creates one if needed)
 * For authenticated users (future): returns the actual user ID
 *
 * Returns empty string during SSR.
 */
export function getUserId(): string {
    if (typeof window === "undefined") return "";

    // TODO: When auth is added, check for authenticated user first

    let clientId = localStorage.getItem(STORAGE_KEY);
    if (!clientId) {
        clientId = crypto.randomUUID();
        localStorage.setItem(STORAGE_KEY, clientId);
    }
    return `anon_${clientId}`;
}
