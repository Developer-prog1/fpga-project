export type Station = {
  id: string;
  name: string;
  location: string | null;
};

export type Reading = {
  id: string;
  recordedAt: string;
  windSpeed: number;
  windDirDeg: number;
  soilMoisture: number;
  soilTemp: number;
  airTemp: number;
  airHumidity: number;
  rainfallMm: number;
  pressureHpa: number;
  lightLux: number;
  uvIndex: number;
  dewPoint: number;
  stationId: string;
};

export type Range = { min: number | null; max: number | null; sum?: number | null };

export type Overview = {
  station: Station | null;
  latest: Reading | null;
  summary: {
    airTemp: Range;
    soilTemp: Range;
    airHumidity: Range;
    soilMoisture: Range;
    windSpeed: Range;
    rainfallMm: Range;
  } | null;
};

export type HistorySpan = "24h" | "7d" | "30d";

export type HistoryGrain = "30m" | "2h" | "1d";

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

export type HistoryResponse = {
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
