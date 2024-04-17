import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaService } from './prisma.service';
import { AppService } from './app.service';
import { ProjectService } from './service/project.service';
import { TagService } from './service/tag.service';
import { TaskService } from './service/task.service';
import { UserService } from './service/user.service';
import * as cors from 'cors';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, PrismaService, ProjectService, TagService, TaskService, UserService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cors()).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
