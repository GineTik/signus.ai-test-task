import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { PayloadDto } from '../dto/payload.dto';
import {
  JWT_REFRESH_COOKIE_NAME,
  JWT_REFRESH_STRATEGY,
} from '../jwt.constants';
import { User, PrismaService } from '@/shared/prisma';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  JWT_REFRESH_STRATEGY,
) {
  constructor(
    private readonly prisma: PrismaService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const cookies = request.cookies as Record<string, string>;
          return cookies?.[JWT_REFRESH_COOKIE_NAME];
        },
      ]),
      secretOrKey: configService.getOrThrow('JWT_SECRET'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: PayloadDto): Promise<User> {
    return await this.prisma.user.findUniqueOrThrow({
      where: { id: payload.id },
    });
  }
}
