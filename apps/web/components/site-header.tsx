import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="mx-auto flex w-full max-w-6xl items-center px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3 text-ink">
          <Image
            src="/npua-seal.png"
            alt="Հայաստանի ազգային պոլիտեխնիկական համալսարան"
            width={225}
            height={225}
            className="h-[72px] w-[72px] shrink-0 rounded-full object-contain [clip-path:circle(50%)]"
            priority
            unoptimized
          />
          <span>
            <span className="block font-serif text-xl leading-none">Համալսարան</span>
            <span className="mt-1 block text-[10px] uppercase tracking-[0.28em] text-gold">
              Դաշտային կայան
            </span>
          </span>
        </Link>
      </div>
    </header>
  );
}
