export const LOCALES = ["en", "ru", "am"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "am";

export const LOCALE_COOKIE = "locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "en" || value === "ru" || value === "am";
}

export function htmlLang(locale: Locale) {
  if (locale === "am") return "hy";
  return locale;
}

export function intlLocale(locale: Locale) {
  if (locale === "am") return "hy-AM";
  if (locale === "ru") return "ru-RU";
  return "en-GB";
}
