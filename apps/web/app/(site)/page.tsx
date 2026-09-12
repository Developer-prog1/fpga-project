import { api } from "@/lib/api";
import type { Overview, Reading } from "@/lib/types";
import { GROUPS, METRICS, downsample, formatMetric, seriesRange, windDegNorm, windDirLabel } from "@/lib/metrics";
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
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      {!overview?.station || !latest ? (
        <EmptyState />
      ) : (
        <div className="space-y-12">
          <HeroNow
            overview={overview}
            latest={latest}
            airTemps={downsample(series.map((row) => row.airTemp), 36)}
          />

          {GROUPS.map((group) => (
            <section key={group.id}>
              <div className="mb-4">
                <h2 className="font-serif text-2xl">{group.title}</h2>
                <p className="mt-1 text-sm text-ink-soft">{group.note}</p>
              </div>
              <div className={`grid gap-4 ${group.id === "soil" || group.id === "light" ? "md:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-3"}`}>
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
                    />
                  );
                })}
              </div>
            </section>
          ))}

          <section>
            <div className="mb-4">
              <h2 className="font-serif text-2xl">24 ժամվա ընթացք</h2>
              <p className="mt-1 text-sm text-ink-soft">
                Միավորները բաժանված են առանցքներով. մուգ շերտը գիշերն է։
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <article className="panel rounded-[28px] p-5 sm:p-6">
                <h3 className="font-serif text-xl">Ջերմաստիճան</h3>
                <p className="mt-1 text-sm text-ink-soft">օդ և հող · նույն սանդղակ, °C</p>
                <ChartLegend series={tempSeries} />
                <div className="mt-3">
                  <TimeChart labels={labels} times={times} series={tempSeries} unitLeft="°C" />
                </div>
              </article>
              <article className="panel rounded-[28px] p-5 sm:p-6">
                <h3 className="font-serif text-xl">Խոնավություն</h3>
                <p className="mt-1 text-sm text-ink-soft">օդ և հող · նույն սանդղակ, %</p>
                <ChartLegend series={humidSeries} />
                <div className="mt-3">
                  <TimeChart labels={labels} times={times} series={humidSeries} unitLeft="%" />
                </div>
              </article>
              <article className="panel rounded-[28px] p-5 sm:p-6">
                <h3 className="font-serif text-xl">Քամի և տեղումներ</h3>
                <p className="mt-1 text-sm text-ink-soft">ձախում քամի (m/s), աջում անձրևի սյուներ (մմ)</p>
                <ChartLegend series={windRainSeries} />
                <div className="mt-3">
                  <TimeChart
                    labels={labels}
                    times={times}
                    series={windRainSeries}
                    unitLeft="m/s"
                    unitRight="մմ"
                  />
                </div>
              </article>
              <article className="panel rounded-[28px] p-5 sm:p-6">
                <h3 className="font-serif text-xl">Լույս և UV</h3>
                <p className="mt-1 text-sm text-ink-soft">ձախում lux, աջում ուլտրամանուշակագույն ինդեքս</p>
                <ChartLegend series={lightSeries} />
                <div className="mt-3">
                  <TimeChart labels={labels} times={times} series={lightSeries} unitLeft="lux" unitRight="UV" />
                </div>
              </article>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
