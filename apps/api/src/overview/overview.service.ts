import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class OverviewService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const [admins, faculties, courses, facultyList, courseList] =
      await Promise.all([
        this.prisma.user.count({ where: { role: 'ADMIN' } }),
        this.prisma.faculty.count(),
        this.prisma.course.count(),
        this.prisma.faculty.findMany({
          orderBy: { name: 'asc' },
          include: {
            _count: { select: { courses: true } },
          },
        }),
        this.prisma.course.findMany({
          take: 10,
          orderBy: { code: 'asc' },
          include: {
            faculty: { select: { name: true, slug: true } },
          },
        }),
      ]);

    return {
      stats: {
        admins,
        faculties,
        courses,
      },
      faculties: facultyList,
      courses: courseList,
    };
  }
}
