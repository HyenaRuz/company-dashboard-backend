import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ERole } from 'src/enums/role.enum';
import { UpdateAccountDto } from './dto/update-account.dto';
import { UpdateAccountRoleDto } from './dto/update-account-role.dto';
import { UpdateAccountPasswordDto } from './dto/update-account-password.dto';
import argon from 'argon2';

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

  public async findAllAccounts() {
    return this.prisma.account.findMany();
  }

  public async findAccountById(id: number) {
    const account = await this.prisma.account.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    const activeCompanyCount = await this.prisma.company.count({
      where: {
        accountId: id,
        deletedAt: null,
      },
    });

    return {
      ...account,
      companiesCount: activeCompanyCount,
    };
  }

  public async updateAccount(
    accountId: number,
    data: UpdateAccountDto | UpdateAccountRoleDto,
  ) {
    const account = await this.prisma.account.findFirstOrThrow({
      where: { id: accountId },
    });

    await this.prisma.account.update({
      where: { id: account.id },
      data,
    });

    return this.findAccountById(account.id);
  }

  public async updateAccountPassword(
    accountId: number,
    data: UpdateAccountPasswordDto,
  ) {
    const account = await this.prisma.account.findFirstOrThrow({
      where: { id: accountId },
    });

    const passwordValid = await argon.verify(
      account.hashedPassword,
      data.oldPassword,
    );

    if (!passwordValid) {
      throw new BadRequestException('Old password is incorrect');
    }

    if (data.newPassword !== data.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const hashedPassword = await argon.hash(data.newPassword, {
      salt: Buffer.from(process.env.PASSWORD_SALT),
    });

    await this.prisma.account.update({
      where: { id: account.id },
      data: { hashedPassword },
    });

    return { message: 'Password updated successfully' };
  }

  public async getTotalAccountCount() {
    return this.prisma.account.count({
      where: {
        deletedAt: null,
        role: {
          notIn: [ERole.SUPERADMIN, ERole.ADMIN],
        },
      },
    });
  }

  public async checkEmail(email: string) {
    const existingAccount = await this.prisma.account.findFirst({
      where: { email },
    });
    return !!existingAccount;
  }
}
