import { ChartLegend, TimeChart, chartDomain, type ChartSeries } from "@/components/charts";
import { ChartFrame } from "@/components/section-heading";
import { groupByDay, minutesOfDay, type DayBucket } from "@/lib/day-compare";
import type { ChartWindow } from "@/lib/day-window";
import type { ChartId } from "@/lib/i18n/dictionary";
import { dictionary } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/locale";
import { getI18n } from "@/lib/i18n/server";

export type TrendRow = {
  recordedAt: string;
  airTemp: number;
  soilTemp: number;
  airHumidity: number;
  soilMoisture: number;
  windSpeed: number;
  rainfallMm: number;
  lightLux: number;
  uvIndex: number;
};

type MetricKey = Exclude<keyof TrendRow, "recordedAt">;

type MetricSpec = {
  key: MetricKey;
  label: string;
  color: string;
  unit: string;
  digits: number;
  kind: "area" | "line" | "bars";
  axis?: "left" | "right";
};

export type TrendChartDef = {
  id: string;
  title: string;
  note: string;
  compareNote: string;
  shareScale: boolean;
  metrics: MetricSpec[];
};

const CHARTS: TrendChartDef[] = [
  {
    id: "temperature",
    title: "Ջերմաստիճան",
    note: "օդ և հող · նույն սանդղակ, °C",
    compareNote: "ամեն գիծը մեկ օր է · օդ և հող, նույն °C սանդղակ",
    shareScale: true,
    metrics: [
      { key: "airTemp", label: "Օդ", color: "#7a2433", unit: "°C", digits: 1, kind: "area" },
      { key: "soilTemp", label: "Հող", color: "#6b4c2a", unit: "°C", digits: 1, kind: "area" },
    ],
  },
  {
    id: "humidity",
    title: "Խոնավություն",
    note: "օդ և հող · նույն սանդղակ, %",
    compareNote: "ամեն գիծը մեկ օր է · օդ և հող, նույն % սանդղակ",
    shareScale: true,
    metrics: [
      { key: "airHumidity", label: "Օդ", color: "#3d5a80", unit: "%", digits: 0, kind: "area" },
      { key: "soilMoisture", label: "Հող", color: "#2a4538", unit: "%", digits: 1, kind: "area" },
    ],
  },
  {
    id: "wind",
    title: "Քամի և տեղումներ",
    note: "ձախում քամի (m/s), աջում անձրևի սյուներ (մմ)",
    compareNote: "ամեն գիծը մեկ օր է · քամի (m/s) և տեղումներ (մմ)",
    shareScale: false,
    metrics: [
      { key: "windSpeed", label: "Քամի", color: "#2e4a6e", unit: "m/s", digits: 1, kind: "area", axis: "left" },
      { key: "rainfallMm", label: "Տեղումներ", color: "#c4a35a", unit: "մմ", digits: 2, kind: "bars", axis: "right" },
    ],
  },
  {
    id: "light",
    title: "Լույս և UV",
    note: "ձախում lux, աջում ուլտրամանուշակագույն ինդեքս",
    compareNote: "ամեն գիծը մեկ օր է · լույս (lux) և UV",
    shareScale: false,
    metrics: [
      { key: "lightLux", label: "Լույս", color: "#c4a35a", unit: "lux", digits: 0, kind: "area", axis: "left" },
      { key: "uvIndex", label: "UV", color: "#9a3b28", unit: "", digits: 1, kind: "line", axis: "right" },
    ],
  },
];

function timelineSeries(rows: TrendRow[], metric: MetricSpec): ChartSeries {
  return {
    label: metric.label,
    color: metric.color,
    values: rows.map((row) => row[metric.key]),
    unit: metric.unit,
    digits: metric.digits,
    kind: metric.kind,
    axis: metric.axis,
  };
}

function daySeries(day: DayBucket<TrendRow>, metric: MetricSpec): ChartSeries {
  const byMinute = new Map<number, number>();
  for (const row of day.rows) byMinute.set(minutesOfDay(row.recordedAt), row[metric.key]);
  const xMinutes = [...byMinute.keys()].sort((a, b) => a - b);
  return {
    label: day.label,
    color: day.color,
    values: xMinutes.map((minute) => byMinute.get(minute) ?? 0),
    xMinutes,
    unit: metric.unit,
    digits: metric.digits,
    kind: metric.kind === "bars" ? "bars" : "line",
    axis: "left",
  };
}

function localize(chart: TrendChartDef, locale: Locale): TrendChartDef {
  const copy = dictionary(locale);
  const text = copy.charts[chart.id as ChartId];
  return {
    ...chart,
    title: text.title,
    note: text.note,
    compareNote: text.compareNote,
    metrics: chart.metrics.map((metric, index) => ({
      ...metric,
      label: text.labels[index] ?? metric.label,
      unit: copy.metrics[metric.key].unit,
    })),
  };
}

export function trendChartById(id: string, locale: Locale = "am") {
  const chart = CHARTS.find((item) => item.id === id);
  return chart ? localize(chart, locale) : null;
}

function DayLegend({ days, className }: { days: DayBucket<TrendRow>[]; className?: string }) {
  return (
    <ul className={className}>
      {days.map((day) => (
        <li key={day.key} className="flex items-center gap-2 text-sm text-ink-soft">
          <span className="size-2.5 shrink-0 rounded-full" style={{ background: day.color }} />
          <span>{day.label}</span>
        </li>
      ))}
    </ul>
  );
}

function DayOverlay({
  rows,
  metrics,
  shareScale,
  locale,
  large = false,
}: {
  rows: TrendRow[];
  metrics: MetricSpec[];
  shareScale: boolean;
  locale: Locale;
  large?: boolean;
}) {
  const days = groupByDay(rows, locale);
  const domain = shareScale
    ? chartDomain(days.flatMap((day) => day.rows.flatMap((row) => metrics.map((metric) => row[metric.key]))))
    : undefined;

  if (large) {
    return (
      <div className="space-y-10">
        <DayLegend days={days} className="flex flex-wrap gap-x-6 gap-y-2" />
        {metrics.map((metric) => (
          <div key={metric.key}>
            <h2 className="font-serif text-2xl tracking-tight">{metric.label}</h2>
            <div className="gold-rule mt-3 mb-2 w-16" />
            <TimeChart
              labels={[]}
              series={days.map((day) => daySeries(day, metric))}
              unitLeft={metric.unit || metric.label}
              shadeNight
              height={420}
              yDomain={domain}
              caption={`${metric.label}: ${days.map((day) => day.label).join(", ")}`}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-3 grid grid-cols-[4.6rem_minmax(0,1fr)] gap-x-1 gap-y-2">
      <DayLegend days={days} className="col-start-1 row-span-full flex flex-col gap-2 self-start pt-7" />
      {metrics.map((metric) => (
        <div key={metric.key} className="col-start-2 min-w-0">
          <p className="pl-[8%] text-[11px] tracking-wide text-ink-soft">{metric.label}</p>
          <TimeChart
            labels={[]}
            series={days.map((day) => daySeries(day, metric))}
            unitLeft={metric.unit || metric.label}
            shadeNight
            height={188}
            yDomain={domain}
            caption={`${metric.label}: ${days.map((day) => day.label).join(", ")}`}
          />
        </div>
      ))}
    </div>
  );
}

export async function TrendChartDetail({
  chart,
  rows,
  labelFor,
  shadeNight = true,
  compareDays = false,
}: {
  chart: TrendChartDef;
  rows: TrendRow[];
  labelFor: (iso: string) => string;
  shadeNight?: boolean;
  compareDays?: boolean;
}) {
  const { locale } = await getI18n();
  const view = localize(chart, locale);
  if (compareDays) {
    return (
      <DayOverlay rows={rows} metrics={view.metrics} shareScale={view.shareScale} locale={locale} large />
    );
  }

  const series = view.metrics.map((metric) => timelineSeries(rows, metric));
  const right = view.metrics.find((metric) => metric.axis === "right");
  return (
    <>
      <ChartLegend series={series} locale={locale} />
      <div className="mt-4">
        <TimeChart
          labels={rows.map((row) => labelFor(row.recordedAt))}
          times={rows.map((row) => row.recordedAt)}
          series={series}
          unitLeft={view.metrics[0]?.unit}
          unitRight={right ? right.unit || right.label : undefined}
          shadeNight={shadeNight}
          height={460}
        />
      </div>
    </>
  );
}

export async function TrendCharts({
  rows,
  labelFor,
  shadeNight = true,
  compareDays = false,
  hrefFor,
  timeWindow,
}: {
  rows: TrendRow[];
  labelFor: (iso: string) => string;
  shadeNight?: boolean;
  compareDays?: boolean;
  hrefFor?: (chartId: string) => string;
  timeWindow?: ChartWindow;
}) {
  const { locale } = await getI18n();
  const labels = rows.map((row) => labelFor(row.recordedAt));
  const times = rows.map((row) => row.recordedAt);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {CHARTS.map((source) => {
        const chart = localize(source, locale);
        const series = chart.metrics.map((metric) => timelineSeries(rows, metric));
        const right = chart.metrics.find((metric) => metric.axis === "right");
        return (
          <ChartFrame
            key={chart.id}
            title={chart.title}
            note={compareDays ? chart.compareNote : chart.note}
            href={hrefFor?.(chart.id)}
          >
            {compareDays ? (
              <DayOverlay rows={rows} metrics={chart.metrics} shareScale={chart.shareScale} locale={locale} />
            ) : (
              <>
                <ChartLegend series={series} locale={locale} />
                <div className="mt-3">
                  <TimeChart
                    labels={labels}
                    times={times}
                    series={series}
                    unitLeft={chart.metrics[0]?.unit}
                    unitRight={right ? right.unit || right.label : undefined}
                    shadeNight={shadeNight}
                    timeWindow={timeWindow}
                    locale={locale}
                  />
                </div>
              </>
            )}
          </ChartFrame>
        );
      })}
    </div>
  );
}
