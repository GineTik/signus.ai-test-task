import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { PayloadDto } from './dto/payload.dto';
import { TokensDto } from './dto/tokens.dto';

const JWT_ACCESS_EXPIRATION_TIME = 'JWT_ACCESS_EXPIRATION_TIME';
const JWT_REFRESH_EXPIRATION_TIME = 'JWT_REFRESH_EXPIRATION_TIME';
const JWT_SECRET = 'JWT_SECRET';

@Injectable()
export class JwtService {
  constructor(
    private readonly nestJwtService: NestJwtService,
    private readonly configService: ConfigService,
  ) {}

  async generatePair(payload: PayloadDto): Promise<TokensDto> {
    const accessToken = await this.generate(
      payload,
      JWT_SECRET,
      JWT_ACCESS_EXPIRATION_TIME,
    );
    const refreshToken = await this.generate(
      payload,
      JWT_SECRET,
      JWT_REFRESH_EXPIRATION_TIME,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  private async generate(
    payload: PayloadDto,
    secretKey: string,
    expiresInKey: string,
  ): Promise<string> {
    const secret = this.configService.getOrThrow<string>(secretKey);
    const expiresIn = this.configService.getOrThrow<string>(expiresInKey);

    const token = await this.nestJwtService.signAsync(payload, {
      secret,
      expiresIn,
    });

    return token;
  }
}
