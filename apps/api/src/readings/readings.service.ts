import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  buildHistory,
  dayKey,
  historyWindow,
  parseHistorySpan,
  resolveDayRange,
  type HistorySample,
} from './history-series.js';

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

  async history(query: { span?: string; from?: string; to?: string }) {
    const custom = resolveDayRange(query.from, query.to);
    const span = custom ? null : parseHistorySpan(query.span);
    const window = custom ?? historyWindow(span ?? '7d', new Date());
    const station = await this.prisma.station.findFirst({
      orderBy: { createdAt: 'asc' },
    });

    if (!station) {
      return buildHistory({
        span,
        window,
        archiveFrom: null,
        archiveTo: null,
        current: [],
        previous: [],
      });
    }

    const [bounds, rows] = await Promise.all([
      this.prisma.reading.aggregate({
        where: { stationId: station.id },
        _min: { recordedAt: true },
        _max: { recordedAt: true },
      }),
      this.prisma.reading.findMany({
        where: {
          stationId: station.id,
          recordedAt: { gte: window.previousFrom, lte: window.to },
        },
        orderBy: { recordedAt: 'asc' },
        select: historySelect,
      }),
    ]);

    const current: HistorySample[] = [];
    const previous: HistorySample[] = [];
    for (const row of rows) {
      if (row.recordedAt >= window.from) current.push(row);
      else previous.push(row);
    }

    return buildHistory({
      span,
      window,
      archiveFrom: bounds._min.recordedAt ? dayKey(bounds._min.recordedAt) : null,
      archiveTo: bounds._max.recordedAt ? dayKey(bounds._max.recordedAt) : null,
      current,
      previous,
    });
  }
}
