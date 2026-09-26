import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="flex w-full items-center justify-center px-6 py-4">
        <Link href="/" className="flex items-center gap-3 text-ink">
          <Image
            src="/npua-seal.png"
            alt="Հայաստանի ազգային պոլիտեխնիկական համալսարան"
            width={225}
            height={225}
            className="h-[60px] w-[60px] shrink-0 rounded-full object-contain [clip-path:circle(50%)]"
            priority
            unoptimized
          />
          <span className="font-serif text-xl leading-none">Համալսարան</span>
        </Link>
      </div>
    </header>
  );
}
