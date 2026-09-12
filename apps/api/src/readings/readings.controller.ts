import { Controller, Get, Query } from '@nestjs/common';
import { ReadingsService } from './readings.service.js';

@Controller('readings')
export class ReadingsController {
  constructor(private readonly readingsService: ReadingsService) {}

  @Get()
  findRecent(@Query('hours') hours?: string) {
    return this.readingsService.findRecent(Number(hours) || 24);
  }
}
