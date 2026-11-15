import Image from "next/image";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SiteNav } from "@/components/site-nav";
import { getI18n } from "@/lib/i18n/server";

export async function SiteHeader() {
  const { t } = await getI18n();

  return (
    <header className="site-header">
      <div className="flex w-full flex-col items-center gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-3 text-ink">
          <span className="rounded-full ring-1 ring-gold/80 ring-offset-4 ring-offset-[#f7f1e8]">
            <Image
              src="/npua-seal.png"
              alt={t.brand.fullName}
              width={225}
              height={225}
              className="h-16 w-16 shrink-0 rounded-full object-contain [clip-path:circle(50%)]"
              priority
              unoptimized
            />
          </span>
          <span className="flex flex-col gap-1.5">
            <span className="font-serif text-[1.7rem] leading-none tracking-[0.08em] text-ink">
              {t.brand.mark}
            </span>
            <span className="gold-rule w-14" aria-hidden />
          </span>
        </Link>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <SiteNav />
          <span className="hidden h-4 w-px bg-gold/60 sm:block" aria-hidden />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
