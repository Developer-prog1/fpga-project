"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n-provider";
import { LOCALES, LOCALE_COOKIE, type Locale } from "@/lib/i18n/locale";

const LABEL: Record<Locale, string> = { en: "EN", ru: "RU", am: "AM" };

export function LanguageSwitcher() {
  const { locale, t } = useI18n();
  const router = useRouter();

  function select(next: Locale) {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    router.refresh();
  }

  return (
    <div className="lang-switch" role="group" aria-label={t.lang.group}>
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          lang="en"
          aria-pressed={code === locale}
          onClick={() => select(code)}
        >
          {LABEL[code]}
        </button>
      ))}
    </div>
  );
}
