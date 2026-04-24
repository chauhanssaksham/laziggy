/**
 * Centralized z-index layers to prevent conflicts.
 *
 * App-level layers compete in the root stacking context.
 * Phone-mockup layers live inside HandHeldPhoneMockup (no parent stacking context).
 * Menu layers are isolated inside DynamicDemoContainer's `isolate` context.
 */

// --- App-level (root stacking context) ---
export const Z_HEADER = 50;
export const Z_STICKY_CTA = 50;
export const Z_FULLSCREEN = 60;

// --- Modal (above everything app-level) ---
export const Z_MODAL_BACKDROP = 70;
export const Z_MODAL = 80;

// --- Phone mockup (inside HandHeldPhoneMockup) ---
export const Z_DEMO_OVERLAY = 5;
export const Z_PHONE_FRAME = 10;
