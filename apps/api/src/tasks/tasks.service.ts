import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTaskDto } from "./dto/create-task.dto";

// Type alias for backward compatibility
type CreateTaskInput = CreateTaskDto;

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async createTask(data: CreateTaskInput, userId?: number | null) {
    console.log("[TasksService] createTask called:", { data, userId });
    
    // Validate title
    if (!data.title?.trim()) {
      throw new BadRequestException("Title is required");
    }
    const title = data.title.trim();
    if (title.length > 255) {
      throw new BadRequestException("Title must not exceed 255 characters");
    }

    // Validate description
    const description = data.description?.trim() || "";
    if (description.length > 10000) {
      throw new BadRequestException("Description must not exceed 10000 characters");
    }

    // Validate status
    const status = data.status?.trim() || "created";
    if (status.length > 50) {
      throw new BadRequestException("Status must not exceed 50 characters");
    }
    const validStatuses = ["created", "in_progress", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Status must be one of: ${validStatuses.join(", ")}`);
    }

    console.log("[TasksService] Creating task with status:", status);

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

    console.log("[TasksService] Task created:", task.id);

    // Create corresponding task event
    await this.prisma.taskEvent.create({
      data: {
        taskId: task.id,
        userId: userId ?? null,
        type: "created",
        message: `Task "${task.title}" created`,
      },
    });

    console.log("[TasksService] Task event created for task:", task.id);
    return task;
  }
}
