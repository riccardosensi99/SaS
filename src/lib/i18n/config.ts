export const locales = ["en", "it"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export function getMessages(locale: Locale) {
  return import(`./locales/${locale}.json`).then((m) => m.default);
}
