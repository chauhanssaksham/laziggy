import { describe, it, expect } from "vitest";
import { hasAdminCookie } from "@/shared/lib/checks";

describe("hasAdminCookie", () => {
    it("returns false for null", () => {
        expect(hasAdminCookie(null)).toBe(false);
    });

    it("returns false for undefined", () => {
        expect(hasAdminCookie(undefined)).toBe(false);
    });

    it("returns false for empty string", () => {
        expect(hasAdminCookie("")).toBe(false);
    });

    it("returns true when the admin cookie is present alone", () => {
        expect(hasAdminCookie("__vercel_toolbar=abc123")).toBe(true);
    });

    it("returns true when the admin cookie is present with an empty value", () => {
        expect(hasAdminCookie("__vercel_toolbar=")).toBe(true);
    });

    it("returns true when the admin cookie is present among other cookies", () => {
        expect(hasAdminCookie("session=xyz; __vercel_toolbar=abc; theme=dark")).toBe(true);
    });

    it("returns false when the admin cookie is absent", () => {
        expect(hasAdminCookie("session=xyz; theme=dark")).toBe(false);
    });

    it("returns false for a cookie that shares the prefix but is longer", () => {
        expect(hasAdminCookie("__vercel_toolbar_extra=abc")).toBe(false);
    });

    it("returns true when the cookie has a leading space after a semicolon", () => {
        expect(hasAdminCookie("session=xyz;  __vercel_toolbar=abc")).toBe(true);
    });

    it("returns false when the target string appears only inside a value", () => {
        expect(hasAdminCookie("other=has__vercel_toolbar=abc")).toBe(false);
    });
});
