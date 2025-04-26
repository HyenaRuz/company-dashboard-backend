import { Module } from '@nestjs/common';
import { HistoryService } from './history.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [HistoryService],
  exports: [HistoryService],
})
export class HistoryModule {}
