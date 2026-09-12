import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class OverviewService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const station = await this.prisma.station.findFirst({
      orderBy: { createdAt: 'asc' },
    });

    if (!station) {
      return { station: null, latest: null, summary: null };
    }

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [latest, stats] = await Promise.all([
      this.prisma.reading.findFirst({
        where: { stationId: station.id },
        orderBy: { recordedAt: 'desc' },
      }),
      this.prisma.reading.aggregate({
        where: { stationId: station.id, recordedAt: { gte: since } },
        _min: {
          airTemp: true,
          soilTemp: true,
          airHumidity: true,
          soilMoisture: true,
          windSpeed: true,
          rainfallMm: true,
        },
        _max: {
          airTemp: true,
          soilTemp: true,
          airHumidity: true,
          soilMoisture: true,
          windSpeed: true,
          rainfallMm: true,
        },
        _sum: { rainfallMm: true },
      }),
    ]);

    return {
      station,
      latest,
      summary: {
        airTemp: { min: stats._min.airTemp, max: stats._max.airTemp },
        soilTemp: { min: stats._min.soilTemp, max: stats._max.soilTemp },
        airHumidity: { min: stats._min.airHumidity, max: stats._max.airHumidity },
        soilMoisture: { min: stats._min.soilMoisture, max: stats._max.soilMoisture },
        windSpeed: { min: stats._min.windSpeed, max: stats._max.windSpeed },
        rainfallMm: {
          min: stats._min.rainfallMm,
          max: stats._max.rainfallMm,
          sum: stats._sum.rainfallMm,
        },
      },
    };
  }
}
