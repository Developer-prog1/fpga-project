import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { missingSlots, msUntilNextHour, nextReading } from './synthetic-reading.js';

const MAX_SLOTS = 7 * 24 * 4;

@Injectable()
export class SyntheticFeedService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SyntheticFeedService.name);
  private timer: ReturnType<typeof setTimeout> | null = null;
  private stopped = false;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    if (process.env.VITEST) return;
    void this.catchUp().catch((error: unknown) => this.logger.error('Synthetic feed failed', error));
    this.arm();
  }

  onModuleDestroy() {
    this.stopped = true;
    if (this.timer) clearTimeout(this.timer);
  }

  async catchUp(now = new Date()) {
    const station = await this.prisma.station.findFirst({ orderBy: { createdAt: 'asc' } });
    if (!station) return 0;

    const latest = await this.prisma.reading.findFirst({
      where: { stationId: station.id },
      orderBy: { recordedAt: 'desc' },
    });
    if (!latest) return 0;

    let slots = missingSlots(latest.recordedAt, now);
    if (slots.length > MAX_SLOTS) slots = slots.slice(-MAX_SLOTS);
    if (slots.length === 0) return 0;

    const existing = await this.prisma.reading.findMany({
      where: { stationId: station.id, recordedAt: { in: slots } },
      select: { recordedAt: true },
    });
    const have = new Set(existing.map((row) => row.recordedAt.getTime()));

    let soil = latest.soilMoisture;
    let windDir = latest.windDirDeg;
    const rows = [];
    for (const at of slots) {
      const reading = nextReading({ at, soilMoisture: soil, windDirDeg: windDir });
      soil = reading.soilMoisture;
      windDir = reading.windDirDeg;
      if (have.has(at.getTime())) continue;
      rows.push({ ...reading, stationId: station.id });
    }
    if (rows.length === 0) return 0;

    await this.prisma.reading.createMany({ data: rows });
    this.logger.log(`Synthetic feed added ${rows.length} readings through ${slots[slots.length - 1].toISOString()}`);
    return rows.length;
  }

  private arm() {
    if (this.stopped) return;
    this.timer = setTimeout(() => {
      void this.catchUp()
        .catch((error: unknown) => this.logger.error('Synthetic feed failed', error))
        .finally(() => this.arm());
    }, msUntilNextHour());
  }
}
