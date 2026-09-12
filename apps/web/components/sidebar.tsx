"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Crest, IconAdmins, IconCourses, IconFaculties, IconOverview } from "@/components/mark";

const NAV = [
  { href: "/", label: "Ակնարկ", hint: "Overview", icon: IconOverview },
  { href: "/faculties", label: "Ֆակուլտետներ", hint: "Faculties", icon: IconFaculties },
  { href: "/courses", label: "Դասընթացներ", hint: "Courses", icon: IconCourses },
  { href: "/admins", label: "Ադմիններ", hint: "Admins", icon: IconAdmins },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({
  connected,
  database,
}: {
  connected: boolean;
  database?: string;
}) {
  const pathname = usePathname();

  return (
    <>
      <aside className="sidebar hidden lg:flex">
        <div className="flex h-full flex-col px-5 py-7">
          <Link href="/" className="group flex items-center gap-3 px-1">
            <span className="text-gold transition-transform duration-300 group-hover:rotate-12">
              <Crest className="size-12" />
            </span>
            <span>
              <span className="block font-serif text-[1.35rem] leading-none tracking-tight">
                Համալսարան
              </span>
              <span className="mt-1 block text-[10px] uppercase tracking-[0.28em] text-gold/80">
                Athenaeum
              </span>
            </span>
          </Link>

          <div className="ornament my-8 text-[10px] uppercase tracking-[0.32em]">
            <span>Վահանակ</span>
          </div>

          <nav className="flex flex-col gap-1.5">
            {NAV.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link ${active ? "nav-link-active" : ""}`}
                >
                  <span
                    className={`grid size-9 place-items-center rounded-xl ${
                      active ? "bg-gold/15 text-gold-bright" : "bg-white/5"
                    }`}
                  >
                    <item.icon />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{item.label}</span>
                    <span className="block text-[10px] uppercase tracking-[0.18em] opacity-50">
                      {item.hint}
                    </span>
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl border border-gold/20 bg-white/[0.04] p-4">
            <div className="flex items-center gap-2 text-xs">
              <span
                className={`jewel ${connected ? "bg-emerald-400" : "bg-rose-400"}`}
              />
              <span className="font-medium">
                {connected ? "Համակարգը միացված է" : "API-ն անհասանելի է"}
              </span>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-cream/55">
              {connected
                ? `Neon PostgreSQL · ${database ?? "online"}`
                : "Սկսեք API-ն՝ pnpm run dev"}
            </p>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-40 border-b border-ink/10 bg-[#1a120e]/95 px-4 py-3 text-cream backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-gold">
              <Crest className="size-8" />
            </span>
            <span className="font-serif text-lg leading-none">Համալսարան</span>
          </Link>
          <div className="flex items-center gap-2 text-[11px]">
            <span className={`jewel ${connected ? "bg-emerald-400" : "bg-rose-400"}`} />
            {connected ? "Online" : "Offline"}
          </div>
        </div>
        <nav className="mt-3 flex gap-1 overflow-x-auto pb-1">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs ${
                  active ? "bg-gold/20 text-cream" : "text-cream/70"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
    </>
  );
}
