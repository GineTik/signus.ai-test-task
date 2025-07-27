import { ConfigService } from '@nestjs/config';
import { ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { PayloadDto } from '../dto/payload.dto';
import { JWT_STRATEGY } from '../jwt.constants';
import { User, PrismaService } from '@/shared/prisma';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, JWT_STRATEGY) {
  constructor(
    private readonly prisma: PrismaService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
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
