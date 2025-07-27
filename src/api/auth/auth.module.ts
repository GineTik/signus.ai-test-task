import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { JwtModule } from '@/shared/jwt';
import { MailModule } from '@/shared/mail';
import { PrismaModule } from '@/shared/prisma';

@Module({
  imports: [JwtModule, MailModule, PrismaModule],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository],
})
export class AuthModule {}
