import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // PrismaService disponible dans tous les modules sans réimport
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
