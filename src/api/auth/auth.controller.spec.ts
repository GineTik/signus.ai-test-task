import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '@/shared/prisma';
import { Response } from 'express';
import { AccessTokenGuard } from '@/shared/secure';
import { RefreshTokenGuard } from '@/shared/secure';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  verifyEmail: jest.fn(),
  refreshTokens: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(AccessTokenGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RefreshTokenGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a user and return tokens', async () => {
      const registerDto: RegisterDto = {
        email: 'test@test.com',
        password: 'password',
        fullName: 'Test',
      };
      const tokens = { accessToken: 'access', refreshToken: 'refresh' };
      const res = { cookie: jest.fn() } as unknown as Response;

      mockAuthService.register.mockResolvedValue(tokens);
      const saveCookieSpy = jest
        .spyOn(controller, 'saveRefreshToCookie')
        .mockImplementation(() => {});

      const result = await controller.register(registerDto, res);

      expect(result).toEqual(tokens);
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
      expect(saveCookieSpy).toHaveBeenCalledWith(res, tokens.refreshToken);
    });
  });

  describe('login', () => {
    it('should log in a user and return tokens', async () => {
      const loginDto: LoginDto = {
        email: 'test@test.com',
        password: 'password',
      };
      const tokens = { accessToken: 'access', refreshToken: 'refresh' };
      const res = { cookie: jest.fn() } as unknown as Response;

      mockAuthService.login.mockResolvedValue(tokens);
      const saveCookieSpy = jest
        .spyOn(controller, 'saveRefreshToCookie')
        .mockImplementation(() => {});

      const result = await controller.login(loginDto, res);

      expect(result).toEqual(tokens);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
      expect(saveCookieSpy).toHaveBeenCalledWith(res, tokens.refreshToken);
    });
  });

  describe('logout', () => {
    it('should clear the refresh token cookie', () => {
      const res = {
        clearCookie: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      controller.logout(res);

      expect(res.clearCookie).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Logged out successfully',
      });
    });
  });

  describe('verify', () => {
    it('should call authService.verifyEmail with the token', async () => {
      const token = 'verificationToken';
      await controller.verify(token);
      expect(mockAuthService.verifyEmail).toHaveBeenCalledWith(token);
    });
  });

  describe('refresh', () => {
    it('should refresh tokens', async () => {
      const user: User = {
        id: '1',
        email: 'test@test.com',
        password: 'password',
        isVerified: true,
        name: 'Test',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const refreshTokenDto = { refreshToken: 'oldRefreshToken' };
      const tokens = { accessToken: 'newAccess', refreshToken: 'newRefresh' };
      const res = { cookie: jest.fn() } as unknown as Response;

      mockAuthService.refreshTokens.mockResolvedValue(tokens);
      const saveCookieSpy = jest
        .spyOn(controller, 'saveRefreshToCookie')
        .mockImplementation(() => {});

      const result = await controller.refresh(user, refreshTokenDto, res);

      expect(result).toEqual(tokens);
      expect(mockAuthService.refreshTokens).toHaveBeenCalledWith(
        user,
        refreshTokenDto.refreshToken,
      );
      expect(saveCookieSpy).toHaveBeenCalledWith(res, tokens.refreshToken);
    });
  });
});
