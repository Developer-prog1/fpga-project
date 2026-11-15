import type { DayReading } from "@/lib/day-reading";

export function HistoryNarrative({ title, readings }: { title: string; readings: DayReading[] }) {
  if (readings.length === 0) return null;

  return (
    <section className="mt-8 border-t border-ink/10 pt-6" aria-label={title}>
      <h2 className="font-serif text-2xl tracking-tight">{title}</h2>
      <div className="gold-rule mt-3 w-16" />
      <ul className="mt-5 space-y-5">
        {readings.map((reading) => (
          <li key={reading.key}>
            {reading.label ? (
              <p className="flex items-center gap-2 text-sm text-ink-soft">
                <span
                  aria-hidden
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ background: reading.color ?? "transparent" }}
                />
                {reading.label}
              </p>
            ) : null}
            <div className={reading.label ? "mt-2 space-y-2" : "space-y-2"}>
              {reading.paragraphs.map((paragraph, index) => (
                <p key={`${reading.key}-${index}`} className="max-w-3xl text-pretty leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
