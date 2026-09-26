import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="flex w-full items-center justify-center px-6 py-4">
        <Link href="/" className="flex items-center gap-3 text-ink">
          <span className="rounded-full ring-1 ring-gold/80 ring-offset-4 ring-offset-[#f7f1e8]">
            <Image
              src="/npua-seal.png"
              alt="Հայաստանի ազգային պոլիտեխնիկական համալսարան"
              width={225}
              height={225}
              className="h-16 w-16 shrink-0 rounded-full object-contain [clip-path:circle(50%)]"
              priority
              unoptimized
            />
          </span>
          <span className="flex flex-col gap-1.5">
            <span className="font-serif text-[1.7rem] leading-none tracking-[0.08em] text-ink">
              Համալսարան
            </span>
            <span className="gold-rule w-14" aria-hidden />
          </span>
        </Link>
      </div>
    </header>
  );
}
