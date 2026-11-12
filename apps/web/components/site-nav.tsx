"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  {
    href: "/",
    label: "Այժմ",
    match: (path: string) => path === "/" || path.startsWith("/air"),
  },
  {
    href: "/history",
    label: "Պատմություն",
    match: (path: string) => path.startsWith("/history"),
  },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Բաժիններ" className="flex items-center gap-2">
      {LINKS.map((link) => {
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
