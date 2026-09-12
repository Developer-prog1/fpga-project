import { Sparkline } from "@/components/charts";
import { formatMetric } from "@/lib/metrics";

export function MetricCard({
  label,
  value,
  unit,
  digits,
  hint,
  watch,
  spark,
}: {
  label: string;
  value: number;
  unit: string;
  digits: number;
  hint?: string;
  watch: boolean;
  spark: number[];
}) {
  return (
    <article className="panel rounded-[24px] p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink-soft">{label}</p>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] ${
            watch ? "bg-garnet/10 text-garnet" : "bg-forest/10 text-forest"
          }`}
        >
          {watch ? "ուշադրություն" : "նորմա"}
        </span>
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <p className="stat-number font-serif text-4xl leading-none">
          {formatMetric(value, digits)}
          {unit ? (
            <span className="ml-1 align-middle text-sm font-sans font-medium text-ink-soft">
              {unit}
            </span>
          ) : null}
        </p>
        <Sparkline values={spark} color={watch ? "#7a2433" : "#2a4538"} />
      </div>
      {hint ? <p className="mt-3 text-sm text-ink-soft">{hint}</p> : null}
    </article>
  );
}
