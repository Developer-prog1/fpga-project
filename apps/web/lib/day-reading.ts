import { groupByDay } from "./day-compare";
import { METRICS, formatMetric, type MetricDef, type MetricKey } from "./metrics";
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
  subject: string;
  genitive: string;
  unit: string;
  flat: number;
  mode: "curve" | "peak";
};

type ReadingSpec = LevelSpec | { kind: "rain" };

type Sample = { at: string; value: number };

type PartBucket = "night" | "morning" | "midday" | "evening";

const READINGS: Record<string, ReadingSpec[]> = {
  temperature: [
    level("airTemp", "Օդի ջերմաստիճանը", "Օդի ջերմաստիճանի", "°C", 1.5, "curve"),
    level("soilTemp", "Հողի ջերմաստիճանը", "Հողի ջերմաստիճանի", "°C", 0.8, "curve"),
  ],
  humidity: [
    level("airHumidity", "Օդի խոնավությունը", "Օդի խոնավության", "%", 8, "curve"),
    level("soilMoisture", "Հողի խոնավությունը", "Հողի խոնավության", "%", 3, "curve"),
  ],
  wind: [level("windSpeed", "Քամին", "Քամու", "m/s", 1.5, "curve"), { kind: "rain" }],
  light: [
    level("lightLux", "Լուսավորությունը", "Լուսավորության", "lux", 500, "peak"),
    level("uvIndex", "UV ինդեքսը", "UV ինդեքսի", "", 0.8, "peak"),
  ],
};

function level(
  key: LevelKey,
  subject: string,
  genitive: string,
  unit: string,
  flat: number,
  mode: LevelSpec["mode"],
): LevelSpec {
  return { kind: "level", key, subject, genitive, unit, flat, mode };
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
  options: { grain: HistoryGrain; compareDays: boolean },
): DayReading[] {
  const specs = READINGS[chartId];
  if (!specs || rows.length === 0) return [];

  const clock = options.grain !== "1d";
  const groups = options.compareDays
    ? groupByDay([...rows])
    : [{ key: "range", label: "", color: "", rows: [...rows] }];

  return groups
    .map((group) => ({
      key: group.key,
      label: options.compareDays ? group.label : null,
      color: options.compareDays ? group.color : null,
      paragraphs: specs
        .map((spec) =>
          spec.kind === "rain"
            ? rainParagraph(group.rows, options.grain)
            : levelParagraph(spec, group.rows, clock),
        )
        .filter((paragraph): paragraph is string => Boolean(paragraph)),
    }))
    .filter((reading) => reading.paragraphs.length > 0);
}

function levelParagraph(spec: LevelSpec, rows: readonly NarrativePoint[], clock: boolean) {
  const metric = METRICS.find((item) => item.key === spec.key);
  const samples = finiteSamples(rows, spec.key);
  if (!metric || samples.length === 0) return null;

  const values = samples.map((sample) => sample.value);
  const ends = extremes(samples);
  const flat = isFlat(spec, values);
  const shape = seriesShape(values, flat);
  const minDigits = claimDigits(ends.min, metric.digits, metric.watch);
  const maxDigits = claimDigits(ends.max, metric.digits, metric.watch);
  const minText = withUnit(formatMetric(ends.min, minDigits), spec.unit);
  const maxText = withUnit(formatMetric(ends.max, maxDigits), spec.unit);
  const span = quantitySpan(ends.min, ends.max, minDigits, maxDigits, spec.unit);
  const during = clock ? "օրվա ընթացքում" : "այս օրերի ընթացքում";

  const main = mainSentence({
    spec,
    shape,
    clock,
    ends,
    minText,
    maxText,
    span,
    during,
  });

  return [main, ...thresholdSentences(metric, ends.min, ends.max, minText, maxText, span)].join(" ");
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
}) {
  const { spec, shape, clock, ends, minText, maxText, span, during } = input;
  if (minText === maxText) return `${spec.subject} մնաց ${minText}։`;

  if (spec.mode === "peak" && shape !== "flat") {
    if (!clock) return `${spec.genitive} առավելագույնը ${maxText} էր։`;
    const when = dayPart(ends.maxAt, "vowel");
    return `${spec.genitive} գագաթնակետը ${when} էր՝ ${maxText}։`;
  }

  if (shape === "flat") return `${spec.subject} գրեթե չփոխվեց։ Մնաց ${span} միջակայքում։`;
  if (shape === "mixed") return `${spec.subject} ${during} ${span} միջակայքում էր։`;

  if (shape === "fell-then-rose") {
    const opening = clock ? `${dayPart(ends.minAt, "vowel")} իջավ` : "նախ իջավ";
    return `${spec.subject} ${opening} մինչև ${minText}, հետո նորից բարձրացավ։ Միջակայքը ${span} էր։`;
  }

  if (shape === "rose-then-fell") {
    const opening = clock ? `${dayPart(ends.maxAt, "consonant")} հասավ` : "նախ բարձրացավ";
    return `${spec.subject} ${opening} մինչև ${maxText}, հետո իջավ։ Միջակայքը ${span} էր։`;
  }

  if (shape === "fell") {
    const timed =
      clock && ends.maxIndex < ends.minIndex && partBucket(ends.maxAt) !== partBucket(ends.minAt);
    if (timed) {
      return `${spec.subject} ${dayPart(ends.maxAt, "consonant")} ${maxText} էր, ${dayPart(ends.minAt, "vowel")} իջավ մինչև ${minText}։`;
    }
    return `${spec.subject} ${during} իջավ։ Նվազագույնը ${minText} էր, առավելագույնը՝ ${maxText}։`;
  }

  const timed =
    clock && ends.minIndex < ends.maxIndex && partBucket(ends.minAt) !== partBucket(ends.maxAt);
  if (timed) {
    return `${spec.subject} ${dayPart(ends.minAt, "consonant")} ${minText} էր, ${dayPart(ends.maxAt, "consonant")} բարձրացավ մինչև ${maxText}։`;
  }
  return `${spec.subject} ${during} բարձրացավ։ Նվազագույնը ${minText} էր, առավելագույնը՝ ${maxText}։`;
}

function thresholdSentences(
  metric: MetricDef,
  min: number,
  max: number,
  minText: string,
  maxText: string,
  span: string,
) {
  const low = metric.watch(min);
  const high = metric.watch(max);
  if (low && low === high) return [`Ամբողջ հատվածը ${low} է (${span})։`];
  const lines: string[] = [];
  if (low) lines.push(`Նվազագույնը ${low} է (${minText})։`);
  if (high) lines.push(`Առավելագույնը ${high} է (${maxText})։`);
  return lines;
}

function rainParagraph(rows: readonly NarrativePoint[], grain: HistoryGrain) {
  const metric = METRICS.find((item) => item.key === "rainfallMm");
  const samples = finiteSamples(rows, "rainfallMm");
  if (!metric || samples.length === 0) return null;

  const total = samples.reduce((sum, sample) => sum + sample.value, 0);
  const peak = Math.max(...samples.map((sample) => sample.value));
  if (roundTo(total, 2) <= 0 && roundTo(peak, 2) <= 0) return "Տեղում չի եղել։";

  const peakDigits = claimDigits(peak, metric.digits, metric.watch);
  const totalText = withUnit(formatMetric(total, metric.digits), "մմ");
  const peakText = withUnit(formatMetric(peak, peakDigits), "մմ");
  const where = grain === "1d" ? "մեկ օրում" : "մեկ միջակայքում";
  const heavy = metric.watch(peak);
  const peakSentence = heavy
    ? `Ամենաշատը ${where} ${peakText} էր։ Դա ${heavy} է։`
    : `Ամենաշատը ${where} ${peakText} էր։`;
  return `Տեղումների գումարը ${totalText} է։ ${peakSentence}`;
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

function quantitySpan(min: number, max: number, minDigits: number, maxDigits: number, unit: string) {
  const lo = formatMetric(min, minDigits);
  const hi = formatMetric(max, maxDigits);
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

function dayPart(iso: string, next: "vowel" | "consonant") {
  const bucket = partBucket(iso);
  if (bucket === "night") return next === "vowel" ? "գիշերն" : "գիշերը";
  if (bucket === "morning") return "առավոտյան";
  if (bucket === "midday") return "կեսօրին";
  return "երեկոյան";
}
