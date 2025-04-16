import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import argon from 'argon2';
import { LoginDto } from './dto/login.dto';
import { AccountService } from '../account/account.service';
import { ERole } from 'src/enums/role.enum';

type TTokenPayload = {
  accountId: number;
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
  ) {}

  private getTokenPayload({ accountId, username, role }: TTokenPayload) {
    return {
      id: accountId,
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
      accountId: account.id,
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

    const { password, ...createUserPayoad } = payload;

    const hashedPassword = await this.hashPassword(password);

    const newAccount = await this.accountService.createUser({
      ...createUserPayoad,
      hashedPassword,
    });

    const tokens = await this.getTokensOnAuth({
      accountId: newAccount.id,
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
      accountId: existingAccount.id,
      username: existingAccount.username,
      role: existingAccount.role as ERole,
    });
    return { tokens, user: existingAccount };
  }
}
