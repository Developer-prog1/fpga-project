import { Controller, Get, Query } from '@nestjs/common';
import { ReadingsService } from './readings.service.js';

@Controller('readings')
export class ReadingsController {
  constructor(private readonly readingsService: ReadingsService) {}

  @Get('history')
  history(@Query('span') span?: string, @Query('from') from?: string, @Query('to') to?: string) {
    return this.readingsService.history({ span, from, to });
  }

  @Get()
  findRecent(@Query('hours') hours?: string) {
    return this.readingsService.findRecent(Number(hours) || 24);
  }
}
