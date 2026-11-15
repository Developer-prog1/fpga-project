import { Module } from '@nestjs/common';
import { ReadingsController } from './readings.controller.js';
import { ReadingsService } from './readings.service.js';
import { SyntheticFeedService } from './synthetic-feed.service.js';

@Module({
  controllers: [ReadingsController],
  providers: [ReadingsService, SyntheticFeedService],
})
export class ReadingsModule {}
