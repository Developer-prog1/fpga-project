import Link from "next/link";
import { Sparkline } from "@/components/charts";
import { MetricIcon } from "@/components/weather-icons";
import { formatMetric } from "@/lib/metrics";

function RangeMark({
  min,
  max,
  value,
  digits,
  color,
}: {
  min: number;
  max: number;
  value: number;
  digits: number;
  color: string;
}) {
  const marker = ((value - min) / (max - min || 1)) * 100;
  const left = `${Math.min(Math.max(marker, 0), 100)}%`;

  return (
    <div className="mt-4">
      <div className="flex justify-between text-[11px] text-ink-soft">
        <span>24ժ նվազ. {formatMetric(min, digits)}</span>
        <span>առավել. {formatMetric(max, digits)}</span>
      </div>
      <div className="relative mt-1.5 h-1.5 rounded-full bg-ink/8">
        <span
          className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-paper"
          style={{ left, background: color }}
        />
      </div>
    </div>
  );
}

type MetricCardProps = {
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
  href?: string;
};

function CardHead({
  metricKey,
  label,
  color,
  watch,
}: Pick<MetricCardProps, "metricKey" | "label" | "color" | "watch">) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <span
          className="grid size-10 shrink-0 place-items-center rounded-2xl"
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
  );
}

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
  href,
}: MetricCardProps) {
  const className = "panel panel-lift flex h-full flex-col overflow-hidden rounded-[24px] p-5";
  const body = (
    <>
      <span className="-mx-5 -mt-5 mb-4 block h-1" style={{ background: color }} />
      <CardHead metricKey={metricKey} label={label} color={color} watch={watch} />

      <p className="stat-number mt-5 font-serif text-5xl leading-none">
        {formatMetric(value, digits)}
        {unit ? (
          <span className="ml-1.5 align-middle font-sans text-sm font-medium tracking-normal text-ink-soft">
            {unit}
          </span>
        ) : null}
      </p>
      {hint ? <p className="mt-3 text-sm text-ink-soft">{hint}</p> : null}

      <div className="mt-4 rounded-2xl px-2 pt-2" style={{ background: `${color}10` }}>
        <Sparkline values={spark} color={color} />
      </div>
      <RangeMark min={min} max={max} value={value} digits={digits} color={color} />
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {body}
      </Link>
    );
  }

  return <article className={className}>{body}</article>;
}
