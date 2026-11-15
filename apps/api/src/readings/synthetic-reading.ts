const QUARTER_MS = 15 * 60 * 1000;

export type SyntheticReading = {
  recordedAt: Date;
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
};

export function floorQuarter(date: Date) {
  const floored = new Date(date);
  floored.setSeconds(0, 0);
  floored.setMinutes(Math.floor(floored.getMinutes() / 15) * 15);
  return floored;
}

/** Quarter-hour marks strictly after `last` and not after the current quarter. */
export function missingSlots(last: Date, now: Date) {
  const end = floorQuarter(now).getTime();
  const slots: Date[] = [];
  let cursor = floorQuarter(new Date(last.getTime() + QUARTER_MS)).getTime();
  if (cursor <= last.getTime()) cursor += QUARTER_MS;
  while (cursor <= end && slots.length < 14 * 24 * 4) {
    slots.push(new Date(cursor));
    cursor += QUARTER_MS;
  }
  return slots;
}

export function msUntilNextHour(now = Date.now()) {
  const next = new Date(now);
  next.setMinutes(0, 0, 0);
  next.setHours(next.getHours() + 1);
  return Math.max(next.getTime() - now, 1000);
}

/** About three mornings in ten. The same day always gives the same answer. */
export function dayHasRain(at: Date) {
  const key = at.getFullYear() * 372 + at.getMonth() * 31 + at.getDate();
  const mix = Math.sin(key * 12.9898) * 43758.5453;
  return mix - Math.floor(mix) < 0.3;
}

export function rainfallAt(at: Date) {
  if (!dayHasRain(at)) return 0;
  const hour = at.getHours() + at.getMinutes() / 60;
  if (hour < 5 || hour >= 7.25) return 0;
  return round(Math.sin(((hour - 5) / 2.25) * Math.PI) * 1.15, 2);
}

export function nextReading(input: {
  at: Date;
  soilMoisture: number;
  windDirDeg: number;
}): SyntheticReading {
  const { at } = input;
  const hour = at.getHours() + at.getMinutes() / 60;
  const wave = Math.sin(((hour - 9) / 24) * Math.PI * 2);
  const daySun = hour >= 6.5 && hour <= 18.5 ? Math.sin(((hour - 6.5) / 12) * Math.PI) : 0;
  const rainfallMm = rainfallAt(at);
  const overcast = rainfallMm > 0.35 ? 0.42 : 1;
  const wobble = Math.sin(at.getTime() / 60_000 * 0.37) * 0.15;
  const airTemp = round(clamp(14.5 + wave * 8.5 + wobble, -3, 38));
  const airHumidity = round(clamp(64 - wave * 22, 28, 96), 0);
  const soilMoisture = round(clamp(input.soilMoisture - 0.05 + rainfallMm * 2.2, 17, 74), 2);
  const windDirDeg = Math.round((input.windDirDeg + 0.4) % 360);

  return {
    recordedAt: at,
    airTemp,
    airHumidity,
    soilTemp: round(15 + wave * 3.2 + wobble * 0.2),
    soilMoisture,
    windSpeed: round(clamp(0.8 + Math.max(wave, 0) * 5.2, 0.2, 14)),
    windDirDeg: windDirDeg < 0 ? windDirDeg + 360 : windDirDeg,
    rainfallMm,
    pressureHpa: round(1014 - (rainfallMm > 0 ? 5 : 0) + wave * -1.2),
    lightLux: round(daySun * 74000 * overcast, 0),
    uvIndex: round(clamp(daySun * 7.2 * overcast, 0, 11)),
    dewPoint: round(dewPoint(airTemp, airHumidity)),
  };
}

function round(value: number, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function dewPoint(tempC: number, rh: number) {
  const a = 17.27;
  const b = 237.7;
  const gamma = (a * tempC) / (b + tempC) + Math.log(Math.max(rh, 1) / 100);
  return (b * gamma) / (a - gamma);
}
