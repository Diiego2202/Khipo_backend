import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Project, Prisma } from '@prisma/client';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async project(
    projectWhereUniqueInput: Prisma.ProjectWhereUniqueInput,
  ): Promise<Project | null> {
    return this.prisma.project.findUnique({
      where: projectWhereUniqueInput,
    });
  }

  async projects(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ProjectWhereUniqueInput;
    where?: Prisma.ProjectWhereInput;
    orderBy?: Prisma.ProjectOrderByWithRelationInput;
  }): Promise<Project[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.project.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createProject(projectData: { name: string; description: string; userID: number }): Promise<Project> {
    const { name, description, userID } = projectData;
    return this.prisma.project.create({
      data: {
        name,
        description,
        members: { connect: { id: userID } }
      },
    });
  }

  async updateProject(id: number, data: Prisma.ProjectUpdateInput): Promise<Project> {
    return this.prisma.project.update({
      data,
      where: { id },
    });
  }

  async deleteProject(where: Prisma.ProjectWhereUniqueInput): Promise<Project> {
    return this.prisma.project.delete({
      where,
    });
  }

  async projectsByUser(userID: number): Promise<Project[]> {
    return this.prisma.project.findMany({
      where: {
        members: {
          some: {
            id: userID,
          },
        },
      },
    });
  }
}
