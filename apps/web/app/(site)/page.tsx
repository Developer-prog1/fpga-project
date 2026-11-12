import Link from "next/link";
import { api } from "@/lib/api";
import type { Overview, Reading } from "@/lib/types";
import { airPath } from "@/lib/air-detail";
import { GROUPS, METRICS, downsample, formatMetric, seriesRange, windDegNorm, windDirLabel } from "@/lib/metrics";
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

function hourLabel(iso: string) {
  return new Intl.DateTimeFormat("hy-AM", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default async function Home() {
  const [overview, readings] = await Promise.all([
    api<Overview>("/overview"),
    api<Reading[]>("/readings?hours=24"),
  ]);

  const latest = overview?.latest;
  const series = readings ?? [];
  const chart = pickReadings(series);

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
          />

          {GROUPS.map((group) => (
            <section key={group.id} className="px-6 sm:px-8">
              <SectionHeading title={group.title} note={group.note} />
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {METRICS.filter((metric) => metric.group === group.id).map((metric) => {
                  const values = series.map((row) => row[metric.key]);
                  const range = seriesRange(values);
                  const hint =
                    metric.key === "windSpeed"
                      ? `ուղղություն ${windDirLabel(latest.windDirDeg)} · ${windDegNorm(latest.windDirDeg)}°`
                      : metric.key === "rainfallMm"
                        ? `24 ժամում գումար ${formatMetric(overview.summary?.rainfallMm.sum ?? 0, 1)} մմ`
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
              title="24 ժամվա ընթացք"
              note="Միավորները բաժանված են առանցքներով. մուգ շերտը գիշերն է։"
              action={
                <Link href="/history" className="chip">
                  Պատմություն
                </Link>
              }
            />
            <TrendCharts rows={chart} labelFor={hourLabel} />
          </section>
        </div>
      )}
    </div>
  );
}
