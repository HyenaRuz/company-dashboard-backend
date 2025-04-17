import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccounController } from './account.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AccounController],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
