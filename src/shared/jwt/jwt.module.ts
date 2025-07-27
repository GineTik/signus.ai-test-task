import { Module } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { JwtStrategy } from './strategies/jwt-access.strategy';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getJwtConfig } from './jwt.config';

@Module({
  imports: [
    PrismaModule,
    NestJwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: getJwtConfig,
      inject: [ConfigService],
    }),
  ],
  providers: [JwtService, JwtStrategy],
  exports: [JwtService],
})
export class JwtModule {}
