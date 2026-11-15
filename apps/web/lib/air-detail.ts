import type { AirSlug } from "@/lib/i18n/dictionary";
import { dictionary } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/locale";
import { metrics, type MetricDef, type MetricKey } from "@/lib/metrics";

export type AirDetail = {
  slug: AirSlug;
  key: MetricKey;
  about: string;
  reading: string;
  kind: "area" | "bars";
  metric: MetricDef;
};

const PAGES: { slug: AirSlug; key: MetricKey; kind: "area" | "bars" }[] = [
  { slug: "temperature", key: "airTemp", kind: "area" },
  { slug: "humidity", key: "airHumidity", kind: "area" },
  { slug: "wind", key: "windSpeed", kind: "area" },
  { slug: "rain", key: "rainfallMm", kind: "bars" },
  { slug: "pressure", key: "pressureHpa", kind: "area" },
  { slug: "dew-point", key: "dewPoint", kind: "area" },
];

export function airPageBySlug(slug: string, locale: Locale = "am"): AirDetail | null {
  const row = PAGES.find((item) => item.slug === slug);
  if (!row) return null;
  const metric = metrics(locale).find((item) => item.key === row.key);
  if (!metric) return null;
  const text = dictionary(locale).air[row.slug];
  return { ...row, ...text, metric };
}

export function airPath(key: MetricKey) {
  const row = PAGES.find((item) => item.key === key);
  return row ? `/air/${row.slug}` : null;
}
