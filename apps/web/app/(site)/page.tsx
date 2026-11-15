import Link from "next/link";
import { api } from "@/lib/api";
import type { Overview, Reading } from "@/lib/types";
import { airPath } from "@/lib/air-detail";
import { recentWindowSpan } from "@/lib/history";
import { getI18n } from "@/lib/i18n/server";
import { intlLocale } from "@/lib/i18n/locale";
import { getI18n } from "@/lib/i18n/server";
import { downsample, formatMetric, metrics, seriesRange, windDegNorm, windDirLabel } from "@/lib/metrics";
import { SectionHeading } from "@/components/section-heading";
import { EmptyState } from "@/components/empty-state";
import { MetricCard } from "@/components/metric-card";
import { TrendCharts } from "@/components/trend-charts";
import { HeroNow } from "@/components/hero-now";

function pickReadings(rows: Reading[], size = 48) {
  if (rows.length <= size) return rows;
  const step = (rows.length - 1) / (size - 1);
  return Array.from({ length: size }, (_, i) => rows[Math.round(i * step)]);
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
  const chart = pickReadings(series);
  const coverage = recentWindowSpan(series, Date.now(), 24, locale);

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
            airTemps={downsample(series.map((row) => row.airTemp), 36)}
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
                      spark={downsample(values)}
                      min={range.min}
                      max={range.max}
                      color={metric.color}
                      href={airPath(metric.key) ?? undefined}
                    />
                  );
                })}
              </div>
            </section>
          ))}

          <section>
            <SectionHeading
              title={t.homeTrend.title}
              note={coverage?.sentence ?? t.homeTrend.note}
              action={
                <Link href="/history" className="chip">
                  {t.nav.history}
                </Link>
              }
            />
            <TrendCharts rows={chart} labelFor={(iso) => hourLabel(iso, locale)} />
          </section>
        </div>
      )}
    </div>
  );
}
