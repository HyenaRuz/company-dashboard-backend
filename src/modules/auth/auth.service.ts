import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import argon from 'argon2';
import { LoginDto } from './dto/login.dto';
import { AccountService } from '../account/account.service';
import { ERole } from 'src/enums/role.enum';
import { CacheService } from '../cache/cache.service';
import { EmailService } from '../email/email.service';
import { getRandomIntInRange } from '../helpers/getRandomIntInRange';
import { randomUUID } from 'crypto';
import { ResetPasswordDto } from './dto/reset-password.dto';

type TTokenPayload = {
  id: number;
  username: string;
  role: ERole;
};

const TOKENS_CONFIG_MAP = {
  access: {
    secret: process.env.JWT_ACCESS_SECRET,
    expiresIn: process.env.JWT_ACCESS_EXPIRATION,
  },
  refresh: {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: process.env.JWT_REFRESH_EXPIRATION,
  },
};

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private accountService: AccountService,
    private cacheService: CacheService,
    private emailService: EmailService,
  ) {}

  private getTokenPayload({ id, username, role }: TTokenPayload) {
    return {
      id,
      username,
      role,
    };
  }

  private async getToken(type: 'access' | 'refresh', payload: TTokenPayload) {
    return this.jwtService.signAsync(
      this.getTokenPayload(payload),
      TOKENS_CONFIG_MAP[type],
    );
  }

  private async getTokensOnAuth(payload: TTokenPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.getToken('access', payload),
      this.getToken('refresh', payload),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  private async hashPassword(password: string) {
    return argon.hash(password, {
      salt: Buffer.from(process.env.PASSWORD_SALT),
    });
  }

  public async refreshTokens(accountId: number, refreshToken: string) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new ForbiddenException('Access Denied');
    }

    const refreshTokenValid = await this.jwtService.verify(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
    });

    if (!refreshTokenValid) {
      throw new ForbiddenException('Access Denied');
    }

    const decoded = (await this.jwtService.decode(refreshToken)) as any;
    if (decoded.id !== accountId) {
      throw new ForbiddenException('Access Denied');
    }

    const accessToken = await this.getToken('access', {
      id: account.id,
      username: account.username,
      role: account.role as ERole,
    });
    return { accessToken };
  }

  public async signup(payload: SignupDto) {
    const existingAccount = await this.prisma.account.findFirst({
      where: { OR: [{ username: payload.username }, { email: payload.email }] },
    });

    if (existingAccount) {
      if (existingAccount.email === payload.email) {
        throw new BadRequestException('Account with this email already exists');
      }

      throw new BadRequestException('Account already exists');
    }

    const { password, repeatPassword, ...createUserPayoad } = payload;

    const hashedPassword = await this.hashPassword(password);

    const newAccount = await this.accountService.createUser({
      ...createUserPayoad,
      hashedPassword,
    });

    const tokens = await this.getTokensOnAuth({
      id: newAccount.id,
      username: newAccount.username,
      role: newAccount.role as ERole,
    });
    return { tokens, user: newAccount };
  }

  public async login(payload: LoginDto) {
    const hashedPassword = await this.hashPassword(payload.password);

    const existingAccount = await this.accountService.findAccountByLoginAndPass(
      payload.login,
      hashedPassword,
    );

    if (!existingAccount) {
      throw new BadRequestException('Invalid credentials');
    }

    const tokens = await this.getTokensOnAuth({
      id: existingAccount.id,
      username: existingAccount.username,
      role: existingAccount.role as ERole,
    });
    return { tokens, user: existingAccount };
  }

  public async sendEmailVerificationCode(email: string) {
    const code = getRandomIntInRange(1000, 9999).toString();
    await this.cacheService.setEmailVerificationCode(
      email,
      code,
      10 * 60 * 1000, // 10 minutes
    );

    const info = await this.emailService.sendEmailVerificationCode({
      email,
      code,
    });
    return info;
  }

  async sendResetPassword(email: string) {
    const token = randomUUID();

    await this.cacheService.setPasswordResetToken(email, token, 10 * 60 * 1000); // 10 minutes

    const info = await this.emailService.sendResetPasswordEmail({
      email,
      token,
    });

    return info;
  }

  async resetPassword(data: ResetPasswordDto) {
    const email = await this.cacheService.getPasswordResetEmail(data.token);

    if (!email) {
      throw new BadRequestException('Invalid or expired token');
    }

    const user = await this.accountService.findAccountByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (data.newPassword !== data.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    user.hashedPassword = await this.hashPassword(data.newPassword);
    await this.prisma.account.update({
      where: { id: user.id },
      data: { hashedPassword: user.hashedPassword },
    });

    await this.cacheService.deletePasswordResetToken(data.token);
  }
}
