import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'node:path';
import { PrismaModule } from './prisma/prisma.module.js';
import { HealthModule } from './health/health.module.js';
import { UsersModule } from './users/users.module.js';
import { FacultiesModule } from './faculties/faculties.module.js';
import { CoursesModule } from './courses/courses.module.js';
import { OverviewModule } from './overview/overview.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        resolve(process.cwd(), '../../.env'),
        resolve(process.cwd(), '.env'),
      ],
    }),
    PrismaModule,
    HealthModule,
    OverviewModule,
    UsersModule,
    FacultiesModule,
    CoursesModule,
  ],
})
export class AppModule {}
