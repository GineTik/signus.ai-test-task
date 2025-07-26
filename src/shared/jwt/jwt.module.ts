import { Module } from '@nestjs/common';
import { JwtService, JwtModule as NestJwtModule } from '@nestjs/jwt';

@Module({
  imports: [NestJwtModule.registerAsync({})],
  providers: [JwtService],
  exports: [JwtService],
})
export class JwtModule {}
