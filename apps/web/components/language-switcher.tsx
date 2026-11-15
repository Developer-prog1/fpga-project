"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n-provider";
import { localizeHref, LOCALES, stripLocalePath, urlLocale, type Locale } from "@/lib/i18n/locale";

function Chevron() {
  return (
    <svg viewBox="0 0 16 16" className="lang-chevron" aria-hidden>
      <path
        d="M4 6.2 8 10l4-3.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LanguageSwitcher() {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const current = urlLocale(locale);

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function hrefFor(next: Locale) {
    return localizeHref(next, stripLocalePath(pathname));
  }

  function select(event: React.MouseEvent<HTMLAnchorElement>, next: Locale) {
    setOpen(false);
    if (next === locale) {
      event.preventDefault();
      return;
    }
    const search = window.location.search;
    if (!search) return;
    event.preventDefault();
    router.push(`${hrefFor(next)}${search}`);
  }

  return (
    <div ref={rootRef} className="lang-menu" onKeyDown={(event) => event.key === "Escape" && setOpen(false)}>
      <button
        type="button"
        className="lang-trigger"
        aria-label={t.lang.group}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="lang-trigger-code" lang="en">
          {current.toUpperCase()}
        </span>
        <Chevron />
      </button>
      {open ? (
        <div id={menuId} role="menu" aria-label={t.lang.group} className="lang-list">
          {LOCALES.map((code) => {
            const url = urlLocale(code);
            const selected = code === locale;
            return (
              <Link
                key={code}
                role="menuitemradio"
                aria-checked={selected}
                href={hrefFor(code)}
                lang={url === "hy" ? "hy" : url}
                className="lang-option"
                onClick={(event) => select(event, code)}
              >
                <span>{t.lang[url]}</span>
                <span className="lang-option-code" lang="en">
                  {url.toUpperCase()}
                </span>
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
