import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { ProjectService } from './service/project.service';
import { TagService } from './service/tag.service';
import { TaskService } from './service/task.service';
import { UserService } from './service/user.service';
import { Project as ProjectModel, Tag as TagModel, Task as TaskModel, User as UserModel } from '@prisma/client';
import { Status } from './status.enum';

@Controller()
export class AppController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly tagService: TagService,
    private readonly taskService: TaskService,
    private readonly userService: UserService,
  ) {}

  //User
  @Post('user')
  async signupUser(
    @Body() userData: { name: string; email: string; password: string },
  ): Promise<UserModel> {
    return this.userService.createUser(userData);
  }

  @Get('user/:id')
  async getUserById(@Param('id') id: string): Promise<UserModel> {
    return this.userService.user({ id: Number(id) });
  }

  @Get('user/:id/projects')
  async getProjectsByUser(@Param('id') id: string): Promise<ProjectModel[]> {
    const userID = Number(id);

    const existingUser = await this.userService.user({ id: userID });
    if (!existingUser) {
      throw new NotFoundException(`Usuário com ID ${userID} não encontrado.`);
    }

    return this.projectService.projectsByUser(userID);
  }

  @Put('user/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() userData: { name?: string; email?: string; password?: string }
  ): Promise<UserModel> {
    const userId = parseInt(id, 10);

    if (!userData.name && !userData.email && !userData.password) {
      throw new BadRequestException('Nenhum dado de atualização fornecido.');
    }

    return this.userService.updateUser(userId, userData);
  }

  @Post('login')
  async login(@Body() loginData: { email: string; password: string }): Promise<any> {
    const { email, password } = loginData;

    const user = await this.userService.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return {
      statusCode: 200,
    };
  }

  //Project
  @Post('project')
  async newProject(
    @Body() projectData: { name: string; description: string; userID: number },
  ): Promise<ProjectModel> {
    const existingUser = await this.userService.user({ id: projectData.userID });
    if (!existingUser) {
      throw new NotFoundException(`Usuário com ID ${projectData.userID} não encontrado.`);
    }

    const newProject = await this.projectService.createProject(projectData);

    await this.userService.updateUserWithProject(projectData.userID, newProject.id);

    return newProject;
  }

  @Get('project/:id')
  async getProjectById(@Param('id') id: string): Promise<ProjectModel> {
    return this.projectService.project({ id: Number(id) });
  }

  @Put('project/:id')
  async updateProject(
    @Param('id') id: string,
    @Body() projectData: { name?: string; description?: string },
  ): Promise<ProjectModel> {
    const projectId = Number(id);
    const existingProject = await this.projectService.project({ id: projectId });

    if (!existingProject) {
      throw new NotFoundException(`Projeto com o ID ${id} não encontrado.`);
    }

    return this.projectService.updateProject(projectId, projectData);
  }

  @Get('/project/:id/tasks')
  async getTasksByProjectId(@Param('id') id: string) {
    const projectId = parseInt(id, 10);
    return this.taskService.getTasksByProjectId(projectId);
  }

  //Task
  @Post('task')
  async newTask(
    @Body() taskData: { title: string; description: string; status: Status; projectID: number, tags?: string[]; },
  ): Promise<{ task: TaskModel; tags: TagModel[] }> {
    const { title, description, status, projectID, tags } = taskData;
  
    if (!tags || tags.length === 0) {
      throw new BadRequestException('Pelo menos uma tag deve ser fornecida.');
    }
  
    const { task, tags: createdTags } = await this.taskService.createTask({
      title,
      description,
      status,
      project: {
        connect: { id: projectID },
      },
    }, tags);
  
    return { task, tags: createdTags };
  }

  @Put('task/:id')
  async editTask(@Param('id') id: string, @Body() taskData: { title?: string; description?: string, status?: Status; addTags?: string[]; removeTags?: string[] }): Promise<TaskModel> {
    const { title, description, status, addTags, removeTags } = taskData;
  
    if (!title && !description && !status && (!addTags || addTags.length === 0) && (!removeTags || removeTags.length === 0)) {
      throw new BadRequestException('Nenhum dado de atualização fornecido.');
    }
  
    const taskID = Number(id);
  
    const existingTask = await this.taskService.task({ id: taskID });
    if (!existingTask) {
      throw new NotFoundException(`Tarefa com o ID ${id} não encontrada.`);
    }
  
    const updatedTaskData: { title?: string; description?: string; status?: Status } = {};
    if (title) updatedTaskData.title = title;
    if (description) updatedTaskData.description = description;
    if (status) updatedTaskData.status = status;
    const updatedTask = await this.taskService.updateTask({ where: { id: taskID }, data: updatedTaskData });
  
    if (addTags && addTags.length > 0) {
      await Promise.all(
        addTags.map(async tag => {
          const createdTag = await this.tagService.createTag({ title: tag, task: { connect: { id: updatedTask.id } } });
          return createdTag;
        })
      );
    }

    //fazer a parte de remover tags
  
    return updatedTask;
  }
}