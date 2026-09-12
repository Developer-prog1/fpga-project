import Link from "next/link";
import { Crest } from "@/components/mark";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <div className="text-gold">
        <Crest className="size-16" />
      </div>
      <p className="mt-8 text-[11px] uppercase tracking-[0.32em] text-gold">404</p>
      <h1 className="mt-3 font-serif text-5xl tracking-tight">Էջը չի գտնվել</h1>
      <p className="mt-4 text-ink-soft">
        Այս հասցեն գոյություն չունի համալսարանի վահանակում։
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-ink px-6 py-2.5 text-sm text-cream transition hover:bg-garnet"
      >
        Վերադառնալ ակնարկ
      </Link>
    </div>
  );
}
