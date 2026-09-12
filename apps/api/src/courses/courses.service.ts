import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

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
