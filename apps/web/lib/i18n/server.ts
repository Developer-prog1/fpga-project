import { cookies, headers } from "next/headers";
import { dictionary } from "./messages";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, LOCALE_HEADER, type Locale } from "./locale";

export async function getLocale(): Promise<Locale> {
  const header = (await headers()).get(LOCALE_HEADER);
  if (isLocale(header)) return header;
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getI18n() {
  const locale = await getLocale();
  return { locale, t: dictionary(locale) };
}
