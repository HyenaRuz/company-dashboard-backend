import {
  Body,
  Controller,
  Delete,
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
import { AccessTokenGuard } from 'src/guards/accessToken.guard';
import { TRequest } from 'src/types/request.types';
import { AccountService } from './account.service';
import { UpdateAccountDto } from './dto/update-account.dto';
import { UpdateAccountRoleDto } from './dto/update-account-role.dto';
import { Roles } from 'src/decorator/roles.decorator';
import { ERole } from 'src/enums/role.enum';
import { UpdateAccountPasswordDto } from './dto/update-account-password.dto';
import { createUploadInterceptor } from '../helpers/upload.interceptor';
import { SearchAccountDto } from './dto/serch-account.dto';

@ApiTags('Account')
@Controller('account')
export class AccounController {
  constructor(private accountService: AccountService) {}

  @UseGuards(AccessTokenGuard)
  @Get()
  async getAccountById(@Req() req: TRequest) {
    return this.accountService.findAccountById(+req.user.id);
  }

  @UseGuards(AccessTokenGuard)
  @Put()
  @UseInterceptors(createUploadInterceptor('avatar', './uploads/avatars'))
  async updateAccount(
    @Req() req: TRequest,
    @Body() body: UpdateAccountDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (body.avatarRemoved) {
      await this.accountService.removeAccountAvatar(req.user.id);
      body.avatarUrl = null;
    }

    if (file) {
      const host = req.get('host');
      const protocol = req.protocol;

      await this.accountService.removeAccountAvatar(req.user.id);

      const avatarUrl = `${protocol}://${host}/uploads/avatars/${file.filename}`;
      body.avatarUrl = avatarUrl;
    }

    return this.accountService.updateAccount(req.user.id, body);
  }

  @UseGuards(AccessTokenGuard)
  @Put('/me/password')
  async updateAccountPassword(
    @Req() req: TRequest,
    @Body() body: UpdateAccountPasswordDto,
  ) {
    return this.accountService.updateAccountPassword(req.user.id, body);
  }

  @UseGuards(AccessTokenGuard)
  @Roles(ERole.SUPERADMIN, ERole.ADMIN)
  @Put('/admin/:id')
  @UseInterceptors(createUploadInterceptor('avatar', './uploads/avatars'))
  async updateUserAsAdmin(
    @Param('id') id: number,
    @Body() body: UpdateAccountDto,
    @Req() req: TRequest,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (body?.avatarRemoved) {
      await this.accountService.removeAccountAvatar(body.id);
      body.avatarUrl = null;
    }

    if (file) {
      const host = req.get('host');
      const protocol = req.protocol;

      await this.accountService.removeAccountAvatar(body.id);

      const avatarUrl = `${protocol}://${host}/uploads/avatars/${file.filename}`;
      body.avatarUrl = avatarUrl;
    }

    return this.accountService.updateAccount(+id, body, +req.user.id);
  }

  @UseGuards(AccessTokenGuard)
  @Roles(ERole.SUPERADMIN)
  @Put('/role')
  async updateAccountRole(
    @Req() req: TRequest,
    @Body() body: UpdateAccountRoleDto,
  ) {
    return this.accountService.updateAccount(req.user.id, body);
  }

  @UseGuards(AccessTokenGuard)
  @Roles(ERole.SUPERADMIN, ERole.ADMIN)
  @Get('/all-accounts')
  async getAllAccounts(@Query() params: SearchAccountDto) {
    return this.accountService.findAllAccounts(params);
  }

  @Post('check-email')
  async checkEmail(@Body() body: { email: string }) {
    return this.accountService.checkEmail(body.email);
  }

  @UseGuards(AccessTokenGuard)
  @Roles(ERole.SUPERADMIN, ERole.ADMIN)
  @Get(':id')
  async getAccountByIdAdmin(@Param('id') id: string) {
    return this.accountService.findAccountById(+id);
  }

  @UseGuards(AccessTokenGuard)
  @Roles(ERole.SUPERADMIN, ERole.ADMIN)
  @Delete(':id')
  async deleteAccount(@Param('id') id: string) {
    return this.accountService.deleteAccount(+id);
  }

  @UseGuards(AccessTokenGuard)
  @Roles(ERole.SUPERADMIN, ERole.ADMIN)
  @Patch(':id/recover')
  async recoverAccount(@Param('id') id: string) {
    return this.accountService.recoverAccount(+id);
  }
}
