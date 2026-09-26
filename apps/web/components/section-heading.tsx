export function SectionHeading({ title, note }: { title: string; note?: string }) {
  return (
    <div className="mb-5">
      <h2 className="font-serif text-[1.85rem] leading-none tracking-tight">{title}</h2>
      {note ? <p className="mt-2 text-sm text-ink-soft">{note}</p> : null}
      <div className="gold-rule mt-3 w-24" />
    </div>
  );
}

export function ChartFrame({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <article className="panel rounded-[28px] p-5 sm:p-6">
      <h3 className="font-serif text-xl tracking-tight">{title}</h3>
      <p className="mt-1 text-sm text-ink-soft">{note}</p>
      <div className="gold-rule mt-3 mb-1 w-16" />
      {children}
    </article>
  );
}
