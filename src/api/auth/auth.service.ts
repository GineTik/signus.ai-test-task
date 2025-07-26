import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { AuthRepository } from './auth.repository';
import { User } from '@/shared/prisma';
import { mapRegisterDtoToUser } from './auth.mapper';
import { LoginDto } from './dto/login.dto';
import bcrypt from 'bcrypt';
import { JwtService } from '@/shared/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.authRepository.findByEmailOrThrow(dto.email);
    await this.throwIfPasswordIsInvalid(user.password, dto.password);

    if (!user.isVerified) {
      await this.sendVerificationMail(user.email);
    }

    return this.generateTokens(user);
  }

  async register(dto: RegisterDto) {
    await this.throwIfUserExists(dto.email);
    const user = await this.authRepository.createUser(
      await mapRegisterDtoToUser(dto),
    );
    await this.sendVerificationMail(user.email);
    return this.generateTokens(user);
  }

  async refreshTokens(user: User) {
    // TODO: Implement
  }

  async verifyEmail(email: string) {
    // TODO: Implement
  }

  private async throwIfPasswordIsInvalid(
    userPassword: string,
    hashedPassword: string,
  ) {
    const isPasswordValid = await bcrypt.compare(userPassword, hashedPassword);

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

  private generateTokens(user: User) {
    // TODO: Implement
  }

  private async sendVerificationMail(email: string) {
    // TODO: Implement
  }
}
