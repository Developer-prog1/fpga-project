import Link from "next/link";
import { getI18n } from "@/lib/i18n/server";

export function SectionHeading({
  title,
  note,
  action,
}: {
  title: string;
  note?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="font-serif text-[1.85rem] leading-none tracking-tight">{title}</h2>
        {note ? <p className="mt-2 text-sm text-ink-soft">{note}</p> : null}
        <div className="gold-rule mt-3 w-24" />
      </div>
      {action}
    </div>
  );
}

export async function ChartFrame({
  title,
  note,
  href,
  children,
}: {
  title: string;
  note: string;
  href?: string;
  children: React.ReactNode;
}) {
  const { t } = await getI18n();
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-serif text-xl tracking-tight">{title}</h3>
        {href ? <span className="pt-1 text-sm text-gold">{t.open}</span> : null}
      </div>
      <p className="mt-1 text-sm text-ink-soft">{note}</p>
      <div className="gold-rule mt-3 mb-1 w-16" />
      {children}
    </>
  );

  if (href) {
    return (
      <Link href={href} className="panel panel-lift block rounded-[28px] p-5 sm:p-6">
        {body}
      </Link>
    );
  }

  return <article className="panel rounded-[28px] p-5 sm:p-6">{body}</article>;
}
