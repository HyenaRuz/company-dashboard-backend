import {
  Body,
  Controller,
  Get,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/guards/accessToken.guard';
import { TRequest } from 'src/types/request.types';
import { AccountService } from './account.service';
import { UpdateAccountDto } from './dto/update-account.dto';
import { UpdateAccountRoleDto } from './dto/update-account-role.dto';
import { Roles } from 'src/decorator/roles.decorator';
import { ERole } from 'src/enums/role.enum';
import { UpdateAccountPasswordDto } from './dto/update-account-password.dto';
import { createUploadInterceptor } from '../helpers/upload.interceptor';

@UseGuards(AccessTokenGuard)
@ApiTags('Account')
@Controller('account')
export class AccounController {
  constructor(private accountService: AccountService) {}

  @Get('/me')
  async getAccountById(@Req() req: TRequest) {
    return this.accountService.findAccountById(req.user.id);
  }

  @Put('/me')
  @UseInterceptors(createUploadInterceptor('file', './uploads/avatars'))
  async updateAccount(
    @Req() req: TRequest,
    @Body() body: UpdateAccountDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      const avatarUrl = `/uploads/avatars/${file.filename}`;
      body.avatarUrl = avatarUrl;
    }

    return this.accountService.updateAccount(req.user.id, body);
  }

  @Put('/me/password')
  async updateAccountPassword(
    @Req() req: TRequest,
    @Body() body: UpdateAccountPasswordDto,
  ) {
    return this.accountService.updateAccountPassword(req.user.id, body);
  }

  @Roles(ERole.SUPERADMIN)
  @Put('/role')
  async updateAccountRole(
    @Req() req: TRequest,
    @Body() body: UpdateAccountRoleDto,
  ) {
    return this.accountService.updateAccount(req.user.id, body);
  }

  @Roles(ERole.SUPERADMIN, ERole.ADMIN)
  @Get('/all-accounts')
  async getAllAccounts() {
    return this.accountService.findAllAccounts();
  }
}
