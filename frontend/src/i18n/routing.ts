export const locales = ["lv", "ru", "en"] as const;
export const defaultLocale: AppLocale = "lv";
export type AppLocale = (typeof locales)[number];
export const localePrefix = "always" as const;