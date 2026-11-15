import { notFound } from "next/navigation";
import { MetricDetail, type DetailStat } from "@/components/metric-detail";
import { api } from "@/lib/api";
import { detailPage, type DetailPage } from "@/lib/air-detail";
import { recentWindowSpan } from "@/lib/history";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { intlLocale, type Locale } from "@/lib/i18n/locale";
import { getI18n } from "@/lib/i18n/server";
import type { MetricGroup } from "@/lib/metrics";
import { formatMetric, seriesRange, windDegNorm, windDirFull, windDirLabel } from "@/lib/metrics";
import type { Overview, Reading } from "@/lib/types";

function hourLabel(iso: string, locale: Locale) {
  return new Intl.DateTimeFormat(intlLocale(locale), { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

function extraNote(
  key: string,
  latest: Reading,
  values: number[],
  sum: number | null | undefined,
  locale: Locale,
  t: Dictionary,
) {
  if (key === "windSpeed") {
    return t.hero.comingFrom(
      windDirFull(latest.windDirDeg, locale),
      windDirLabel(latest.windDirDeg, locale),
      windDegNorm(latest.windDirDeg),
    );
  }
  if (key === "rainfallMm") {
    const total = sum ?? values.reduce((acc, n) => acc + n, 0);
    return t.hints.rainSum(formatMetric(total, 1, locale));
  }
  return undefined;
}

function mean(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function statsFor(values: number[], digits: number, unit: string, locale: Locale, t: Dictionary): DetailStat[] {
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

export async function ReadingDetail({ group, slug }: { group: MetricGroup; slug: string }) {
  const { locale, t } = await getI18n();
  const page = detailPage(group, slug, locale);
  if (!page) notFound();
  return <ReadingBody page={page} />;
}

async function ReadingBody({ page }: { page: DetailPage }) {
  const { locale, t } = await getI18n();
  const [overview, readings] = await Promise.all([api<Overview>("/overview"), api<Reading[]>("/readings?hours=24")]);
  const latest = overview?.latest;
  const series = readings ?? [];
  if (!latest || series.length === 0) notFound();

  const { metric } = page;
  const values = series.map((row) => row[metric.key]);
  const when = new Intl.DateTimeFormat(intlLocale(locale), {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(latest.recordedAt));

  return (
    <MetricDetail
      kicker={t.groups.find((item) => item.id === page.group)?.title ?? t.detail.atmosphere}
      label={metric.label}
      about={page.about}
      reading={page.reading}
      value={formatMetric(latest[metric.key], metric.digits, locale)}
      unit={metric.unit}
      when={when}
      extra={extraNote(metric.key, latest, values, overview?.summary?.rainfallMm.sum, locale, t)}
      watch={metric.watch(latest[metric.key])}
      stats={statsFor(values, metric.digits, metric.unit, locale, t)}
      chartNote={recentWindowSpan(series, Date.now(), 24, locale)?.sentence}
      labels={series.map((row) => hourLabel(row.recordedAt, locale))}
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
