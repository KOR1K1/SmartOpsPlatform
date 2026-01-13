import {
  Body,
  Controller,
  Post,
  UseGuards,
  Req,
  Inject,
} from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateTaskDto } from "./dto/create-task.dto";
import { AppLogger } from "../common/logger/logger.service";
import { AuthenticatedRequest } from "../common/types";

@Controller("tasks")
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    @Inject(AppLogger) private readonly logger: AppLogger
  ) {}

  @Post()
  createTask(@Body() body: CreateTaskDto, @Req() req: AuthenticatedRequest) {
    const userId = req?.user?.userId ?? null;
    this.logger.debug(`Creating task request from user ${userId}`, "TasksController");
    return this.tasksService.createTask(body, userId);
  }
}
