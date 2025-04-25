import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto copy';
import { SearchCompanyDto } from './dto/serch-company.dto';
import { Prisma } from '@prisma/client';

import * as fs from 'fs';
import * as path from 'path';
import { ERole } from 'src/enums/role.enum';
import {
  pickRequiredFields,
  UPDATE_COMPANY_REQUIRED_FIELDS,
} from '../helpers/pickRequiredFields';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  public async createCompany(accountId: number, data: CreateCompanyDto) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return await this.prisma.company.create({
      data: {
        ...data,
        capital: +data.capital,
        name: data.name.trim(),
        service: data.service.trim(),
        accountId,
      },
    });
  }

  public async removeCompanyLogo(accountId: number, companyId: number) {
    const company = await this.prisma.company.findFirstOrThrow({
      where: { accountId, id: companyId },
    });

    if (company.logoUrl) {
      if (company.logoUrl) {
        const oldFilename = company.logoUrl.split('/').pop();
        const oldFilePath = path.join(
          process.cwd(),
          'uploads',
          'logo',
          oldFilename,
        );

        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
    }
  }

  public async updateCompany(
    accountId: number,
    companyId: number,
    data: UpdateCompanyDto,
  ) {
    const user = await this.prisma.account.findFirstOrThrow({
      where: { id: accountId },
    });

    const company = await this.prisma.company.findFirstOrThrow({
      where: { id: companyId },
    });

    const isOwner = company.accountId === accountId;
    const isAdmin = user.role === ERole.ADMIN || user.role === ERole.SUPERADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'You do not have permission to update this company',
      );
    }

    const clearData = pickRequiredFields<UpdateCompanyDto>(
      data,
      UPDATE_COMPANY_REQUIRED_FIELDS,
    );

    await this.prisma.company.update({
      where: { id: company.id },
      data: { ...clearData, capital: +clearData.capital },
    });

    return await this.getCompanyById(company.id);
  }

  public async deleteCompany(accountId: number, companyId: number) {
    const company = await this.prisma.company.findFirstOrThrow({
      where: {
        id: companyId,
        accountId,
        deletedAt: null,
      },
    });

    if (!company) {
      throw new BadRequestException('Company not found');
    }

    return await this.prisma.company.update({
      where: { id: company.id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  public async getCompanyById(companyId: number) {
    return await this.prisma.company.findUnique({
      where: { id: companyId },
      include: {
        account: {
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
        },
      },
    });
  }

  public async searchCompany(params: SearchCompanyDto, accountId?: number) {
    const {
      name,
      page,
      limit,
      sortDirection,
      sortField,
      allCompanies,
      account,
    } = params || {};

    const take = +limit;
    const skip = (+page - 1) * take;

    const order = () => {
      if (sortField === 'account') {
        return { account: { email: sortDirection } };
      } else {
        return { [sortField]: sortDirection };
      }
    };

    const where: Prisma.CompanyWhereInput = {
      ...(accountId && { accountId }),
      ...(name && {
        name: {
          contains: name,
          mode: Prisma.QueryMode.insensitive,
        },
      }),
      ...(accountId && { deletedAt: null }),
      ...(account && {
        account: {
          email: {
            contains: account,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      }),
    };

    const [companies, total] = await this.prisma.$transaction([
      this.prisma.company.findMany({
        ...(!allCompanies && { take, skip }),
        where,
        orderBy: order(),

        include: {
          account: true,
        },
      }),
      this.prisma.company.count({ where }),
    ]);

    return [companies, total];
  }

  public async getTotalCompanyCount() {
    return this.prisma.company.count({
      where: {
        deletedAt: null,
      },
    });
  }
}
