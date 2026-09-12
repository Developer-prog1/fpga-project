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
