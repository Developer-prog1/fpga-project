import { api } from "@/lib/api";
import type { Overview, Reading } from "@/lib/types";
import { airPath } from "@/lib/air-detail";
import { GROUPS, METRICS, downsample, formatMetric, seriesRange, windDegNorm, windDirLabel } from "@/lib/metrics";
import { ChartFrame, SectionHeading } from "@/components/section-heading";
import { EmptyState } from "@/components/empty-state";
import { MetricCard } from "@/components/metric-card";
import { ChartLegend, TimeChart } from "@/components/charts";
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
  const labels = chart.map((row) => hourLabel(row.recordedAt));
  const times = chart.map((row) => row.recordedAt);

  const tempSeries = [
    { label: "Օդ", color: "#7a2433", values: chart.map((r) => r.airTemp), unit: "°C", digits: 1, kind: "area" as const },
    { label: "Հող", color: "#6b4c2a", values: chart.map((r) => r.soilTemp), unit: "°C", digits: 1, kind: "area" as const },
  ];
  const humidSeries = [
    { label: "Օդ", color: "#3d5a80", values: chart.map((r) => r.airHumidity), unit: "%", digits: 0, kind: "area" as const },
    { label: "Հող", color: "#2a4538", values: chart.map((r) => r.soilMoisture), unit: "%", digits: 1, kind: "area" as const },
  ];
  const windRainSeries = [
    {
      label: "Քամի",
      color: "#2e4a6e",
      values: chart.map((r) => r.windSpeed),
      unit: "m/s",
      digits: 1,
      kind: "area" as const,
      axis: "left" as const,
    },
    {
      label: "Տեղումներ",
      color: "#c4a35a",
      values: chart.map((r) => r.rainfallMm),
      unit: "մմ",
      digits: 2,
      kind: "bars" as const,
      axis: "right" as const,
    },
  ];
  const lightSeries = [
    {
      label: "Լույս",
      color: "#c4a35a",
      values: chart.map((r) => r.lightLux),
      unit: "lux",
      digits: 0,
      kind: "area" as const,
      axis: "left" as const,
    },
    {
      label: "UV",
      color: "#9a3b28",
      values: chart.map((r) => r.uvIndex),
      unit: "",
      digits: 1,
      kind: "line" as const,
      axis: "right" as const,
    },
  ];

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
            />
            <div className="grid gap-4 lg:grid-cols-2">
              <ChartFrame title="Ջերմաստիճան" note="օդ և հող · նույն սանդղակ, °C">
                <ChartLegend series={tempSeries} />
                <div className="mt-3">
                  <TimeChart labels={labels} times={times} series={tempSeries} unitLeft="°C" />
                </div>
              </ChartFrame>
              <ChartFrame title="Խոնավություն" note="օդ և հող · նույն սանդղակ, %">
                <ChartLegend series={humidSeries} />
                <div className="mt-3">
                  <TimeChart labels={labels} times={times} series={humidSeries} unitLeft="%" />
                </div>
              </ChartFrame>
              <ChartFrame title="Քամի և տեղումներ" note="ձախում քամի (m/s), աջում անձրևի սյուներ (մմ)">
                <ChartLegend series={windRainSeries} />
                <div className="mt-3">
                  <TimeChart labels={labels} times={times} series={windRainSeries} unitLeft="m/s" unitRight="մմ" />
                </div>
              </ChartFrame>
              <ChartFrame title="Լույս և UV" note="ձախում lux, աջում ուլտրամանուշակագույն ինդեքս">
                <ChartLegend series={lightSeries} />
                <div className="mt-3">
                  <TimeChart labels={labels} times={times} series={lightSeries} unitLeft="lux" unitRight="UV" />
                </div>
              </ChartFrame>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
