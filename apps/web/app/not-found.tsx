import Link from "next/link";
import { Crest } from "@/components/mark";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <div className="panel w-full rounded-[32px] px-8 py-12">
        <div className="text-gold">
          <Crest className="mx-auto size-16" />
        </div>
        <p className="kicker mt-8 text-gold">404</p>
        <h1 className="mt-3 font-serif text-5xl tracking-tight">Էջը չի գտնվել</h1>
        <div className="gold-rule mx-auto mt-4 w-16" />
        <p className="mt-4 text-ink-soft">Այս հասցեն գոյություն չունի դաշտային կայանում։</p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-ink px-6 py-2.5 text-sm text-cream transition hover:bg-garnet"
        >
          Վերադառնալ գլխավոր էջ
        </Link>
      </div>
    </div>
  );
}
