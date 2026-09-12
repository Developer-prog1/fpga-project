import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class FacultiesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.faculty.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { courses: true } },
        courses: {
          select: {
            id: true,
            code: true,
            title: true,
            credits: true,
          },
          orderBy: { code: 'asc' },
        },
      },
    });
  }

  async findBySlug(slug: string) {
    const faculty = await this.prisma.faculty.findUnique({
      where: { slug },
      include: {
        courses: {
          orderBy: { code: 'asc' },
        },
      },
    });

    if (!faculty) {
      throw new NotFoundException(`Faculty "${slug}" not found`);
    }

    return faculty;
  }
}
