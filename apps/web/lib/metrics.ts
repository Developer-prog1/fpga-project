import type { Reading } from "@/lib/types";

export type MetricKey = Exclude<
  keyof Reading,
  "id" | "recordedAt" | "stationId" | "windDirDeg"
>;

export type MetricDef = {
  key: MetricKey;
  label: string;
  unit: string;
  digits: number;
  watch: (value: number) => boolean;
};

export const METRICS: MetricDef[] = [
  { key: "windSpeed", label: "Քամու արագություն", unit: "m/s", digits: 1, watch: (v) => v >= 10 },
  { key: "soilMoisture", label: "Հողի խոնավություն", unit: "%", digits: 1, watch: (v) => v < 22 || v > 65 },
  { key: "soilTemp", label: "Հողի ջերմաստիճան", unit: "°C", digits: 1, watch: (v) => v < 6 },
  { key: "airTemp", label: "Օդի ջերմաստիճան", unit: "°C", digits: 1, watch: (v) => v < 0 || v > 35 },
  { key: "airHumidity", label: "Օդի խոնավություն", unit: "%", digits: 0, watch: (v) => v < 25 || v > 90 },
  { key: "rainfallMm", label: "Տեղումներ", unit: "մմ", digits: 2, watch: (v) => v >= 3 },
  { key: "pressureHpa", label: "Ճնշում", unit: "hPa", digits: 1, watch: (v) => v < 1000 || v > 1035 },
  { key: "lightLux", label: "Լուսավորություն", unit: "lux", digits: 0, watch: () => false },
  { key: "uvIndex", label: "UV ինդեքս", unit: "", digits: 1, watch: (v) => v >= 8 },
  { key: "dewPoint", label: "Ցողի կետ", unit: "°C", digits: 1, watch: () => false },
];

const WIND = ["Հս", "ՀսԱ", "Ա", "ՀրԱ", "Հր", "ՀրԱմ", "Ամ", "ՀսԱմ"];

export function windDirLabel(deg: number) {
  return WIND[Math.round(deg / 45) % 8];
}

export function formatMetric(value: number, digits: number) {
  if (digits === 0) return Math.round(value).toLocaleString("hy-AM");
  return value.toLocaleString("hy-AM", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function downsample(values: number[], size = 24) {
  if (values.length <= size) return values;
  const step = values.length / size;
  return Array.from({ length: size }, (_, i) => {
    const start = Math.floor(i * step);
    const end = Math.floor((i + 1) * step);
    const slice = values.slice(start, Math.max(end, start + 1));
    return slice.reduce((sum, n) => sum + n, 0) / slice.length;
  });
}
