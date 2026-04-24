/**
 * Run a promise as a background task that survives the current request.
 *
 * On Vercel, the serverless function would normally terminate after the response
 * is sent — `waitUntil` extends its lifetime until the promise resolves so
 * fire-and-forget DB writes (analytics, telemetry) actually complete.
 *
 * In local dev, Vercel's waitUntil is a no-op, but the Node process is long-lived
 * so the promise resolves naturally.
 *
 * If we migrate off Vercel, swap the implementation here in one place — e.g.
 * Cloudflare Workers expects `event.waitUntil(promise)`, Lambda has no equivalent.
 */

import { waitUntil } from "@vercel/functions";

export function fireAndForget(promise: Promise<unknown>): void {
    waitUntil(promise);
}
