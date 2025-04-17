import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto copy';
import { SearchCompanyDto } from './dto/serch-company.dto';

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

    return this.prisma.company.create({
      data: {
        ...data,
        name: data.name.trim(),
        service: data.service.trim(),
        accountId,
      },
    });
  }

  public async updateCompany(
    accountId: number,
    companyId: number,
    data: UpdateCompanyDto,
  ) {
    const company = await this.prisma.company.findFirstOrThrow({
      where: { accountId, id: companyId },
    });

    if (data.name) {
      data.name = data.name.trim();
    }

    if (data.service) {
      data.service = data.service.trim();
    }

    await this.prisma.company.update({
      where: { id: company.id },
      data,
    });

    return this.getCompanyById(company.id);
  }

  public async deleteCompany(accountId: number, companyId: number) {
    return this.prisma.company.delete({
      where: { accountId, id: companyId },
    });
  }

  public getCompanyById(companyId: number) {
    return this.prisma.company.findUnique({
      where: { id: companyId },
    });
  }

  public searchCompany(params: SearchCompanyDto, accountId?: number) {
    const { name, page, limit, sortDirection, sortField } = params || {};

    const take = +limit;
    const skip = (page - 1) * take;

    return this.prisma.company.findMany({
      take,
      skip,
      where: {
        ...(accountId && {
          accountId,
        }),
        ...(name && {
          name: {
            contains: name,
          },
        }),
      },
      orderBy: { [sortField]: sortDirection },
    });
  }
}
