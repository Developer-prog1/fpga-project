import { api } from "@/lib/api";
import type { Overview, Reading } from "@/lib/types";
import { METRICS, downsample, formatMetric, windDirLabel } from "@/lib/metrics";
import { EmptyState } from "@/components/empty-state";
import { MetricCard } from "@/components/metric-card";
import { LineChart } from "@/components/charts";

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

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      {!overview?.station || !latest ? (
        <EmptyState />
      ) : (
        <>
          <header className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.32em] text-gold">
                {overview.station.location}
              </p>
              <h1 className="mt-3 font-serif text-4xl leading-[1.08] tracking-tight sm:text-5xl">
                {overview.station.name}
              </h1>
              <p className="mt-3 text-ink-soft">
                Վերջին չափում ·{" "}
                {new Intl.DateTimeFormat("hy-AM", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(latest.recordedAt))}
              </p>
            </div>
            <div className="panel rounded-[24px] px-5 py-4 text-sm text-ink-soft">
              24 ժամում օդը {formatMetric(overview.summary?.airTemp.min ?? 0, 1)}–
              {formatMetric(overview.summary?.airTemp.max ?? 0, 1)} °C · տեղումներ{" "}
              {formatMetric(overview.summary?.rainfallMm.sum ?? 0, 1)} մմ
            </div>
          </header>

          <section className="mb-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {METRICS.map((metric) => {
              const value = latest[metric.key];
              const spark = downsample(series.map((row) => row[metric.key]));
              const hint =
                metric.key === "windSpeed"
                  ? `ուղղություն ${windDirLabel(latest.windDirDeg)} · ${latest.windDirDeg}°`
                  : metric.key === "rainfallMm"
                    ? `24ժ գումար ${formatMetric(overview.summary?.rainfallMm.sum ?? 0, 1)} մմ`
                    : undefined;

              return (
                <MetricCard
                  key={metric.key}
                  label={metric.label}
                  value={value}
                  unit={metric.unit}
                  digits={metric.digits}
                  hint={hint}
                  watch={metric.watch(value)}
                  spark={spark}
                />
              );
            })}
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <article className="panel rounded-[28px] p-6 lg:col-span-2">
              <h2 className="font-serif text-2xl">Օդ և հող</h2>
              <p className="mt-1 text-sm text-ink-soft">Ջերմաստիճան և խոնավություն · վերջին 24 ժամ</p>
              <div className="mt-4">
                <LineChart
                  labels={labels}
                  series={[
                    { label: "Օդ °C", color: "#7a2433", values: chart.map((r) => r.airTemp) },
                    { label: "Հող °C", color: "#6b4c2a", values: chart.map((r) => r.soilTemp) },
                  ]}
                />
              </div>
            </article>
            <article className="panel rounded-[28px] p-6">
              <h2 className="font-serif text-2xl">Քամի և տեղումներ</h2>
              <div className="mt-4">
                <LineChart
                  labels={labels}
                  series={[
                    { label: "Քամի m/s", color: "#2e4a6e", values: chart.map((r) => r.windSpeed) },
                    { label: "Տեղումներ մմ", color: "#c4a35a", values: chart.map((r) => r.rainfallMm) },
                  ]}
                />
              </div>
            </article>
            <article className="panel rounded-[28px] p-6">
              <h2 className="font-serif text-2xl">Լույս և UV</h2>
              <div className="mt-4">
                <LineChart
                  labels={labels}
                  series={[
                    {
                      label: "Լուսավորություն ÷1000",
                      color: "#c4a35a",
                      values: chart.map((r) => r.lightLux / 1000),
                    },
                    { label: "UV", color: "#7a2433", values: chart.map((r) => r.uvIndex) },
                  ]}
                />
              </div>
            </article>
          </section>
        </>
      )}
    </div>
  );
}
