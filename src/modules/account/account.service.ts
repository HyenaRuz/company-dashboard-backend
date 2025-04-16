import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ERole } from 'src/enums/role.enum';

@Injectable()
export class AccountService {
  constructor(private prisma: PrismaService) {}
  public async createUser(data: Prisma.AccountCreateInput) {
    const existingAccount = await this.prisma.account.findFirst({
      where: { email: data.email },
    });

    if (existingAccount) {
      throw new BadRequestException('Account already exists');
    }

    return this.prisma.account.create({ data });
  }

  public async findAccountByLoginAndPass(
    login: string,
    hashedPassword: string,
  ) {
    return this.prisma.account.findFirst({
      where: {
        email: login,
        hashedPassword,
        deletedAt: null,
      },
    });
  }

  public async findAllAdmins() {
    return this.prisma.account.findMany({ where: { role: ERole.ADMIN } });
  }
}
