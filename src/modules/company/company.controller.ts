import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { TRequest } from 'src/types/request.types';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CompanyService } from './company.service';
import { AccessTokenGuard } from 'src/guards/accessToken.guard';
import { UpdateCompanyDto } from './dto/update-company.dto copy';
import { SearchCompanyDto } from './dto/serch-company.dto';
import { Roles } from 'src/decorator/roles.decorator';
import { ERole } from 'src/enums/role.enum';
import { createUploadInterceptor } from '../helpers/upload.interceptor';

@UseGuards(AccessTokenGuard)
@ApiTags('Company')
@Controller('company')
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @Post()
  @UseInterceptors(createUploadInterceptor('logo', './uploads/logo'))
  async create(
    @Req() req: TRequest,
    @Body() body: CreateCompanyDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      const host = req.get('host');
      const protocol = req.protocol;
      const logoUrl = `${protocol}://${host}/uploads/logo/${file.filename}`;
      body.logoUrl = logoUrl;
    }

    return this.companyService.createCompany(req.user.id, body);
  }

  @Put(':id')
  @UseInterceptors(createUploadInterceptor('logo', './uploads/logo'))
  async updateCompany(
    @Req() req: TRequest,
    @Body() body: UpdateCompanyDto,
    @Param('id') id: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (body.logoRemoved) {
      await this.companyService.removeCompanyLogo(req.user.id, +id);
      body.logoUrl = null;
    }

    if (file) {
      const host = req.get('host');
      const protocol = req.protocol;

      await this.companyService.removeCompanyLogo(req.user.id, +id);

      const logoUrl = `${protocol}://${host}/uploads/logo/${file.filename}`;
      body.logoUrl = logoUrl;
    }

    return this.companyService.updateCompany(req.user.id, +id, body);
  }

  @Delete(':id')
  async deleteCompany(@Req() req: TRequest, @Param('id') id: string) {
    return this.companyService.deleteCompany(req.user.id, +id);
  }

  @Roles(ERole.ADMIN, ERole.SUPERADMIN)
  @Patch(':id/recover')
  async recoverCompany(@Req() req: TRequest, @Param('id') id: string) {
    return this.companyService.recoverCompany(req.user.id, +id);
  }

  @Get()
  async findCompaniesByCriteria(
    @Req() req: TRequest,
    @Query() params: SearchCompanyDto,
  ) {
    return this.companyService.searchCompany(params, req.user.id);
  }

  @Roles(ERole.ADMIN, ERole.SUPERADMIN)
  @Get('/all')
  async findAllCompaniesByCriteria(@Query() params: SearchCompanyDto) {
    return this.companyService.searchCompany(params);
  }

  @Get(':id')
  async getCompany(@Req() req: TRequest, @Param('id') id: string) {
    const company = await this.companyService.getCompanyById(+id);

    const isOwner = company.accountId === req.user.id;
    const isAdmin =
      req.user.role === ERole.ADMIN || req.user.role === ERole.SUPERADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You are not the owner or admin');
    }

    return company;
  }
}
