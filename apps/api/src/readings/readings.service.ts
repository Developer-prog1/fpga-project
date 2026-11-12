import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { buildHistory, historyWindow, parseHistorySpan, type HistorySample } from './history-series.js';

const historySelect = {
  recordedAt: true,
  airTemp: true,
  soilTemp: true,
  airHumidity: true,
  soilMoisture: true,
  windSpeed: true,
  rainfallMm: true,
  pressureHpa: true,
  lightLux: true,
  uvIndex: true,
  dewPoint: true,
} as const;

@Injectable()
export class ReadingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findRecent(hours: number) {
    const windowHours = Number.isFinite(hours) ? Math.min(Math.max(hours, 1), 168) : 24;
    const since = new Date(Date.now() - windowHours * 60 * 60 * 1000);

    const station = await this.prisma.station.findFirst({
      orderBy: { createdAt: 'asc' },
    });

    if (!station) return [];

    return this.prisma.reading.findMany({
      where: { stationId: station.id, recordedAt: { gte: since } },
      orderBy: { recordedAt: 'asc' },
    });
  }

  async history(spanRaw?: string) {
    const span = parseHistorySpan(spanRaw);
    const now = new Date();
    const window = historyWindow(span, now);
    const station = await this.prisma.station.findFirst({
      orderBy: { createdAt: 'asc' },
    });

    if (!station) {
      return buildHistory({ span, now, current: [], previous: [] });
    }

    const rows = await this.prisma.reading.findMany({
      where: {
        stationId: station.id,
        recordedAt: { gte: window.previousFrom, lte: window.to },
      },
      orderBy: { recordedAt: 'asc' },
      select: historySelect,
    });

    const current: HistorySample[] = [];
    const previous: HistorySample[] = [];
    for (const row of rows) {
      if (row.recordedAt >= window.from) current.push(row);
      else previous.push(row);
    }

    return buildHistory({ span, now, current, previous });
  }
}
