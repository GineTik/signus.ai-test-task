import { Module } from '@nestjs/common';
import { AuthModule } from '@/api/auth';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from './shared/cache/cache.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    CacheModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
