"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/components/i18n-provider";
import { localizeHref, stripLocalePath } from "@/lib/i18n/locale";

export function SiteNav() {
  const pathname = usePathname();
  const path = stripLocalePath(pathname);
  const { locale, t } = useI18n();
  const links = [
    {
      href: localizeHref(locale, "/"),
      label: t.nav.now,
      match: (value: string) => value === "/" || value.startsWith("/air"),
    },
    {
      href: localizeHref(locale, "/history"),
      label: t.nav.history,
      match: (value: string) => value.startsWith("/history"),
    },
  ];

  return (
    <nav aria-label={t.nav.aria} className="flex items-center gap-2">
      {links.map((link) => {
        const active = link.match(path);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={active ? "chip chip-active" : "chip"}
            aria-current={active ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
