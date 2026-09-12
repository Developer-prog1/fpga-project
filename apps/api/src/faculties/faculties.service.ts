import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateFacultyDto } from './dto/create-faculty.dto.js';

@Injectable()
export class FacultiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFacultyDto) {
    try {
      return await this.prisma.faculty.create({
        data: {
          name: dto.name.trim(),
          slug: dto.slug.trim().toLowerCase(),
          description: dto.description?.trim() || null,
        },
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
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Այս slug-ով ֆակուլտետ արդեն կա');
      }
      throw error;
    }
  }

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
