export const HISTORY_SPANS = ['24h', '7d', '30d'] as const;

export type HistorySpan = (typeof HISTORY_SPANS)[number];

const HOUR = 60 * 60 * 1000;

export const SPAN_MS: Record<HistorySpan, number> = {
  '24h': 24 * HOUR,
  '7d': 7 * 24 * HOUR,
  '30d': 30 * 24 * HOUR,
};

const AVG_KEYS = [
  'airTemp',
  'soilTemp',
  'airHumidity',
  'soilMoisture',
  'windSpeed',
  'pressureHpa',
  'lightLux',
  'uvIndex',
  'dewPoint',
] as const;

type AvgKey = (typeof AVG_KEYS)[number];

const DIGITS: Record<AvgKey, number> = {
  airTemp: 1,
  soilTemp: 1,
  airHumidity: 1,
  soilMoisture: 1,
  windSpeed: 1,
  pressureHpa: 1,
  lightLux: 0,
  uvIndex: 1,
  dewPoint: 1,
};

export type HistorySample = {
  recordedAt: Date;
  airTemp: number;
  soilTemp: number;
  airHumidity: number;
  soilMoisture: number;
  windSpeed: number;
  rainfallMm: number;
  pressureHpa: number;
  lightLux: number;
  uvIndex: number;
  dewPoint: number;
};

export type HistoryPoint = {
  recordedAt: string;
  airTemp: number;
  soilTemp: number;
  airHumidity: number;
  soilMoisture: number;
  windSpeed: number;
  rainfallMm: number;
  pressureHpa: number;
  lightLux: number;
  uvIndex: number;
  dewPoint: number;
};

export type LevelCompare = {
  avg: number | null;
  min: number | null;
  max: number | null;
  previousAvg: number | null;
  delta: number | null;
};

export type SumCompare = {
  sum: number | null;
  previousSum: number | null;
  delta: number | null;
};

export type HistoryGrain = '30m' | '2h' | '1d';

export type HistoryWindow = {
  from: Date;
  to: Date;
  previousFrom: Date;
  dayFrom: string;
  dayTo: string;
  grain: HistoryGrain;
};

export type HistorySeries = {
  span: HistorySpan | null;
  grain: HistoryGrain;
  from: string;
  to: string;
  previousFrom: string;
  dayFrom: string;
  dayTo: string;
  archiveFrom: string | null;
  archiveTo: string | null;
  shadeNight: boolean;
  points: HistoryPoint[];
  airTemp: LevelCompare;
  soilTemp: LevelCompare;
  airHumidity: LevelCompare;
  soilMoisture: LevelCompare;
  windSpeed: LevelCompare;
  pressureHpa: LevelCompare;
  lightLux: LevelCompare;
  uvIndex: LevelCompare;
  dewPoint: LevelCompare;
  rainfallMm: SumCompare;
};

export function parseHistorySpan(value: string | undefined): HistorySpan {
  if (value === '24h' || value === '7d' || value === '30d') return value;
  return '7d';
}

export function historyWindow(span: HistorySpan, now: Date): HistoryWindow {
  const spanMs = SPAN_MS[span];
  const from = new Date(now.getTime() - spanMs);
  return {
    to: now,
    from,
    previousFrom: new Date(now.getTime() - spanMs * 2),
    dayFrom: dayKey(from),
    dayTo: dayKey(now),
    grain: grainFor(spanMs),
  };
}

export function dayKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDayKey(value: string | undefined) {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

export function grainFor(durationMs: number): HistoryGrain {
  if (durationMs <= 36 * HOUR) return '30m';
  if (durationMs <= 10 * 24 * HOUR) return '2h';
  return '1d';
}

const MAX_RANGE_DAYS = 90;

export function resolveDayRange(fromRaw?: string, toRaw?: string): HistoryWindow | null {
  const parsedFrom = parseDayKey(fromRaw);
  const parsedTo = parseDayKey(toRaw);
  if (!parsedFrom && !parsedTo) return null;

  let start = parsedFrom ?? parsedTo!;
  let end = parsedTo ?? parsedFrom!;
  if (start.getTime() > end.getTime()) {
    const swap = start;
    start = end;
    end = swap;
  }

  const maxEnd = new Date(start);
  maxEnd.setDate(maxEnd.getDate() + MAX_RANGE_DAYS - 1);
  if (end.getTime() > maxEnd.getTime()) end = maxEnd;

  const from = new Date(start);
  from.setHours(0, 0, 0, 0);
  const toExclusive = new Date(end);
  toExclusive.setDate(toExclusive.getDate() + 1);
  toExclusive.setHours(0, 0, 0, 0);
  const spanMs = toExclusive.getTime() - from.getTime();

  return {
    from,
    to: new Date(toExclusive.getTime() - 1),
    previousFrom: new Date(from.getTime() - spanMs),
    dayFrom: dayKey(start),
    dayTo: dayKey(end),
    grain: grainFor(spanMs),
  };
}

function round(value: number, digits: number) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function mean(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function bucketStart(date: Date, grain: HistoryGrain) {
  const next = new Date(date.getTime());
  if (grain === '1d') {
    next.setHours(0, 0, 0, 0);
    return next.getTime();
  }
  if (grain === '2h') {
    next.setMinutes(0, 0, 0);
    next.setHours(next.getHours() - (next.getHours() % 2));
    return next.getTime();
  }
  next.setSeconds(0, 0);
  next.setMinutes(next.getMinutes() - (next.getMinutes() % 30));
  return next.getTime();
}

function bucketSeries(rows: HistorySample[], grain: HistoryGrain): HistoryPoint[] {
  const buckets = new Map<
    number,
    { at: number; count: number; rainfallMm: number; sums: Record<AvgKey, number> }
  >();

  for (const row of rows) {
    const at = bucketStart(row.recordedAt, grain);
    let bucket = buckets.get(at);
    if (!bucket) {
      bucket = {
        at,
        count: 0,
        rainfallMm: 0,
        sums: {
          airTemp: 0,
          soilTemp: 0,
          airHumidity: 0,
          soilMoisture: 0,
          windSpeed: 0,
          pressureHpa: 0,
          lightLux: 0,
          uvIndex: 0,
          dewPoint: 0,
        },
      };
      buckets.set(at, bucket);
    }
    bucket.count += 1;
    bucket.rainfallMm += row.rainfallMm;
    for (const key of AVG_KEYS) bucket.sums[key] += row[key];
  }

  return [...buckets.values()]
    .sort((a, b) => a.at - b.at)
    .map((bucket) => {
      const point = {
        recordedAt: new Date(bucket.at).toISOString(),
        rainfallMm: round(bucket.rainfallMm, 2),
      } as HistoryPoint;
      for (const key of AVG_KEYS) {
        point[key] = round(bucket.sums[key] / bucket.count, DIGITS[key]);
      }
      return point;
    });
}

function level(current: HistorySample[], previous: HistorySample[], key: AvgKey): LevelCompare {
  if (current.length === 0) {
    return { avg: null, min: null, max: null, previousAvg: null, delta: null };
  }
  const digits = DIGITS[key];
  const values = current.map((row) => row[key]);
  const avg = round(mean(values), digits);
  const previousAvg =
    previous.length === 0 ? null : round(mean(previous.map((row) => row[key])), digits);
  return {
    avg,
    min: round(Math.min(...values), digits),
    max: round(Math.max(...values), digits),
    previousAvg,
    delta: previousAvg == null ? null : round(avg - previousAvg, digits),
  };
}

function rainfall(current: HistorySample[], previous: HistorySample[]): SumCompare {
  if (current.length === 0) {
    return { sum: null, previousSum: null, delta: null };
  }
  const sum = round(
    current.reduce((total, row) => total + row.rainfallMm, 0),
    1,
  );
  const previousSum =
    previous.length === 0
      ? null
      : round(
          previous.reduce((total, row) => total + row.rainfallMm, 0),
          1,
        );
  return {
    sum,
    previousSum,
    delta: previousSum == null ? null : round(sum - previousSum, 1),
  };
}

export function buildHistory(input: {
  span: HistorySpan | null;
  window: HistoryWindow;
  archiveFrom: string | null;
  archiveTo: string | null;
  current: HistorySample[];
  previous: HistorySample[];
}): HistorySeries {
  return {
    span: input.span,
    grain: input.window.grain,
    from: input.window.from.toISOString(),
    to: input.window.to.toISOString(),
    previousFrom: input.window.previousFrom.toISOString(),
    dayFrom: input.window.dayFrom,
    dayTo: input.window.dayTo,
    archiveFrom: input.archiveFrom,
    archiveTo: input.archiveTo,
    shadeNight: input.window.grain !== '1d',
    points: bucketSeries(input.current, input.window.grain),
    airTemp: level(input.current, input.previous, 'airTemp'),
    soilTemp: level(input.current, input.previous, 'soilTemp'),
    airHumidity: level(input.current, input.previous, 'airHumidity'),
    soilMoisture: level(input.current, input.previous, 'soilMoisture'),
    windSpeed: level(input.current, input.previous, 'windSpeed'),
    pressureHpa: level(input.current, input.previous, 'pressureHpa'),
    lightLux: level(input.current, input.previous, 'lightLux'),
    uvIndex: level(input.current, input.previous, 'uvIndex'),
    dewPoint: level(input.current, input.previous, 'dewPoint'),
    rainfallMm: rainfall(input.current, input.previous),
  };
}
