import { Injectable, Inject } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { AppLogger } from "../common/logger/logger.service";
import { ValidationException } from "../common/exceptions/validation.exception";
import { validateStringLength } from "../common/utils/validation.utils";

// Type alias for backward compatibility
type CreateTaskInput = CreateTaskDto;

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    @Inject(AppLogger) private readonly logger: AppLogger
  ) {}

  async createTask(data: CreateTaskInput, userId?: number | null) {
    this.logger.debug(`Creating task for user ${userId}`, "TasksService");
    
    // Validate title
    if (!data.title?.trim()) {
      throw new ValidationException("Title is required", "title");
    }
    const title = data.title.trim();
    validateStringLength(title, "title", 255, 1);

    // Validate description
    const description = data.description?.trim() || "";
    validateStringLength(description, "description", 10000);

    // Validate status
    const status = data.status?.trim() || "created";
    validateStringLength(status, "status", 50);
    const validStatuses = ["created", "in_progress", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      throw new ValidationException(
        `Status must be one of: ${validStatuses.join(", ")}`,
        "status"
      );
    }

    this.logger.debug(`Creating task with status: ${status}`, "TasksService");

    const task = await this.prisma.task.create({
      data: {
        title,
        description,
        status,
        assigneeId: data.assigneeId ?? null,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    this.logger.log(`Task created successfully: ${task.id}`, "TasksService");

    // Create corresponding task event
    await this.prisma.taskEvent.create({
      data: {
        taskId: task.id,
        userId: userId ?? null,
        type: "created",
        message: `Task "${task.title}" created`,
      },
    });

    this.logger.debug(`Task event created for task: ${task.id}`, "TasksService");
    return task;
  }
}
