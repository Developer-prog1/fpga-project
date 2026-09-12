import Link from "next/link";
import { Crest } from "@/components/mark";

export function SiteHeader() {
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
              Դաշտային կայան
            </span>
          </span>
        </Link>
        <p className="hidden text-sm text-ink-soft sm:block">Կենդանի դաշտային վահանակ · 24 ժամ</p>
      </div>
    </header>
  );
}
