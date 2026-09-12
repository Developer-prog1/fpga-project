import { Sparkline } from "@/components/charts";
import { MetricIcon } from "@/components/weather-icons";
import { formatMetric } from "@/lib/metrics";

export function MetricCard({
  metricKey,
  label,
  value,
  unit,
  digits,
  hint,
  watch,
  spark,
  min,
  max,
  color,
}: {
  metricKey: string;
  label: string;
  value: number;
  unit: string;
  digits: number;
  hint?: string;
  watch: string | null;
  spark: number[];
  min: number;
  max: number;
  color: string;
}) {
  const span = max - min || 1;
  const marker = ((value - min) / span) * 100;

  return (
    <article className="panel panel-lift rounded-[24px] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="grid size-10 place-items-center rounded-2xl"
            style={{ background: `${color}18`, color }}
          >
            <MetricIcon name={metricKey} />
          </span>
          <p className="text-[13px] font-medium leading-snug text-ink-soft">{label}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] ${
            watch ? "bg-garnet/10 text-garnet" : "bg-forest/10 text-forest"
          }`}
        >
          {watch ?? "նորմա"}
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <p className="stat-number font-serif text-[2.15rem] leading-none">
          {formatMetric(value, digits)}
          {unit ? (
            <span className="ml-1.5 align-middle font-sans text-sm font-medium tracking-normal text-ink-soft">
              {unit}
            </span>
          ) : null}
        </p>
        <Sparkline values={spark} color={color} />
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-[11px] text-ink-soft">
          <span>24ժ նվազ. {formatMetric(min, digits)}</span>
          <span>առավել. {formatMetric(max, digits)}</span>
        </div>
        <div className="relative mt-1.5 h-1.5 rounded-full bg-ink/8">
          <span
            className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-paper"
            style={{ left: `${Math.min(Math.max(marker, 0), 100)}%`, background: color }}
          />
        </div>
      </div>
      {hint ? <p className="mt-3 text-sm text-ink-soft">{hint}</p> : null}
    </article>
  );
}
