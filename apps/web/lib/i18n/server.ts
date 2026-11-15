import { cookies } from "next/headers";
import { dictionary } from "./messages";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from "./locale";

export async function getLocale(): Promise<Locale> {
  const jar = await cookies();
  const value = jar.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getI18n() {
  const locale = await getLocale();
  return { locale, t: dictionary(locale) };
}
