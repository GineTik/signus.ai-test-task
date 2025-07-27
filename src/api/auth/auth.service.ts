import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { AuthRepository } from './auth.repository';
import { ConfirmationTokenType, User } from '@/shared/prisma';
import { mapRegisterDtoToUser } from './auth.mapper';
import { LoginDto } from './dto/login.dto';
import bcrypt from 'bcrypt';
import { JwtService, PayloadDto } from '@/shared/jwt';
import { MailService } from '@/shared/mail';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.authRepository.findByEmailOrThrow(dto.email);
    await this.throwIfPasswordIsInvalid(dto.password, user.password);

    if (!user.isVerified) {
      await this.sendVerificationMail(user);
    }

    return await this.generateTokens(user);
  }

  async register(dto: RegisterDto) {
    await this.throwIfUserExists(dto.email);
    const user = await this.authRepository.createUser(
      await mapRegisterDtoToUser(dto),
    );
    await this.sendVerificationMail(user);
    return await this.generateTokens(user);
  }

  async refreshTokens(user: User, refreshToken: string) {
    const userId = await this.cacheManager.get<string>(
      `session-${refreshToken}`,
    );

    if (!userId || userId !== user.id) {
      throw new BadRequestException('Session not found');
    }

    return await this.generateTokens(user);
  }

  async verifyEmail(token: string) {
    const confirmationToken =
      await this.authRepository.findConfirmationToken(token);

    if (!confirmationToken) {
      throw new BadRequestException('Invalid confirmation token');
    }

    await this.authRepository.transaction(async (tx) => {
      await this.authRepository.deleteConfirmationToken(token, tx);
      await this.authRepository.verifyUser(confirmationToken.userId, tx);
    });
  }

  private async generateTokens(user: User) {
    const payload: PayloadDto = {
      id: user.id,
      email: user.email,
      isEmailVerified: user.isVerified,
    };
    const tokens = await this.jwtService.generatePair(payload);
    await this.cacheManager.set<string>(
      `session-${tokens.refreshToken}`,
      user.id,
    );
    return tokens;
  }

  private async sendVerificationMail({ id, email }: User) {
    const confirmationToken =
      await this.authRepository.generateConfirmationToken(
        id,
        ConfirmationTokenType.VERIFICATION,
      );
    await this.mailService.sendVerification(email, confirmationToken);
  }

  private async throwIfPasswordIsInvalid(
    plainTextPassword: string,
    hashedPassword: string,
  ) {
    const isPasswordValid = await bcrypt.compare(
      plainTextPassword,
      hashedPassword,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  private async throwIfUserExists(email: string) {
    const existingUser = await this.authRepository.findByEmailOrThrow(email);

    if (existingUser) {
      throw new ConflictException('User already exists');
    }
  }
}
