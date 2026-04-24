export const SUPPORTED_LOCALES = ["en", "es", "fr", "zh", "ko", "ja"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

const LOCALE_NAMES: Record<Locale, string> = {
    en: "English",
    es: "Spanish",
    fr: "French",
    zh: "Chinese",
    ko: "Korean",
    ja: "Japanese",
};

export function getLocaleName(locale: Locale): string {
    return LOCALE_NAMES[locale];
}

/** Validate a raw string as a supported locale, or return null. */
export function parseLocale(raw: string | null | undefined): Locale | null {
    if (!raw) return null;
    const code = raw.trim().toLowerCase();
    return (SUPPORTED_LOCALES as readonly string[]).includes(code)
        ? (code as Locale)
        : null;
}

/** Parse Accept-Language header → best supported locale */
export function detectLocale(acceptLanguage: string | null): Locale {
    if (!acceptLanguage) return DEFAULT_LOCALE;
    const preferred = acceptLanguage
        .split(",")
        .map((part) => {
            const [langPart, qPart] = part.trim().split(";");
            const code = langPart.trim().split("-")[0].toLowerCase();
            const q = qPart ? parseFloat(qPart.trim().replace("q=", "")) : 1.0;
            return { code, q: Number.isFinite(q) ? q : 1.0 };
        })
        .sort((a, b) => b.q - a.q)
        .find(({ code }) => (SUPPORTED_LOCALES as readonly string[]).includes(code));
    return (preferred?.code as Locale) ?? DEFAULT_LOCALE;
}
