import type { AirSlug, FieldKey } from "@/lib/i18n/dictionary";
import { dictionary } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/locale";
import { metrics, type MetricDef, type MetricGroup, type MetricKey } from "@/lib/metrics";

export type DetailPage = {
  group: MetricGroup;
  slug: string;
  key: MetricKey;
  about: string;
  reading: string;
  kind: "area" | "bars";
  metric: MetricDef;
};

const PAGES: { group: MetricGroup; slug: string; key: MetricKey; kind: "area" | "bars" }[] = [
  { group: "air", slug: "temperature", key: "airTemp", kind: "area" },
  { group: "air", slug: "humidity", key: "airHumidity", kind: "area" },
  { group: "air", slug: "wind", key: "windSpeed", kind: "area" },
  { group: "air", slug: "rain", key: "rainfallMm", kind: "bars" },
  { group: "air", slug: "pressure", key: "pressureHpa", kind: "area" },
  { group: "air", slug: "dew-point", key: "dewPoint", kind: "area" },
  { group: "soil", slug: "moisture", key: "soilMoisture", kind: "area" },
  { group: "soil", slug: "temperature", key: "soilTemp", kind: "area" },
  { group: "light", slug: "illuminance", key: "lightLux", kind: "area" },
  { group: "light", slug: "uv", key: "uvIndex", kind: "area" },
];

function copyFor(group: MetricGroup, slug: string, key: MetricKey, locale: Locale) {
  const text = dictionary(locale);
  if (group === "air") return text.air[slug as AirSlug];
  return text.field[key as FieldKey];
}

export function detailPage(group: string, slug: string, locale: Locale = "am"): DetailPage | null {
  const row = PAGES.find((item) => item.group === group && item.slug === slug);
  if (!row) return null;
  const metric = metrics(locale).find((item) => item.key === row.key);
  if (!metric) return null;
  return { ...row, ...copyFor(row.group, row.slug, row.key, locale), metric };
}

export function airPageBySlug(slug: string, locale: Locale = "am"): DetailPage | null {
  return detailPage("air", slug, locale);
}

export function airPath(key: MetricKey) {
  const row = PAGES.find((item) => item.key === key);
  return row ? `/${row.group}/${row.slug}` : null;
}
