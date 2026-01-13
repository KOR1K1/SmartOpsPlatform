import {
  Body,
  Controller,
  Post,
  UseGuards,
  Req,
} from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateTaskDto } from "./dto/create-task.dto";

@Controller("tasks")
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  createTask(@Body() body: CreateTaskDto, @Req() req: any) {
    const userId = req?.user?.userId ?? null;
    console.log("[TasksController] Creating task:", { body, userId });
    return this.tasksService.createTask(body, userId);
  }
}
