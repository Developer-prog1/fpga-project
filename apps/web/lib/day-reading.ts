import { narrativeCopy, type NarrativeCopy } from "./i18n/narrative";
import type { Locale } from "./i18n/locale";
import { groupByDay } from "./day-compare";
import { formatMetric, metrics, type MetricDef, type MetricKey } from "./metrics";
import type { HistoryGrain } from "./types";

export type NarrativePoint = {
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

export type DayReading = {
  key: string;
  label: string | null;
  color: string | null;
  paragraphs: string[];
};

export type SeriesShape = "flat" | "fell" | "rose" | "fell-then-rose" | "rose-then-fell" | "mixed";

type LevelKey = Extract<MetricKey, keyof NarrativePoint>;

type LevelSpec = {
  kind: "level";
  key: LevelKey;
  unit: string;
  flat: number;
  mode: "curve" | "peak";
};

type ReadingSpec = LevelSpec | { kind: "rain" };

type Sample = { at: string; value: number };

type PartBucket = "night" | "morning" | "midday" | "evening";

const READINGS: Record<string, ReadingSpec[]> = {
  temperature: [level("airTemp", "°C", 1.5, "curve"), level("soilTemp", "°C", 0.8, "curve")],
  humidity: [level("airHumidity", "%", 8, "curve"), level("soilMoisture", "%", 3, "curve")],
  wind: [level("windSpeed", "m/s", 1.5, "curve"), { kind: "rain" }],
  light: [level("lightLux", "lux", 500, "peak"), level("uvIndex", "", 0.8, "peak")],
};

function level(key: LevelKey, unit: string, flat: number, mode: LevelSpec["mode"]): LevelSpec {
  return { kind: "level", key, unit, flat, mode };
}

/**
 * Direction verbs are allowed only when the samples support that order.
 * A curve that matches two stories at once, or none, stays a min–max span.
 * The interior of the series is (0.25, 0.75). A move counts when it covers
 * at least 35% of the range, and a smaller swing than `flat` is no swing.
 */
export function seriesShape(values: number[], flat: boolean): SeriesShape {
  if (flat || values.length < 2) return "flat";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  if (!(range > 0)) return "flat";

  const last = values.length - 1;
  const minAt = values.indexOf(min);
  const maxAt = values.indexOf(max);
  const minPos = minAt / last;
  const maxPos = maxAt / last;
  const start = values[0] ?? min;
  const end = values[last] ?? max;
  const band = range * 0.35;
  const interior = (pos: number) => pos > 0.25 && pos < 0.75;
  const dip = interior(minPos) && start - min >= band && end - min >= band;
  const crest = interior(maxPos) && max - start >= band && max - end >= band;

  if (dip && crest) return "mixed";
  if (dip) return "fell-then-rose";
  if (crest) return "rose-then-fell";
  if (end <= start - band) return "fell";
  if (end >= start + band) return "rose";
  return "mixed";
}

export function historyNarratives(
  chartId: string,
  rows: readonly NarrativePoint[],
  options: { grain: HistoryGrain; compareDays: boolean; locale?: Locale },
): DayReading[] {
  const specs = READINGS[chartId];
  if (!specs || rows.length === 0) return [];

  const locale = options.locale ?? "am";
  const copy = narrativeCopy(locale);
  const clock = options.grain !== "1d";
  const groups = options.compareDays
    ? groupByDay([...rows], locale)
    : [{ key: "range", label: "", color: "", rows: [...rows] }];

  return groups
    .map((group) => ({
      key: group.key,
      label: options.compareDays ? group.label : null,
      color: options.compareDays ? group.color : null,
      paragraphs: specs
        .map((spec) =>
          spec.kind === "rain"
            ? rainParagraph(group.rows, options.grain, locale, copy)
            : levelParagraph(spec, group.rows, clock, locale, copy),
        )
        .filter((paragraph): paragraph is string => Boolean(paragraph)),
    }))
    .filter((reading) => reading.paragraphs.length > 0);
}

function levelParagraph(
  spec: LevelSpec,
  rows: readonly NarrativePoint[],
  clock: boolean,
  locale: Locale,
  copy: NarrativeCopy,
) {
  const metric = metrics(locale).find((item) => item.key === spec.key);
  const samples = finiteSamples(rows, spec.key);
  if (!metric || samples.length === 0) return null;

  const values = samples.map((sample) => sample.value);
  const ends = extremes(samples);
  const flat = isFlat(spec, values);
  const shape = seriesShape(values, flat);
  const minDigits = claimDigits(ends.min, metric.digits, metric.watch);
  const maxDigits = claimDigits(ends.max, metric.digits, metric.watch);
  const minText = withUnit(formatMetric(ends.min, minDigits, locale), spec.unit);
  const maxText = withUnit(formatMetric(ends.max, maxDigits, locale), spec.unit);
  const span = quantitySpan(ends.min, ends.max, minDigits, maxDigits, spec.unit, locale);
  const during = copy.during(clock);

  const main = mainSentence({ spec, shape, clock, ends, minText, maxText, span, during, copy });

  return [main, ...thresholdSentences(copy, metric, ends.min, ends.max, minText, maxText, span)].join(" ");
}

function mainSentence(input: {
  spec: LevelSpec;
  shape: SeriesShape;
  clock: boolean;
  ends: Extremes;
  minText: string;
  maxText: string;
  span: string;
  during: string;
  copy: NarrativeCopy;
}) {
  const { spec, shape, clock, ends, minText, maxText, span, during, copy } = input;
  const when = (iso: string, next: "vowel" | "consonant") => copy.dayPart(partBucket(iso), next);
  if (minText === maxText) return copy.stayed(spec.key, minText);

  if (spec.mode === "peak" && shape !== "flat") {
    if (!clock) return copy.peakSpan(spec.key, maxText);
    return copy.peakClock(spec.key, when(ends.maxAt, "vowel"), maxText);
  }

  if (shape === "flat") return copy.flat(spec.key, span);
  if (shape === "mixed") return copy.mixed(spec.key, during, span);

  if (shape === "fell-then-rose") {
    return copy.fellThenRose(spec.key, clock ? when(ends.minAt, "vowel") : null, minText, span);
  }

  if (shape === "rose-then-fell") {
    return copy.roseThenFell(spec.key, clock ? when(ends.maxAt, "consonant") : null, maxText, span);
  }

  if (shape === "fell") {
    const timed =
      clock && ends.maxIndex < ends.minIndex && partBucket(ends.maxAt) !== partBucket(ends.minAt);
    if (timed) {
      return copy.fellTimed(spec.key, when(ends.maxAt, "consonant"), maxText, when(ends.minAt, "vowel"), minText);
    }
    return copy.fell(spec.key, during, minText, maxText);
  }

  const timed =
    clock && ends.minIndex < ends.maxIndex && partBucket(ends.minAt) !== partBucket(ends.maxAt);
  if (timed) {
    return copy.roseTimed(
      spec.key,
      when(ends.minAt, "consonant"),
      minText,
      when(ends.maxAt, "consonant"),
      maxText,
    );
  }
  return copy.rose(spec.key, during, minText, maxText);
}

function thresholdSentences(
  copy: NarrativeCopy,
  metric: MetricDef,
  min: number,
  max: number,
  minText: string,
  maxText: string,
  span: string,
) {
  const low = metric.watch(min);
  const high = metric.watch(max);
  if (low && low === high) return [copy.whole(low, span)];
  const lines: string[] = [];
  if (low) lines.push(copy.lowIs(low, minText));
  if (high) lines.push(copy.highIs(high, maxText));
  return lines;
}

function rainParagraph(
  rows: readonly NarrativePoint[],
  grain: HistoryGrain,
  locale: Locale,
  copy: NarrativeCopy,
) {
  const metric = metrics(locale).find((item) => item.key === "rainfallMm");
  const samples = finiteSamples(rows, "rainfallMm");
  if (!metric || samples.length === 0) return null;

  const total = samples.reduce((sum, sample) => sum + sample.value, 0);
  const peak = Math.max(...samples.map((sample) => sample.value));
  if (roundTo(total, 2) <= 0 && roundTo(peak, 2) <= 0) return copy.noRain;

  const peakDigits = claimDigits(peak, metric.digits, metric.watch);
  const totalText = withUnit(formatMetric(total, metric.digits, locale), copy.rainUnit);
  const peakText = withUnit(formatMetric(peak, peakDigits, locale), copy.rainUnit);
  return copy.rain(totalText, copy.rainWhere(grain === "1d"), peakText, metric.watch(peak));
}

function isFlat(spec: LevelSpec, values: number[]) {
  if (values.length < 2) return true;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  if (spec.key === "lightLux") return range < Math.max(spec.flat, Math.abs(max) * 0.08);
  return range < spec.flat;
}

type Extremes = {
  min: number;
  max: number;
  minAt: string;
  maxAt: string;
  minIndex: number;
  maxIndex: number;
};

function extremes(samples: Sample[]): Extremes {
  let minIndex = 0;
  let maxIndex = 0;
  samples.forEach((sample, index) => {
    const min = samples[minIndex];
    const max = samples[maxIndex];
    if (min && sample.value < min.value) minIndex = index;
    if (max && sample.value > max.value) maxIndex = index;
  });
  const min = samples[minIndex] ?? samples[0];
  const max = samples[maxIndex] ?? samples[0];
  return {
    min: min?.value ?? 0,
    max: max?.value ?? 0,
    minAt: min?.at ?? "",
    maxAt: max?.at ?? "",
    minIndex,
    maxIndex,
  };
}

function finiteSamples(rows: readonly NarrativePoint[], key: LevelKey): Sample[] {
  return rows.flatMap((row) => {
    const value = row[key];
    return typeof value === "number" && Number.isFinite(value) ? [{ at: row.recordedAt, value }] : [];
  });
}

function claimDigits(value: number, digits: number, watch: (value: number) => string | null) {
  const shown = roundTo(value, digits);
  if (watch(value) === watch(shown)) return digits;
  return digits + 1;
}

function roundTo(value: number, digits: number) {
  if (digits <= 0) return Math.round(value);
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function withUnit(text: string, unit: string) {
  if (!unit) return text;
  if (unit === "%") return `${text}%`;
  return `${text} ${unit}`;
}

function quantitySpan(
  min: number,
  max: number,
  minDigits: number,
  maxDigits: number,
  unit: string,
  locale: Locale,
) {
  const lo = formatMetric(min, minDigits, locale);
  const hi = formatMetric(max, maxDigits, locale);
  if (lo === hi) return withUnit(lo, unit);
  if (!unit) return `${lo}–${hi}`;
  if (unit === "%") return `${lo}–${hi}%`;
  return `${lo}–${hi} ${unit}`;
}

function partBucket(iso: string): PartBucket {
  const hour = new Date(iso).getHours();
  if (hour < 6 || hour >= 21) return "night";
  if (hour < 11) return "morning";
  if (hour < 16) return "midday";
  return "evening";
}
