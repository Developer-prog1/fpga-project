export const LOCALES = ["en", "ru", "am"] as const;

export type Locale = (typeof LOCALES)[number];

export const URL_LOCALES = ["hy", "en", "ru"] as const;

export type UrlLocale = (typeof URL_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "am";

export const LOCALE_COOKIE = "locale";

export const LOCALE_HEADER = "x-locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "en" || value === "ru" || value === "am";
}

export function isUrlLocale(value: string | undefined | null): value is UrlLocale {
  return value === "hy" || value === "en" || value === "ru";
}

export function urlLocale(locale: Locale): UrlLocale {
  return locale === "am" ? "hy" : locale;
}

export function localeFromUrl(value: string | undefined | null): Locale | null {
  if (value === "hy" || value === "am") return "am";
  if (value === "en" || value === "ru") return value;
  return null;
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

const LOCALE_PREFIX = /^\/(hy|en|ru|am)(?=\/|$)/;

export function stripLocalePath(pathname: string) {
  const bare = pathname.replace(LOCALE_PREFIX, "");
  return bare === "" ? "/" : bare;
}

export function localizeHref(locale: Locale, href: string) {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const hashAt = href.indexOf("#");
  const hash = hashAt >= 0 ? href.slice(hashAt) : "";
  const beforeHash = hashAt >= 0 ? href.slice(0, hashAt) : href;
  const queryAt = beforeHash.indexOf("?");
  const query = queryAt >= 0 ? beforeHash.slice(queryAt) : "";
  const path = queryAt >= 0 ? beforeHash.slice(0, queryAt) : beforeHash;
  const bare = stripLocalePath(path);
  const prefix = `/${urlLocale(locale)}`;
  return `${bare === "/" ? prefix : `${prefix}${bare}`}${query}${hash}`;
}
