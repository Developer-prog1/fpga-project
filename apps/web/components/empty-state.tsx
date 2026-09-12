import Link from "next/link";
import { Crest } from "@/components/mark";

export function EmptyState() {
  return (
    <div className="panel mx-auto max-w-xl rounded-[28px] px-8 py-12 text-center">
      <div className="mx-auto w-fit text-gold">
        <Crest className="size-14" />
      </div>
      <h2 className="mt-6 font-serif text-3xl tracking-tight">Կապը բացակայում է</h2>
      <p className="mt-3 text-ink-soft">
        Ակնարկի տվյալները հասանելի չեն։ Գործարկեք համակարգը և լցրեք ցուցադրական
        տվյալները։
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <code className="rounded-full bg-ink/5 px-3 py-1 text-sm">pnpm run dev</code>
        <code className="rounded-full bg-ink/5 px-3 py-1 text-sm">pnpm db:seed</code>
      </div>
    </div>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: { href: string; label: string };
}) {
  return (
    <header className="rise mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.32em] text-gold">{eyebrow}</p>
        <h1 className="mt-3 font-serif text-4xl leading-[1.12] tracking-tight sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-xl text-ink-soft">{description}</p>
      </div>
      {action ? (
        <Link
          href={action.href}
          className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm text-cream transition hover:bg-garnet"
        >
          {action.label}
        </Link>
      ) : null}
    </header>
  );
}
