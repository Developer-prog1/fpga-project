import { api } from "@/lib/api";
import type { Overview, Reading } from "@/lib/types";
import { airPath } from "@/lib/air-detail";
import { dayKeyFromIso } from "@/lib/day-compare";
import { recentWindow } from "@/lib/day-window";
import { recentWindowSpan } from "@/lib/history";
import { intlLocale, localizeHref } from "@/lib/i18n/locale";
import { getI18n } from "@/lib/i18n/server";
import { formatMetric, metrics, seriesRange, windDegNorm, windDirLabel } from "@/lib/metrics";
import { SectionHeading } from "@/components/section-heading";
import { EmptyState } from "@/components/empty-state";
import { MetricCard } from "@/components/metric-card";
import { TrendCharts } from "@/components/trend-charts";
import { HeroNow } from "@/components/hero-now";

function chartHref(rows: Reading[], locale: Parameters<typeof intlLocale>[0]) {
  const first = rows[0]?.recordedAt;
  const last = rows[rows.length - 1]?.recordedAt;
  if (!first || !last) return undefined;
  const from = dayKeyFromIso(first);
  const to = dayKeyFromIso(last);
  const [start, end] = from <= to ? [from, to] : [to, from];
  return (chartId: string) => localizeHref(locale, `/history/${chartId}?from=${start}&to=${end}`);
}

function hourLabel(iso: string, locale: Parameters<typeof intlLocale>[0]) {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default async function Home() {
  const { locale, t } = await getI18n();
  const metricList = metrics(locale);
  const [overview, readings] = await Promise.all([
    api<Overview>("/overview"),
    api<Reading[]>("/readings?hours=24"),
  ]);

  const latest = overview?.latest;
  const series = readings ?? [];
  const timeWindow = recentWindow(Date.now(), 24);
  const times = series.map((row) => row.recordedAt);
  const coverage = recentWindowSpan(series, timeWindow.end, 24, locale);

  return (
    <div className="py-8 lg:py-10">
      {!overview?.station || !latest ? (
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-10">
          <EmptyState />
        </div>
      ) : (
        <div className="space-y-12 px-6 sm:px-8 lg:px-12">
          <HeroNow
            overview={overview}
            latest={latest}
            airTemps={series.map((row) => row.airTemp)}
            airTimes={times}
            timeWindow={timeWindow}
            coverageLabel={coverage?.label}
          />

          {t.groups.map((group) => (
            <section key={group.id} className="px-6 sm:px-8">
              <SectionHeading title={group.title} note={group.note} />
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {metricList.filter((metric) => metric.group === group.id).map((metric) => {
                  const values = series.map((row) => row[metric.key]);
                  const range = seriesRange(values);
                  const hint =
                    metric.key === "windSpeed"
                      ? t.hints.direction(windDirLabel(latest.windDirDeg, locale), windDegNorm(latest.windDirDeg))
                      : metric.key === "rainfallMm"
                        ? t.hints.rainSum(formatMetric(overview.summary?.rainfallMm.sum ?? 0, 1, locale))
                        : undefined;

                  const path = airPath(metric.key);
                  return (
                    <MetricCard
                      key={metric.key}
                      metricKey={metric.key}
                      label={metric.label}
                      value={latest[metric.key]}
                      unit={metric.unit}
                      digits={metric.digits}
                      hint={hint}
                      watch={metric.watch(latest[metric.key])}
                      spark={values}
                      sparkTimes={times}
                      timeWindow={timeWindow}
                      min={range.min}
                      max={range.max}
                      color={metric.color}
                      href={path ? localizeHref(locale, path) : undefined}
                    />
                  );
                })}
              </div>
            </section>
          ))}

          <section>
            <SectionHeading title={t.homeTrend.title} note={coverage?.sentence ?? t.homeTrend.note} />
            <TrendCharts
              rows={series}
              labelFor={(iso) => hourLabel(iso, locale)}
              hrefFor={chartHref(series, locale)}
              timeWindow={timeWindow}
            />
          </section>
        </div>
      )}
    </div>
  );
}
