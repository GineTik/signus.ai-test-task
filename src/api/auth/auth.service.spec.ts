import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { JwtService } from '@/shared/jwt';
import { MailService } from '@/shared/mail';
import bcrypt from 'bcrypt';
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@/shared/prisma';

jest.mock('bcrypt', () => ({
  default: {
    compare: jest.fn(),
    hash: jest.fn(),
  },
  __esModule: true,
}));

describe('AuthService', () => {
  let service: AuthService;
  let authRepository: DeepMockProxy<AuthRepository>;
  let jwtService: DeepMockProxy<JwtService>;
  let mailService: DeepMockProxy<MailService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthRepository,
          useValue: mockDeep<AuthRepository>(),
        },
        {
          provide: JwtService,
          useValue: mockDeep<JwtService>(),
        },
        {
          provide: MailService,
          useValue: mockDeep<MailService>(),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    authRepository = module.get(AuthRepository);
    jwtService = module.get(JwtService);
    mailService = module.get(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const loginDto = { email: 'test@test.com', password: 'password' };
    const user: User = {
      id: '1',
      email: 'test@test.com',
      password: 'hashedPassword',
      name: 'Test',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should login a user and return tokens', async () => {
      authRepository.findByEmailOrThrow.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.generatePair.mockResolvedValue({
        accessToken: 'at',
        refreshToken: 'rt',
      });

      const tokens = await service.login(loginDto);

      expect(authRepository.findByEmailOrThrow).toHaveBeenCalledWith(
        loginDto.email,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        user.password,
      );
      expect(tokens).toEqual({ accessToken: 'at', refreshToken: 'rt' });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mailService.sendVerification).not.toHaveBeenCalled();
    });

    it('should send verification email if user is not verified', async () => {
      const unverifiedUser = { ...user, isVerified: false };
      authRepository.findByEmailOrThrow.mockResolvedValue(unverifiedUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.generatePair.mockResolvedValue({
        accessToken: 'at',
        refreshToken: 'rt',
      });

      await service.login(loginDto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mailService.sendVerification).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      authRepository.findByEmailOrThrow.mockResolvedValue(user);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@test.com',
      password: 'password',
      name: 'Test',
      fullName: 'Test User',
    };
    const user: User = {
      id: '1',
      email: 'test@test.com',
      password: 'hashedPassword',
      name: 'Test',
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should register a new user', async () => {
      authRepository.findByEmailOrThrow.mockResolvedValue(null as any);
      authRepository.createUser.mockResolvedValue(user);
      jwtService.generatePair.mockResolvedValue({
        accessToken: 'at',
        refreshToken: 'rt',
      });

      const tokens = await service.register(registerDto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authRepository.createUser).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mailService.sendVerification).toHaveBeenCalled();
      expect(tokens).toEqual({ accessToken: 'at', refreshToken: 'rt' });
    });

    it('should throw ConflictException if user already exists', async () => {
      authRepository.findByEmailOrThrow.mockResolvedValue(user);
      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('refreshTokens', () => {
    const user: User = {
      id: '1',
      email: 'test@test.com',
      password: 'hashedPassword',
      name: 'Test',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const refreshToken = 'some-refresh-token';

    it('should refresh tokens successfully', async () => {
      authRepository.findSession.mockResolvedValue({
        id: '1',
        userId: user.id,
        refreshToken,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      jwtService.generatePair.mockResolvedValue({
        accessToken: 'new-at',
        refreshToken: 'new-rt',
      });
      authRepository.transaction.mockImplementation((cb) => cb({} as never));

      const tokens = await service.refreshTokens(user, refreshToken);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authRepository.findSession).toHaveBeenCalledWith(refreshToken);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authRepository.deleteSession).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(jwtService.generatePair).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authRepository.createSession).toHaveBeenCalled();
      expect(tokens).toEqual({ accessToken: 'new-at', refreshToken: 'new-rt' });
    });

    it('should throw BadRequestException if session not found', async () => {
      authRepository.findSession.mockResolvedValue(null);

      await expect(service.refreshTokens(user, refreshToken)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('verifyEmail', () => {
    const token = 'confirmation-token';

    it('should verify user email successfully', async () => {
      authRepository.findConfirmationToken.mockResolvedValue({
        token,
        type: 'VERIFICATION',
        userId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      authRepository.transaction.mockImplementation((cb) => cb({} as never));

      await service.verifyEmail(token);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authRepository.findConfirmationToken).toHaveBeenCalledWith(token);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authRepository.deleteConfirmationToken).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authRepository.verifyUser).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid token', async () => {
      authRepository.findConfirmationToken.mockResolvedValue(null as any);

      await expect(service.verifyEmail(token)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
