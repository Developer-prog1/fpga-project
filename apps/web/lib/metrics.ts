import type { Reading } from "@/lib/types";

export type MetricKey = Exclude<
  keyof Reading,
  "id" | "recordedAt" | "stationId" | "windDirDeg"
>;

export type MetricGroup = "air" | "soil" | "light";

export type MetricDef = {
  key: MetricKey;
  label: string;
  unit: string;
  digits: number;
  color: string;
  group: MetricGroup;
  watch: (value: number) => string | null;
};

export const METRICS: MetricDef[] = [
  {
    key: "airTemp",
    label: "Օդի ջերմաստիճան",
    unit: "°C",
    digits: 1,
    color: "#7a2433",
    group: "air",
    watch: (v) => (v < 0 ? "ցրտահարություն" : v > 35 ? "շոգ" : null),
  },
  {
    key: "airHumidity",
    label: "Օդի խոնավություն",
    unit: "%",
    digits: 0,
    color: "#3d5a80",
    group: "air",
    watch: (v) => (v < 25 ? "չոր օդ" : v > 90 ? "շատ խոնավ" : null),
  },
  {
    key: "windSpeed",
    label: "Քամու արագություն",
    unit: "m/s",
    digits: 1,
    color: "#2e4a6e",
    group: "air",
    watch: (v) => (v >= 10 ? "ուժեղ քամի" : null),
  },
  {
    key: "rainfallMm",
    label: "Տեղումներ",
    unit: "մմ",
    digits: 2,
    color: "#8a7340",
    group: "air",
    watch: (v) => (v >= 3 ? "ուժեղ անձրև" : null),
  },
  {
    key: "pressureHpa",
    label: "Մթնոլորտային ճնշում",
    unit: "hPa",
    digits: 1,
    color: "#5c5148",
    group: "air",
    watch: (v) => (v < 1000 ? "ցածր ճնշում" : v > 1035 ? "բարձր ճնշում" : null),
  },
  {
    key: "dewPoint",
    label: "Ցողի կետ",
    unit: "°C",
    digits: 1,
    color: "#3a5f55",
    group: "air",
    watch: () => null,
  },
  {
    key: "soilMoisture",
    label: "Հողի խոնավություն",
    unit: "%",
    digits: 1,
    color: "#2a4538",
    group: "soil",
    watch: (v) => (v < 22 ? "չոր հող" : v > 65 ? "ջրածածկ" : null),
  },
  {
    key: "soilTemp",
    label: "Հողի ջերմաստիճան",
    unit: "°C",
    digits: 1,
    color: "#6b4c2a",
    group: "soil",
    watch: (v) => (v < 6 ? "սառը հող" : null),
  },
  {
    key: "lightLux",
    label: "Լուսավորություն",
    unit: "lux",
    digits: 0,
    color: "#c4a35a",
    group: "light",
    watch: () => null,
  },
  {
    key: "uvIndex",
    label: "UV ինդեքս",
    unit: "",
    digits: 1,
    color: "#9a3b28",
    group: "light",
    watch: (v) => (v >= 8 ? "բարձր UV" : null),
  },
];

export const GROUPS: { id: MetricGroup; title: string; note: string }[] = [
  { id: "air", title: "Մթնոլորտ", note: "օդ, քամի, տեղումներ և ճնշում" },
  { id: "soil", title: "Հող", note: "խոնավություն և ջերմաստիճան արմատային շերտում" },
  { id: "light", title: "Լույս", note: "ցերեկային լուսավորություն և ուլտրամանուշակագույն" },
];

const WIND = ["Հս", "ՀսԱ", "Ա", "ՀրԱ", "Հր", "ՀրԱմ", "Ամ", "ՀսԱմ"];
const WIND_FULL = [
  "հյուսիսից",
  "հյուսիս-արևելքից",
  "արևելքից",
  "հարավ-արևելքից",
  "հարավից",
  "հարավ-արևմուտքից",
  "արևմուտքից",
  "հյուսիս-արևմուտքից",
];

export function windDegNorm(deg: number) {
  const n = Math.round(((deg % 360) + 360) % 360);
  return n === 360 ? 0 : n;
}

export function windDirIndex(deg: number) {
  return Math.round(windDegNorm(deg) / 45) % 8;
}

export function windDirLabel(deg: number) {
  return WIND[windDirIndex(deg)];
}

export function windDirFull(deg: number) {
  return WIND_FULL[windDirIndex(deg)];
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

export function seriesRange(values: number[]) {
  if (values.length === 0) return { min: 0, max: 0 };
  return { min: Math.min(...values), max: Math.max(...values) };
}
