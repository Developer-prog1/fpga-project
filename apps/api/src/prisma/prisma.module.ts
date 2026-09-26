import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

@Global()
@Module({
  providers: [
    {
      provide: PrismaService,
      useFactory: () => PrismaService.create(),
    },
  ],
  exports: [PrismaService],
})
export class PrismaModule {}
