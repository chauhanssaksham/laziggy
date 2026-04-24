import { isServerProd } from "./env.server";
import { hasAdminCookie } from "@/shared/lib/checks";

/**
 * Check if the request is from an admin user (server-side).
 * In production: detects Vercel team members via the toolbar authentication cookie.
 * In dev: also accepts `x-admin: 1` header for local testing.
 */
export function isAdminRequest(request: Request): boolean {
    if (hasAdminCookie(request.headers.get("cookie"))) {
        return true;
    }

    try {
        const url = new URL(request.url);
        if (url.searchParams.has("isAdmin")) return true;
    } catch {
        // malformed URL
    }

    if (!isServerProd() && request.headers.get("x-admin") === "1") {
        return true;
    }

    return false;
}

/**
 * Check if server-side tracking should be skipped.
 * Returns true if request is from admin OR not in production.
 */
export function shouldSkipServerTracking(request?: Request): boolean {
    if (!isServerProd()) return true;
    if (request && isAdminRequest(request)) return true;
    return false;
}
