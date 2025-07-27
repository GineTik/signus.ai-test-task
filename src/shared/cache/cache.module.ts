import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { redisStore } from 'cache-manager-redis-store';

@Module({
  imports: [
    NestCacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        const store = await redisStore({
          url: process.env.REDIS_URL,
          ttl: 10,
        });
        return {
          store: () => store,
        };
      },
    }),
  ],
})
export class CacheModule {}
