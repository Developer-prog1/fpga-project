import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { FacultiesService } from './faculties.service.js';
import { CreateFacultyDto } from './dto/create-faculty.dto.js';

@Controller('faculties')
export class FacultiesController {
  constructor(private readonly facultiesService: FacultiesService) {}

  @Post()
  create(@Body() dto: CreateFacultyDto) {
    return this.facultiesService.create(dto);
  }

  @Get()
  findAll() {
    return this.facultiesService.findAll();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.facultiesService.findBySlug(slug);
  }
}
