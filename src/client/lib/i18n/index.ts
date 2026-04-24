import { createContext, useCallback, useContext } from "react";
import type { Locale } from "@/shared/lib/i18n";
import { en, type I18nKey } from "./translations/en";
import { fr } from "./translations/fr";
import { zh } from "./translations/zh";
import { ko } from "./translations/ko";
import { ja } from "./translations/ja";
import { es } from "./translations/es";

export type { I18nKey } from "./translations/en";

const strings: Record<Locale, Record<I18nKey, string>> = {
    en,
    es,
    fr,
    zh,
    ko,
    ja,
};

/** Look up a translated string by key */
export function t(locale: Locale, key: I18nKey): string {
    return strings[locale]?.[key] ?? strings.en[key];
}

// --- React context ---

const LocaleContext = createContext<Locale>("en");

export const LocaleProvider = LocaleContext.Provider;

/** Hook that returns a stable `t(key)` function bound to the current locale from context. */
export function useT(): (key: I18nKey) => string {
    const locale = useContext(LocaleContext);
    return useCallback((key: I18nKey) => t(locale, key), [locale]);
}

/** Hook that returns the current locale from context. */
export function useLocale(): Locale {
    return useContext(LocaleContext);
}
