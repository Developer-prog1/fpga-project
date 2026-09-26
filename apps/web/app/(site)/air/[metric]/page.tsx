import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MetricDetail, type DetailStat } from "@/components/metric-detail";
import { api } from "@/lib/api";
import { airPageBySlug } from "@/lib/air-detail";
import { formatMetric, seriesRange, windDegNorm, windDirFull, windDirLabel } from "@/lib/metrics";
import type { Overview, Reading } from "@/lib/types";

type AirRouteProps = { params: Promise<{ metric: string }> };

function hourLabel(iso: string) {
  return new Intl.DateTimeFormat("hy-AM", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

function mean(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function statsFor(values: number[], digits: number, unit: string): DetailStat[] {
  const range = seriesRange(values);
  const withUnit = (value: number) => {
    const text = formatMetric(value, digits);
    return unit ? `${text} ${unit}` : text;
  };
  return [
    { label: "24ժ նվազագույն", value: withUnit(range.min) },
    { label: "24ժ միջին", value: withUnit(mean(values)) },
    { label: "24ժ առավելագույն", value: withUnit(range.max) },
  ];
}

export async function generateMetadata({ params }: AirRouteProps): Promise<Metadata> {
  const page = airPageBySlug((await params).metric);
  return { title: page?.metric.label ?? "Չափում" };
}

export default async function AirMetricPage({ params }: AirRouteProps) {
  const page = airPageBySlug((await params).metric);
  if (!page) notFound();

  const [overview, readings] = await Promise.all([
    api<Overview>("/overview"),
    api<Reading[]>("/readings?hours=24"),
  ]);
  const latest = overview?.latest;
  const series = readings ?? [];
  if (!latest || series.length === 0) notFound();

  const { metric } = page;
  const values = series.map((row) => row[metric.key]);
  const extra =
    metric.key === "windSpeed"
      ? `գալիս է ${windDirFull(latest.windDirDeg)} · ${windDirLabel(latest.windDirDeg)} ${windDegNorm(latest.windDirDeg)}°`
      : metric.key === "rainfallMm"
        ? `24 ժամում գումար ${formatMetric(overview?.summary?.rainfallMm.sum ?? values.reduce((sum, n) => sum + n, 0), 1)} մմ`
        : undefined;

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
