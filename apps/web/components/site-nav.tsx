"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/components/i18n-provider";

export function SiteNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  const links = [
    {
      href: "/",
      label: t.nav.now,
      match: (path: string) => path === "/" || path.startsWith("/air"),
    },
    {
      href: "/history",
      label: t.nav.history,
      match: (path: string) => path.startsWith("/history"),
    },
  ];

  return (
    <nav aria-label={t.nav.aria} className="flex items-center gap-2">
      {links.map((link) => {
        const active = link.match(pathname);
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
