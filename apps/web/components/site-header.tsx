"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Crest } from "@/components/mark";

const NAV = [
  { href: "/", label: "Գլխավոր" },
  { href: "/faculties", label: "Ֆակուլտետներ" },
  { href: "/courses", label: "Դասընթացներ" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3 text-ink">
          <span className="text-gold">
            <Crest className="size-10" />
          </span>
          <span>
            <span className="block font-serif text-xl leading-none">Համալսարան</span>
            <span className="mt-1 block text-[10px] uppercase tracking-[0.28em] text-gold">
              Athenaeum
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-4 py-2 text-sm transition ${
                isActive(pathname, item.href)
                  ? "bg-ink text-cream"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/admin"
          className="rounded-full bg-garnet px-4 py-2 text-sm text-cream transition hover:bg-garnet-deep"
        >
          Ադմին
        </Link>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-5 pb-3 md:hidden">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs ${
              isActive(pathname, item.href)
                ? "bg-ink text-cream"
                : "bg-ink/5 text-ink-soft"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
