import { Module } from '@nestjs/common';
import { CacheModule as Cache } from '@nestjs/cache-manager';
import KeyvPostgres from '@keyv/postgres';

import { CacheService } from './cache.service';
import Keyv from 'keyv';

@Module({
  imports: [
    Cache.registerAsync({
      useFactory: async () => {
        return {
          isGlobal: true,
          stores: [
            new Keyv(
              new KeyvPostgres({
                uri: process.env.DATABASE_URL,
                table: 'cache',
                useUnloggedTable: true,
              }),
            ),
          ],
        };
      },
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
