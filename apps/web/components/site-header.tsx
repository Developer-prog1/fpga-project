import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="mx-auto flex w-full max-w-6xl items-center px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3 text-ink">
          <Image
            src="/npua-seal.jpg"
            alt="Հայաստանի ազգային պոլիտեխնիկական համալսարան"
            width={56}
            height={56}
            className="h-14 w-14 object-contain mix-blend-multiply"
            priority
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
