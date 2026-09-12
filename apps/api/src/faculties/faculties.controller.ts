import { Controller, Get, Param } from '@nestjs/common';
import { FacultiesService } from './faculties.service.js';

@Controller('faculties')
export class FacultiesController {
  constructor(private readonly facultiesService: FacultiesService) {}

  @Get()
  findAll() {
    return this.facultiesService.findAll();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.facultiesService.findBySlug(slug);
  }
}
