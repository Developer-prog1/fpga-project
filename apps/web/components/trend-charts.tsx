import { ChartLegend, TimeChart } from "@/components/charts";
import { ChartFrame } from "@/components/section-heading";

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

export function TrendCharts({
  rows,
  labelFor,
  shadeNight = true,
}: {
  rows: TrendRow[];
  labelFor: (iso: string) => string;
  shadeNight?: boolean;
}) {
  const labels = rows.map((row) => labelFor(row.recordedAt));
  const times = rows.map((row) => row.recordedAt);
  const tempSeries = [
    { label: "Օդ", color: "#7a2433", values: rows.map((row) => row.airTemp), unit: "°C", digits: 1, kind: "area" as const },
    { label: "Հող", color: "#6b4c2a", values: rows.map((row) => row.soilTemp), unit: "°C", digits: 1, kind: "area" as const },
  ];
  const humidSeries = [
    { label: "Օդ", color: "#3d5a80", values: rows.map((row) => row.airHumidity), unit: "%", digits: 0, kind: "area" as const },
    { label: "Հող", color: "#2a4538", values: rows.map((row) => row.soilMoisture), unit: "%", digits: 1, kind: "area" as const },
  ];
  const windRainSeries = [
    {
      label: "Քամի",
      color: "#2e4a6e",
      values: rows.map((row) => row.windSpeed),
      unit: "m/s",
      digits: 1,
      kind: "area" as const,
      axis: "left" as const,
    },
    {
      label: "Տեղումներ",
      color: "#c4a35a",
      values: rows.map((row) => row.rainfallMm),
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
      values: rows.map((row) => row.lightLux),
      unit: "lux",
      digits: 0,
      kind: "area" as const,
      axis: "left" as const,
    },
    {
      label: "UV",
      color: "#9a3b28",
      values: rows.map((row) => row.uvIndex),
      unit: "",
      digits: 1,
      kind: "line" as const,
      axis: "right" as const,
    },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartFrame title="Ջերմաստիճան" note="օդ և հող · նույն սանդղակ, °C">
        <ChartLegend series={tempSeries} />
        <div className="mt-3">
          <TimeChart labels={labels} times={times} series={tempSeries} unitLeft="°C" shadeNight={shadeNight} />
        </div>
      </ChartFrame>
      <ChartFrame title="Խոնավություն" note="օդ և հող · նույն սանդղակ, %">
        <ChartLegend series={humidSeries} />
        <div className="mt-3">
          <TimeChart labels={labels} times={times} series={humidSeries} unitLeft="%" shadeNight={shadeNight} />
        </div>
      </ChartFrame>
      <ChartFrame title="Քամի և տեղումներ" note="ձախում քամի (m/s), աջում անձրևի սյուներ (մմ)">
        <ChartLegend series={windRainSeries} />
        <div className="mt-3">
          <TimeChart
            labels={labels}
            times={times}
            series={windRainSeries}
            unitLeft="m/s"
            unitRight="մմ"
            shadeNight={shadeNight}
          />
        </div>
      </ChartFrame>
      <ChartFrame title="Լույս և UV" note="ձախում lux, աջում ուլտրամանուշակագույն ինդեքս">
        <ChartLegend series={lightSeries} />
        <div className="mt-3">
          <TimeChart
            labels={labels}
            times={times}
            series={lightSeries}
            unitLeft="lux"
            unitRight="UV"
            shadeNight={shadeNight}
          />
        </div>
      </ChartFrame>
    </div>
  );
}
