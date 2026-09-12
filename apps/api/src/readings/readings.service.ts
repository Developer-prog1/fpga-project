import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

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
}
