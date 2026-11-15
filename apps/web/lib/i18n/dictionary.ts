import type { HistoryGrain, HistorySpan } from "@/lib/types";

export type WatchCode =
  | "frost"
  | "heat"
  | "dryAir"
  | "veryHumid"
  | "strongWind"
  | "heavyRain"
  | "lowPressure"
  | "highPressure"
  | "drySoil"
  | "waterlogged"
  | "coldSoil"
  | "highUv";

export type MetricCopyKey =
  | "airTemp"
  | "airHumidity"
  | "windSpeed"
  | "rainfallMm"
  | "pressureHpa"
  | "dewPoint"
  | "soilMoisture"
  | "soilTemp"
  | "lightLux"
  | "uvIndex";

export type ChartId = "temperature" | "humidity" | "wind" | "light";

export type AirSlug = "temperature" | "humidity" | "wind" | "rain" | "pressure" | "dew-point";

export type MetricGroupId = "air" | "soil" | "light";

type MonthNames = [string, string, string, string, string, string, string, string, string, string, string, string];

type WeekNames = [string, string, string, string, string, string, string];

type WindNames = [string, string, string, string, string, string, string, string];

export type Dictionary = {
  meta: { title: string; titleTemplate: string; description: string; reading: string };
  brand: { mark: string; fullName: string };
  nav: { aria: string; now: string; history: string };
  lang: { group: string; hy: string; en: string; ru: string };
  station: { location: string };
  empty: { title: string; body: string };
  notFound: { title: string; body: string; home: string };
  back: { home: string };
  normal: string;
  watch: Record<WatchCode, string>;
  groups: { id: MetricGroupId; title: string; note: string }[];
  metrics: Record<MetricCopyKey, { label: string; unit: string }>;
  wind: { short: WindNames; full: WindNames };
  hero: {
    latest: string;
    airRange: (min: string, max: string) => string;
    rain: (amount: string) => string;
    nowAir: string;
    humidity: string;
    dewPoint: string;
    pressure: string;
    ribbon: (when?: string) => string;
    wind: string;
    comingFrom: (full: string, short: string, deg: number) => string;
    soil: string;
    soilTemp: (value: string) => string;
  };
  hints: {
    direction: (short: string, deg: number) => string;
    rainSum: (amount: string) => string;
  };
  range: { low: string; high: string };
  open: string;
  homeTrend: { title: string; note: string };
  detail: {
    atmosphere: string;
    now: string;
    chart: string;
    min: string;
    mean: string;
    max: string;
  };
  air: Record<AirSlug, { about: string; reading: string }>;
  charts: Record<ChartId, { title: string; note: string; compareNote: string; labels: [string, string] }>;
  chartsUi: {
    wind: string;
    soil: string;
    dry: string;
    wet: string;
    sum: string;
    cardinals: [string, string, string, string];
  };
  history: {
    kicker: string;
    title: string;
    intro: (range: string) => string;
    empty: string;
    grainMean: Record<HistoryGrain, string>;
    compareDaysNote: (mean: string) => string;
    detailPoints: (mean: string) => string;
    recentOnly: (hours: number, label: string) => string;
    selectedDay: string;
    selectedDays: string;
    spans: Record<HistorySpan, { title: string; previous: string }>;
    grain: Record<HistoryGrain, string>;
    previousDay: string;
    previousDays: (count: number) => string;
    narrativeDay: string;
    narrativeDays: string;
    narrativeCompare: string;
    avg: string;
    sum: string;
    noReading: string;
    noPrevious: (word: string, current: string, previous: string) => string;
    compared: (word: string, current: string, previous: string, previousValue: string) => string;
    range: (min: string, max: string, unit: string) => string;
    cards: { air: string; soil: string; rain: string; wind: string };
  };
  calendar: {
    label: string;
    selected: (range: string) => string;
    prevMonth: string;
    nextMonth: string;
    day: (day: number, month: string, year: number) => string;
    empty: string;
    choose: string;
    startPicked: (day: string) => string;
    view: string;
    weekdays: WeekNames;
    months: MonthNames;
    monthsShort: MonthNames;
  };
};
