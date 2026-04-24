/**
 * Check if running in production environment (server-side).
 * Uses Vercel's VERCEL_ENV variable which is automatically set.
 */
export function isServerProd(): boolean {
    return process.env.VERCEL_ENV === "production";
}
