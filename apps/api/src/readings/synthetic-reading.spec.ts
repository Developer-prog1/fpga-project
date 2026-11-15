import { describe, expect, it } from 'vitest';
import { dayHasRain, missingSlots, nextReading, rainfallAt } from './synthetic-reading.js';

describe('synthetic hourly feed', () => {
  it('fills each quarter of a passed hour and nothing of the current one', () => {
    const last = new Date(2026, 10, 16, 17, 45);
    const marks = missingSlots(last, new Date(2026, 10, 16, 18, 50)).map(
      (at) => `${at.getHours()}:${String(at.getMinutes()).padStart(2, '0')}`,
    );
    expect(marks).toEqual(['18:00', '18:15', '18:30', '18:45']);
    expect(missingSlots(last, new Date(2026, 10, 16, 17, 50))).toEqual([]);
  });

  it('keeps the day shape: cold dark night, warm bright afternoon', () => {
    const night = nextReading({ at: new Date(2026, 10, 16, 3, 0), soilMoisture: 36, windDirDeg: 200 });
    const afternoon = nextReading({ at: new Date(2026, 10, 16, 15, 0), soilMoisture: 36, windDirDeg: 200 });
    expect(afternoon.airTemp).toBeGreaterThan(night.airTemp + 8);
    expect(night.lightLux).toBe(0);
    expect(afternoon.lightLux).toBeGreaterThan(20_000);
    let soil = 36;
    let wind = 200;
    for (let step = 0; step < 4; step += 1) {
      const next = nextReading({
        at: new Date(2026, 10, 16, 15, step * 15),
        soilMoisture: soil,
        windDirDeg: wind,
      });
      soil = next.soilMoisture;
      wind = next.windDirDeg;
    }
    expect(soil).toBeLessThan(36);
  });

  it('rains only in the morning of a wet day', () => {
    const wet = Array.from({ length: 40 }, (_, day) => new Date(2026, 0, day + 1, 12)).find((at) => dayHasRain(at));
    const dry = Array.from({ length: 40 }, (_, day) => new Date(2026, 0, day + 1, 12)).find((at) => !dayHasRain(at));
    expect(wet).toBeTruthy();
    expect(dry).toBeTruthy();
    const morning = new Date(wet!.getFullYear(), wet!.getMonth(), wet!.getDate(), 6, 0);
    const evening = new Date(wet!.getFullYear(), wet!.getMonth(), wet!.getDate(), 16, 0);
    const dryMorning = new Date(dry!.getFullYear(), dry!.getMonth(), dry!.getDate(), 6, 0);
    expect(rainfallAt(morning)).toBeGreaterThan(0.5);
    expect(rainfallAt(evening)).toBe(0);
    expect(rainfallAt(dryMorning)).toBe(0);
    expect(nextReading({ at: morning, soilMoisture: 30, windDirDeg: 180 }).soilMoisture).toBeGreaterThan(30);
  });
});
