"use client";

import { createContext, useContext, useEffect } from "react";
import { dictionary } from "@/lib/i18n/messages";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { htmlLang, type Locale } from "@/lib/i18n/locale";

const I18nContext = createContext<{ locale: Locale; t: Dictionary } | null>(null);

export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.lang = htmlLang(locale);
  }, [locale]);

  return <I18nContext.Provider value={{ locale, t: dictionary(locale) }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error("Language provider is missing");
  return value;
}
