import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtService } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from '../account/account.module';

@Module({
  imports: [PrismaModule, UserModule],
  providers: [AuthService, JwtService],
  controllers: [AuthController],
})
export class AuthModule {}
