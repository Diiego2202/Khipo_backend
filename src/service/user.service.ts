import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async user(userWhereUniqueInput: Prisma.UserWhereUniqueInput): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  async updateUser(userId: number, userData: { name?: string; email?: string; password?: string }): Promise<User> {
    const existingUser = await this.user({ id: userId });

    if (!existingUser) {
      throw new BadRequestException(`Usuário com ID ${userId} não encontrado.`);
    }

    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: userData,
    });
  }

  async updateUserWithProject(userId: number, projectId: number): Promise<User> {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { projects: true },
    });

    if (!existingUser) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado.`);
    }

    const projectAlreadyExists = existingUser.projects.some(project => project.id === projectId);
    if (projectAlreadyExists) {
      return existingUser;
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        projects: {
          connect: { id: projectId },
        },
      },
    });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({
      where,
    });
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
  
    if (!user) {
      return null;
    }
  
    const isPasswordValid = await bcrypt.compare(password, user.password);
  
    if (isPasswordValid) {
      return user;
    }
  
    return null;
  }
}
