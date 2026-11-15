import type { WatchCode } from "./i18n/dictionary";
import { dictionary } from "./i18n/messages";
import { intlLocale, type Locale } from "./i18n/locale";
import type { Reading } from "./types";

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

type MetricBase = {
  key: MetricKey;
  digits: number;
  color: string;
  group: MetricGroup;
  watch: (value: number) => WatchCode | null;
};

const BASE: MetricBase[] = [
  {
    key: "airTemp",
    digits: 1,
    color: "#7a2433",
    group: "air",
    watch: (v) => (v < 0 ? "frost" : v > 35 ? "heat" : null),
  },
  {
    key: "airHumidity",
    digits: 0,
    color: "#3d5a80",
    group: "air",
    watch: (v) => (v < 25 ? "dryAir" : v > 90 ? "veryHumid" : null),
  },
  {
    key: "windSpeed",
    digits: 1,
    color: "#2e4a6e",
    group: "air",
    watch: (v) => (v >= 10 ? "strongWind" : null),
  },
  {
    key: "rainfallMm",
    digits: 2,
    color: "#8a7340",
    group: "air",
    watch: (v) => (v >= 3 ? "heavyRain" : null),
  },
  {
    key: "pressureHpa",
    digits: 1,
    color: "#5c5148",
    group: "air",
    watch: (v) => (v < 1000 ? "lowPressure" : v > 1035 ? "highPressure" : null),
  },
  {
    key: "dewPoint",
    digits: 1,
    color: "#3a5f55",
    group: "air",
    watch: () => null,
  },
  {
    key: "soilMoisture",
    digits: 1,
    color: "#2a4538",
    group: "soil",
    watch: (v) => (v < 22 ? "drySoil" : v > 65 ? "waterlogged" : null),
  },
  {
    key: "soilTemp",
    digits: 1,
    color: "#6b4c2a",
    group: "soil",
    watch: (v) => (v < 6 ? "coldSoil" : null),
  },
  {
    key: "lightLux",
    digits: 0,
    color: "#c4a35a",
    group: "light",
    watch: () => null,
  },
  {
    key: "uvIndex",
    digits: 1,
    color: "#9a3b28",
    group: "light",
    watch: (v) => (v >= 8 ? "highUv" : null),
  },
];

export function metrics(locale: Locale = "am"): MetricDef[] {
  const copy = dictionary(locale);
  return BASE.map((metric) => ({
    key: metric.key,
    digits: metric.digits,
    color: metric.color,
    group: metric.group,
    label: copy.metrics[metric.key].label,
    unit: copy.metrics[metric.key].unit,
    watch: (value: number) => {
      const code = metric.watch(value);
      return code ? copy.watch[code] : null;
    },
  }));
}

export const METRICS = metrics();
export const GROUPS = dictionary("am").groups;

export function windDegNorm(deg: number) {
  const n = Math.round(((deg % 360) + 360) % 360);
  return n === 360 ? 0 : n;
}

export function windDirIndex(deg: number) {
  return Math.round(windDegNorm(deg) / 45) % 8;
}

export function windDirLabel(deg: number, locale: Locale = "am") {
  return dictionary(locale).wind.short[windDirIndex(deg)];
}

export function windDirFull(deg: number, locale: Locale = "am") {
  return dictionary(locale).wind.full[windDirIndex(deg)];
}

export function legendAmount(
  kind: "area" | "line" | "bars" | undefined,
  values: number[],
  digits: number,
  locale: Locale = "am",
) {
  const finite = values.filter((value) => Number.isFinite(value));
  if (finite.length === 0) return null;
  if (kind === "bars") {
    const sum = finite.reduce((total, value) => total + value, 0);
    return { prefix: dictionary(locale).chartsUi.sum, text: formatMetric(sum, digits, locale) };
  }
  return { text: formatMetric(finite[finite.length - 1], digits, locale) };
}

export function formatMetric(value: number, digits: number, locale: Locale = "am") {
  const tag = intlLocale(locale);
  if (digits === 0) return Math.round(value).toLocaleString(tag);
  return value.toLocaleString(tag, {
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
