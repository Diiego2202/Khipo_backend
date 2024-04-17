import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Task, Tag, Prisma } from '@prisma/client';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async task(
    taskWhereUniqueInput: Prisma.TaskWhereUniqueInput,
  ): Promise<Task | null> {
    return this.prisma.task.findUnique({
      where: taskWhereUniqueInput,
    });
  }

  async tasks(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.TaskWhereUniqueInput;
    where?: Prisma.TaskWhereInput;
    orderBy?: Prisma.TaskOrderByWithRelationInput;
  }): Promise<Task[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.task.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createTask(data: Prisma.TaskCreateInput, tags: string[]): Promise<{ task: Task; tags: Tag[] }> {
    const task = await this.prisma.task.create({
      data,
    });
  
    const createdTags = [];
  
    if (tags && tags.length > 0) {
      await Promise.all(
        tags.map(async (tagTitle) => {
          const createdTag = await this.prisma.tag.create({
            data: {
              title: tagTitle,
              task: {
                connect: { id: task.id },
              },
            },
          });
          createdTags.push(createdTag);
        })
      );
    }
  
    return { task, tags: createdTags };
  } 

  async updateTask(params: {
    where: Prisma.TaskWhereUniqueInput;
    data: Prisma.TaskUpdateInput;
  }): Promise<Task> {
    const { data, where } = params;
    return this.prisma.task.update({
      data,
      where,
    });
  }

  async deleteTask(where: Prisma.TaskWhereUniqueInput): Promise<Task> {
    return this.prisma.task.delete({
      where,
    });
  }

  async getTasksByProjectId(projectId: number) {
    return this.prisma.task.findMany({
      where: {
        projectID: projectId,
      },
      include: {
        tags: true,
      },
    });
  }  
}