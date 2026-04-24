/**
 * Client-side environment checks and admin detection.
 */

import { hasAdminCookie } from "@/shared/lib/checks";

/**
 * Check if running in production environment (client-side).
 */
export function isClientProd(): boolean {
    if (typeof window === "undefined") return false;
    return import.meta.env.MODE === "production";
}

/**
 * Check if the current user is an admin (client-side).
 */
export function isAdminUser(): boolean {
    if (typeof document === "undefined") return false;
    if (hasAdminCookie(document.cookie)) return true;
    const params = new URLSearchParams(window.location.search);
    if (params.has("isAdmin")) return true;
    return false;
}

/**
 * Read the table ID from the ?table= query param. Returns undefined if missing or invalid.
 */
export function getTableId(): string | undefined {
    if (typeof window === "undefined") return undefined;
    const raw = new URLSearchParams(window.location.search).get("table");
    return raw && /^[a-zA-Z0-9_-]{1,20}$/.test(raw) ? raw : undefined;
}
