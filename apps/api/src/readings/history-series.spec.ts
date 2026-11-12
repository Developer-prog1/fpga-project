import { describe, expect, it } from 'vitest';
import { buildHistory, parseHistorySpan, type HistorySample } from './history-series.js';

function sample(at: Date, patch: Partial<HistorySample> = {}): HistorySample {
  return {
    recordedAt: at,
    airTemp: 10,
    soilTemp: 10,
    airHumidity: 50,
    soilMoisture: 40,
    windSpeed: 2,
    rainfallMm: 0,
    pressureHpa: 1010,
    lightLux: 100,
    uvIndex: 1,
    dewPoint: 5,
    ...patch,
  };
}

describe('parseHistorySpan', () => {
  it('keeps a known span and falls back to seven days', () => {
    expect(parseHistorySpan('24h')).toBe('24h');
    expect(parseHistorySpan('30d')).toBe('30d');
    expect(parseHistorySpan('year')).toBe('7d');
    expect(parseHistorySpan(undefined)).toBe('7d');
  });
});

describe('buildHistory', () => {
  const now = new Date(2026, 10, 12, 15, 0, 0);

  it('averages a half-hour bucket and sums the rain inside it', () => {
    const history = buildHistory({
      span: '24h',
      now,
      current: [
        sample(new Date(2026, 10, 12, 14, 10), { airTemp: 10, rainfallMm: 1.2 }),
        sample(new Date(2026, 10, 12, 14, 20), { airTemp: 12, rainfallMm: 1.8 }),
        sample(new Date(2026, 10, 12, 14, 40), { airTemp: 20, rainfallMm: 0.4 }),
      ],
      previous: [],
    });

    expect(history.points).toHaveLength(2);
    expect(history.points[0]?.airTemp).toBe(11);
    expect(history.points[0]?.rainfallMm).toBe(3);
    expect(history.points[1]?.airTemp).toBe(20);
    expect(history.points[1]?.rainfallMm).toBe(0.4);
    expect(new Date(history.points[0].recordedAt).getTime()).toBeLessThan(
      new Date(history.points[1].recordedAt).getTime(),
    );
    expect(history.shadeNight).toBe(true);
  });

  it('rolls a month into local days and compares it with the previous window', () => {
    const history = buildHistory({
      span: '30d',
      now,
      current: [
        sample(new Date(2026, 10, 3, 8, 0), { airTemp: 10, rainfallMm: 1.25 }),
        sample(new Date(2026, 10, 3, 21, 15), { airTemp: 20, rainfallMm: 1.25 }),
        sample(new Date(2026, 10, 4, 9, 0), { airTemp: 16, rainfallMm: 0 }),
      ],
      previous: [sample(new Date(2026, 9, 20, 12, 0), { airTemp: 8, rainfallMm: 4 })],
    });

    expect(history.shadeNight).toBe(false);
    expect(history.points).toHaveLength(2);
    expect(history.points[0]?.rainfallMm).toBe(2.5);
    expect(history.points[0]?.airTemp).toBe(15);
    expect(history.airTemp).toEqual({
      avg: 15.3,
      min: 10,
      max: 20,
      previousAvg: 8,
      delta: 7.3,
    });
    expect(history.rainfallMm).toEqual({ sum: 2.5, previousSum: 4, delta: -1.5 });
    expect(history.points.every((point) => point.recordedAt !== history.previousFrom)).toBe(true);
  });

  it('leaves the delta empty when the previous window has no readings', () => {
    const history = buildHistory({
      span: '7d',
      now,
      current: [sample(new Date(2026, 10, 12, 10, 0), { airTemp: 15 })],
      previous: [],
    });

    expect(history.airTemp.avg).toBe(15);
    expect(history.airTemp.previousAvg).toBeNull();
    expect(history.airTemp.delta).toBeNull();
    expect(history.rainfallMm.delta).toBeNull();
  });
});
