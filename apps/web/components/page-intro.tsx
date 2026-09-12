import Link from "next/link";

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
    <header className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
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
