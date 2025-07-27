import { Prisma, PrismaService, User } from '@/shared/prisma';
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

  async generateConfirmationToken(userId: string): Promise<string> {
    // TODO: Implement
  }
}
