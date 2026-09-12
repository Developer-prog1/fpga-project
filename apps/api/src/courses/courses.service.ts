import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCourseDto } from './dto/create-course.dto.js';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCourseDto) {
    const faculty = await this.prisma.faculty.findUnique({
      where: { slug: dto.facultySlug },
    });

    if (!faculty) {
      throw new NotFoundException(`Faculty "${dto.facultySlug}" not found`);
    }

    try {
      return await this.prisma.course.create({
        data: {
          code: dto.code.trim().toUpperCase(),
          title: dto.title.trim(),
          description: dto.description?.trim() || null,
          credits: dto.credits,
          facultyId: faculty.id,
        },
        include: {
          faculty: { select: { id: true, name: true, slug: true } },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Այս կոդով դասընթաց արդեն կա');
      }
      throw error;
    }
  }

  findAll() {
    return this.prisma.course.findMany({
      orderBy: { code: 'asc' },
      include: {
        faculty: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  async findByCode(code: string) {
    const course = await this.prisma.course.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        faculty: true,
      },
    });

    if (!course) {
      throw new NotFoundException(`Course "${code}" not found`);
    }

    return course;
  }
}
