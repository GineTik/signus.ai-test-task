import {
  ConfirmationToken,
  ConfirmationTokenType,
  Prisma,
  PrismaService,
  User,
} from '@/shared/prisma';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmailOrThrow(email: string): Promise<User> {
    return this.prisma.user.findUniqueOrThrow({
      where: { email },
    });
  }

  async createUser(dto: Prisma.UserCreateInput) {
    return this.prisma.user.create({
      data: dto,
    });
  }

  async generateConfirmationToken(
    userId: string,
    type: ConfirmationTokenType,
  ): Promise<string> {
    const confirmationToken = await this.prisma.confirmationToken.create({
      data: {
        userId,
        type,
      },
    });
    return confirmationToken.token;
  }

  async findConfirmationToken(token: string): Promise<ConfirmationToken> {
    return await this.prisma.confirmationToken.findUniqueOrThrow({
      where: { token },
    });
  }

  async deleteConfirmationToken(token: string, tx?: Prisma.TransactionClient) {
    const prisma = tx ?? this.prisma;
    await prisma.confirmationToken.delete({
      where: { token },
    });
  }

  async verifyUser(userId: string, tx?: Prisma.TransactionClient) {
    const prisma = tx ?? this.prisma;
    await prisma.user.update({
      where: { id: userId },
      data: { isVerified: true },
    });
  }

  async createSession(
    userId: string,
    refreshToken: string,
    tx?: Prisma.TransactionClient,
  ) {
    const prisma = tx ?? this.prisma;
    await prisma.session.create({
      data: { userId, refreshToken },
    });
  }

  async findSession(refreshToken: string) {
    return this.prisma.session.findUnique({
      where: { refreshToken },
    });
  }

  async deleteSession(refreshToken: string, tx?: Prisma.TransactionClient) {
    const prisma = tx ?? this.prisma;
    await prisma.session.delete({
      where: { refreshToken },
    });
  }

  async transaction<T>(
    callback: (prisma: Prisma.TransactionClient) => Promise<T>,
  ) {
    return this.prisma.$transaction(callback);
  }
}
