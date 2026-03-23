import { getRequestConfig } from "next-intl/server";
import { defaultLocale, locales, type AppLocale } from "./routing";

export default getRequestConfig(async ({ locale }) => {
  const resolved = (locales as readonly string[]).includes(locale as string)
    ? (locale as AppLocale)
    : defaultLocale;

  return {
    locale: resolved,
    messages: (await import(`../messages/${resolved}.json`)).default,
  };
});
