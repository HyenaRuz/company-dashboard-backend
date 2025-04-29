import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ERole } from 'src/enums/role.enum';
import { UpdateAccountDto } from './dto/update-account.dto';
import { UpdateAccountRoleDto } from './dto/update-account-role.dto';
import { UpdateAccountPasswordDto } from './dto/update-account-password.dto';
import argon from 'argon2';

import * as fs from 'fs';
import * as path from 'path';
import { SearchAccountDto } from './dto/search-account.dto';
import {
  pickRequiredFields,
  UPDATE_ACCOUNT_REQUIRED_FIELDS,
} from '../helpers/pickRequiredFields';

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

  public async findAllAccounts(params: SearchAccountDto) {
    const { id, email, username, page, limit, sortDirection, sortField, role } =
      params || {};

    const take = +limit;
    const skip = (+page - 1) * take;

    const where: Prisma.AccountWhereInput = {
      ...(id && { id }),
      ...(email && {
        email: {
          contains: email,
          mode: Prisma.QueryMode.insensitive,
        },
      }),
      ...(username && {
        username: {
          contains: username,
          mode: Prisma.QueryMode.insensitive,
        },
      }),
      role: role || ERole.USER,
    };

    const order = () => {
      if (sortField === '_count') {
        return { companies: { _count: sortDirection } };
      } else {
        return { [sortField]: sortDirection };
      }
    };

    const [accounts, total] = await this.prisma.$transaction([
      this.prisma.account.findMany({
        ...(limit &&
          page && {
            take,
            skip,
          }),
        where,
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          avatarUrl: true,
          deletedAt: true,
          _count: {
            select: {
              companies: { where: { deletedAt: null } },
            },
          },
        },
        orderBy: order(),
      }),
      this.prisma.account.count({ where }),
    ]);

    return [accounts, total];
  }

  public async findAccountById(id: number) {
    const account = await this.prisma.account.findFirst({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        deletedAt: true,
        historyLogs: true,
        actingHistories: true,
        targetHistories: true,
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

  public async findAccountByEmail(email: string) {
    return this.prisma.account.findFirst({ where: { email } });
  }

  public async updateAccount(
    accountId: number,
    data: UpdateAccountDto,
    adminId?: number,
  ) {
    const targetAccount = await this.prisma.account.findUniqueOrThrow({
      where: { id: accountId },
    });

    if (adminId && adminId !== accountId) {
      const admin = await this.prisma.account.findFirstOrThrow({
        where: { id: adminId },
      });

      if (admin.role !== ERole.ADMIN && admin.role !== ERole.SUPERADMIN) {
        throw new ForbiddenException('Insufficient permissions');
      }
    }

    const updated = await this.prisma.account.update({
      where: { id: targetAccount.id },
      data: {
        ...pickRequiredFields<UpdateAccountDto>(
          data,
          UPDATE_ACCOUNT_REQUIRED_FIELDS,
        ),
      },
    });

    return updated;
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

    return this.prisma.account.update({
      where: { id: account.id },
      data: { hashedPassword },
    });
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

  public async removeAccountAvatar(accountId: number) {
    const company = await this.prisma.account.findFirstOrThrow({
      where: { id: accountId },
    });

    if (company.avatarUrl) {
      if (company.avatarUrl) {
        const oldFilename = company.avatarUrl.split('/').pop();
        const oldFilePath = path.join(
          process.cwd(),
          'uploads',
          'avatars',
          oldFilename,
        );

        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
    }
  }

  public async deleteAccount(accountId: number) {
    const account = await this.prisma.account.findFirstOrThrow({
      where: {
        id: accountId,
        deletedAt: null,
      },
    });

    if (!account) {
      throw new BadRequestException('Account not found');
    }

    return await this.prisma.account.update({
      where: { id: account.id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
  public async recoverAccount(accountId: number) {
    const account = await this.prisma.account.findFirstOrThrow({
      where: {
        id: accountId,
        deletedAt: { not: null },
      },
    });

    if (!account) {
      throw new BadRequestException('Account not found');
    }

    return await this.prisma.account.update({
      where: { id: account.id },
      data: {
        deletedAt: null,
      },
    });
  }
}
