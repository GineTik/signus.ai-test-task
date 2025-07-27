import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh.dto';
import { User } from '@/shared/prisma';
import { Public, RefreshTokenGuard, SignedUser } from '@/shared/secure';
import { Response } from 'express';
import { JWT_REFRESH_COOKIE_NAME } from '@/shared/jwt';
import { AccessTokenGuard } from '@/shared/secure';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.register(dto);
    this.saveRefreshToCookie(res, tokens.refreshToken);
    return tokens;
  }

  @Public()
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.login(dto);
    this.saveRefreshToCookie(res, tokens.refreshToken);
    return tokens;
  }

  @UseGuards(AccessTokenGuard)
  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie(JWT_REFRESH_COOKIE_NAME);
    return res.status(200).json({ message: 'Logged out successfully' });
  }

  @Public()
  @Get('verify/:token')
  verify(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  async refresh(
    @SignedUser() user: User,
    @Body() dto: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.refreshTokens(user, dto.refreshToken);
    this.saveRefreshToCookie(res, tokens.refreshToken);
    return tokens;
  }

  saveRefreshToCookie(res: Response, token: string) {
    res.cookie(JWT_REFRESH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    });
  }

  @UseGuards(AccessTokenGuard)
  @Get('profile')
  getProfile(@SignedUser() user: User) {
    return user;
  }
}
