import { describe, it, expect } from "vitest";
import { parseLocale, detectLocale, getLocaleName } from "@/shared/lib/i18n";
import type { Locale } from "@/shared/lib/i18n";

describe("parseLocale", () => {
    it("returns null for null", () => {
        expect(parseLocale(null)).toBeNull();
    });

    it("returns null for undefined", () => {
        expect(parseLocale(undefined)).toBeNull();
    });

    it("returns null for empty string", () => {
        expect(parseLocale("")).toBeNull();
    });

    it("returns the locale for a valid lowercase code", () => {
        expect(parseLocale("en")).toBe("en");
    });

    it("returns the locale for a less common supported code", () => {
        expect(parseLocale("ko")).toBe("ko");
    });

    it("normalizes uppercase input to lowercase", () => {
        expect(parseLocale("FR")).toBe("fr");
    });

    it("trims surrounding whitespace", () => {
        expect(parseLocale("  es  ")).toBe("es");
    });

    it("returns null for an unsupported locale", () => {
        expect(parseLocale("de")).toBeNull();
    });

    it("returns null for en-US — does not strip regions unlike detectLocale", () => {
        expect(parseLocale("en-US")).toBeNull();
    });

    it("returns null for zh-CN — does not strip regions", () => {
        expect(parseLocale("zh-CN")).toBeNull();
    });
});

describe("detectLocale", () => {
    it("returns the default locale for a null header", () => {
        expect(detectLocale(null)).toBe("en");
    });

    it("returns the default locale for an empty header", () => {
        expect(detectLocale("")).toBe("en");
    });

    it("returns a directly matched supported locale", () => {
        expect(detectLocale("fr")).toBe("fr");
    });

    it("strips region code — fr-FR resolves to fr", () => {
        expect(detectLocale("fr-FR")).toBe("fr");
    });

    it("strips region code — zh-CN resolves to zh", () => {
        expect(detectLocale("zh-CN")).toBe("zh");
    });

    it("returns the default for an unsupported locale", () => {
        expect(detectLocale("de")).toBe("en");
    });

    it("returns the first supported locale from a comma-separated list", () => {
        expect(detectLocale("de,fr,en")).toBe("fr");
    });

    it("returns the default when all locales in the list are unsupported", () => {
        expect(detectLocale("de,nl,sv")).toBe("en");
    });

    it("respects q-value weights — higher q wins over list position", () => {
        expect(detectLocale("fr;q=0.3,ko;q=0.9")).toBe("ko");
    });
});

describe("getLocaleName", () => {
    it.each([
        { locale: "en", expected: "English" },
        { locale: "es", expected: "Spanish" },
        { locale: "fr", expected: "French" },
        { locale: "zh", expected: "Chinese" },
        { locale: "ko", expected: "Korean" },
        { locale: "ja", expected: "Japanese" },
    ])("returns $expected for $locale", ({ locale, expected }) => {
        expect(getLocaleName(locale as Locale)).toBe(expected);
    });
});
