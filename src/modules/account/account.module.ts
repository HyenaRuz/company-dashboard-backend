import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { UserController } from './account.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [AccountService],
  exports: [AccountService],
})
export class UserModule {}
