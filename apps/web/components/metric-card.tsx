import Link from "next/link";
import { Sparkline } from "@/components/charts";
import { MetricIcon } from "@/components/weather-icons";
import type { Locale } from "@/lib/i18n/locale";
import { getI18n } from "@/lib/i18n/server";
import { formatMetric } from "@/lib/metrics";

function RangeMark({
  min,
  max,
  value,
  digits,
  color,
  locale,
  lowLabel,
  highLabel,
}: {
  min: number;
  max: number;
  value: number;
  digits: number;
  color: string;
  locale: Locale;
  lowLabel: string;
  highLabel: string;
}) {
  const marker = ((value - min) / (max - min || 1)) * 100;
  const left = `${Math.min(Math.max(marker, 0), 100)}%`;

  return (
    <div className="mt-4">
      <div className="flex justify-between text-[11px] text-ink-soft">
        <span>
          {lowLabel} {formatMetric(min, digits, locale)}
        </span>
        <span>
          {highLabel} {formatMetric(max, digits, locale)}
        </span>
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
  normal,
}: Pick<MetricCardProps, "metricKey" | "label" | "color" | "watch"> & { normal: string }) {
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
        {watch ?? normal}
      </span>
    </div>
  );
}

export async function MetricCard({
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
  const { locale, t } = await getI18n();
  const className = "panel panel-lift flex h-full flex-col overflow-hidden rounded-[24px] p-5";
  const body = (
    <>
      <span className="-mx-5 -mt-5 mb-4 block h-1" style={{ background: color }} />
      <CardHead metricKey={metricKey} label={label} color={color} watch={watch} normal={t.normal} />

      <p className="stat-number mt-5 font-serif text-5xl leading-none">
        {formatMetric(value, digits, locale)}
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
      <RangeMark
        min={min}
        max={max}
        value={value}
        digits={digits}
        color={color}
        locale={locale}
        lowLabel={t.range.low}
        highLabel={t.range.high}
      />
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
