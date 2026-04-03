import { getRequestConfig } from "next-intl/server";
import { defaultLocale, type Locale } from "./lib/i18n/config";

export default getRequestConfig(async ({ locale }) => {
  const resolvedLocale = (locale || defaultLocale) as Locale;
  return {
    messages: (await import(`./lib/i18n/locales/${resolvedLocale}.json`)).default,
  };
});
