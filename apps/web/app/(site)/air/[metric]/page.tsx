import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MetricDetail, type DetailStat } from "@/components/metric-detail";
import { api } from "@/lib/api";
import { airPageBySlug } from "@/lib/air-detail";
import { recentWindowSpan } from "@/lib/history";
import { getI18n } from "@/lib/i18n/server";
import { formatMetric, seriesRange, windDegNorm, windDirFull, windDirLabel } from "@/lib/metrics";
import type { Overview, Reading } from "@/lib/types";

type AirRouteProps = { params: Promise<{ metric: string }> };

function hourLabel(iso: string) {
  return new Intl.DateTimeFormat("hy-AM", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

function extraNote(key: string, latest: Reading, values: number[], sum: number | null | undefined) {
  if (key === "windSpeed") {
    return `գալիս է ${windDirFull(latest.windDirDeg)} · ${windDirLabel(latest.windDirDeg)} ${windDegNorm(latest.windDirDeg)}°`;
  }
  if (key === "rainfallMm") {
    const total = sum ?? values.reduce((acc, n) => acc + n, 0);
    return `24 ժամում գումար ${formatMetric(total, 1)} մմ`;
  }
  return undefined;
}

function mean(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function statsFor(
  values: number[],
  digits: number,
  unit: string,
  locale: Locale,
  t: Dictionary,
): DetailStat[] {
  const range = seriesRange(values);
  const withUnit = (value: number) => {
    const text = formatMetric(value, digits, locale);
    return unit ? `${text} ${unit}` : text;
  };
  return [
    { label: t.detail.min, value: withUnit(range.min) },
    { label: t.detail.mean, value: withUnit(mean(values)) },
    { label: t.detail.max, value: withUnit(range.max) },
  ];
}

export async function generateMetadata({ params }: AirRouteProps): Promise<Metadata> {
  const { locale, t } = await getI18n();
  const page = airPageBySlug((await params).metric, locale);
  return { title: page?.metric.label ?? t.meta.reading };
}

export default async function AirMetricPage({ params }: AirRouteProps) {
  const { locale, t } = await getI18n();
  const page = airPageBySlug((await params).metric, locale);
  if (!page) notFound();
  const { locale } = await getI18n();

  const [overview, readings] = await Promise.all([
    api<Overview>("/overview"),
    api<Reading[]>("/readings?hours=24"),
  ]);
  const latest = overview?.latest;
  const series = readings ?? [];
  if (!latest || series.length === 0) notFound();

  const { metric } = page;
  const values = series.map((row) => row[metric.key]);
  const extra = extraNote(metric.key, latest, values, overview?.summary?.rainfallMm.sum);
  const when = new Intl.DateTimeFormat("hy-AM", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(latest.recordedAt));

  return (
    <MetricDetail
      label={metric.label}
      about={page.about}
      reading={page.reading}
      value={formatMetric(latest[metric.key], metric.digits)}
      unit={metric.unit}
      when={when}
      extra={extra}
      watch={metric.watch(latest[metric.key])}
      stats={statsFor(values, metric.digits, metric.unit)}
      chartNote={recentWindowSpan(series, Date.now(), 24, locale)?.sentence}
      labels={series.map((row) => hourLabel(row.recordedAt))}
      times={series.map((row) => row.recordedAt)}
      unitLabel={metric.unit || metric.label}
      series={[
        {
          label: metric.label,
          color: metric.color,
          values,
          unit: metric.unit,
          digits: metric.digits,
          kind: page.kind,
        },
      ]}
    />
  );
}
