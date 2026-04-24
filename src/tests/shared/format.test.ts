import { describe, it, expect } from "vitest";
import { formatPrice } from "@/shared/lib/format";

describe("formatPrice", () => {
    it("returns null when price is undefined", () => {
        expect(formatPrice(undefined, "USD")).toBeNull();
    });

    it("formats zero as $0.00 — zero is a valid price, not undefined", () => {
        expect(formatPrice(0, "USD")).toBe("$0.00");
    });

    it("formats one cent correctly — divide-by-100 boundary", () => {
        expect(formatPrice(1, "USD")).toBe("$0.01");
    });

    it("formats a standard USD amount", () => {
        expect(formatPrice(550, "USD")).toBe("$5.50");
    });

    it("formats PHP correctly", () => {
        expect(formatPrice(100000, "PHP")).toBe("₱1,000.00");
    });

    it("formats INR correctly", () => {
        expect(formatPrice(7500, "INR")).toBe("₹75.00");
    });

    it("formats EUR correctly", () => {
        expect(formatPrice(9900, "EUR")).toBe("€99.00");
    });

    it("formats a large USD amount with thousands separator", () => {
        expect(formatPrice(1_000_000, "USD")).toBe("$10,000.00");
    });

    it("formats a large PHP amount correctly", () => {
        expect(formatPrice(99_999_999, "PHP")).toBe("₱999,999.99");
    });

    it("formats a large INR amount correctly", () => {
        expect(formatPrice(1_000_000_000, "INR")).toBe("₹10,000,000.00");
    });

    it("formats a negative price as a negative currency string", () => {
        expect(formatPrice(-550, "USD")).toBe("-$5.50");
    });

    it("throws for NaN — signals a programming error upstream", () => {
        expect(() => formatPrice(NaN, "USD")).toThrow();
    });

    it("throws for Infinity — signals a programming error upstream", () => {
        expect(() => formatPrice(Infinity, "USD")).toThrow();
    });

    it("formats an unknown-but-valid ISO 4217 code — XYZ is a valid 3-letter code, Intl accepts it", () => {
        const result = formatPrice(550, "XYZ");
        expect(result).toContain("XYZ");
        expect(result).toContain("5.50");
    });

    it("throws for an invalid currency code", () => {
        expect(() => formatPrice(550, "INVALID")).toThrow();
    });
});
