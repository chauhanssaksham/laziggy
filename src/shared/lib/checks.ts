const VERCEL_TOOLBAR_COOKIE = "__vercel_toolbar";

/**
 * Check if the cookie string contains admin credentials.
 * Shared between server (admin.server.ts) and client (checks.client.ts).
 */
export function hasAdminCookie(cookieString: string | null | undefined): boolean {
    if (!cookieString) return false;
    return cookieString
        .split(";")
        .some((cookie) => cookie.trim().startsWith(`${VERCEL_TOOLBAR_COOKIE}=`));
}
