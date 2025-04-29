import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  private async set(key: string, value: string, ttl = 0) {
    return this.cacheManager.set(key, value, ttl);
  }
  private async get(key: string) {
    return this.cacheManager.get<string>(key);
  }
  private async del(key: string) {
    return this.cacheManager.del(key);
  }

  public async setEmailVerificationCode(
    email: string,
    code: string,
    ttl: number,
  ) {
    return this.set(`email-verification-code-${email}`, code, ttl);
  }
  public async getEmailVerificationCode(email: string) {
    return this.get(`email-verification-code-${email}`);
  }
  public async detEmailVerificationCode(email: string) {
    return this.del(`email-verification-code-${email}`);
  }

  public async setPasswordResetToken(
    token: string,
    email: string,
    ttl: number,
  ) {
    return this.set(`password-reset-token:${token}`, email, ttl);
  }
  public async getPasswordResetEmail(token: string) {
    return this.get(`password-reset-token:${token}`);
  }
  public async deletePasswordResetToken(token: string) {
    return this.del(`password-reset-token:${token}`);
  }
}
