import { isAdminUser, isClientProd } from "../../checks";

/**
 * Check if client-side tracking should be skipped.
 * Used by the sink classes in `./posthog-sinks.client.ts`.
 */
export function shouldSkipClientTracking(): boolean {
    return !isClientProd() || isAdminUser();
}
