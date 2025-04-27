import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RefreshTokenGuard } from 'src/guards/refreshToken.guard';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { TRequest } from 'src/types/request.types';
import { createUploadInterceptor } from '../helpers/upload.interceptor';
import * as nodemailer from 'nodemailer';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @UseInterceptors(createUploadInterceptor('avatar', './uploads/avatars'))
  async signup(
    @Body() payload: SignupDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      const avatarUrl = `/uploads/avatars/${file.filename}`;
      payload.avatarUrl = avatarUrl;
    }

    return await this.authService.signup(payload);
  }

  @Post('login')
  async login(@Body() payload: LoginDto) {
    return await this.authService.login(payload);
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  async refreshTokens(@Req() req: TRequest) {
    return await this.authService.refreshTokens(
      req.user.id,
      req.user.refreshToken,
    );
  }

  @Post('check-email')
  async checkEmail(@Body('email') email: string) {
    const info = await this.authService.sendEmailVerificationCode(email);

    const previewUrl = nodemailer.getTestMessageUrl(info);

    return { message: 'Verification email sent', previewUrl };
  }

  @Post('reset-password-request')
  async requestPasswordReset(@Body('email') email: string) {
    const info = await this.authService.sendResetPassword(email);

    const previewUrl = nodemailer.getTestMessageUrl(info);

    return { message: 'Password reset email sent', previewUrl };
  }

  @Post('reset-password')
  async resetPassword(
    @Body()
    data: ResetPasswordDto,
  ) {
    await this.authService.resetPassword(data);

    return { message: 'Password reset successful' };
  }
}
