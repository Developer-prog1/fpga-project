import { Controller, Get, Param } from '@nestjs/common';
import { CoursesService } from './courses.service.js';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  @Get(':code')
  findByCode(@Param('code') code: string) {
    return this.coursesService.findByCode(code);
  }
}
