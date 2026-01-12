import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

interface CreateTaskInput {
  title: string;
  description?: string;
  status?: string;
  assigneeId?: number | null;
}

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async createTask(data: CreateTaskInput, userId?: number | null) {
    console.log("[TasksService] createTask called:", { data, userId });
    if (!data.title?.trim()) {
      throw new BadRequestException("Title is required");
    }

    const status = data.status?.trim() || "created";
    console.log("[TasksService] Creating task with status:", status);

    const task = await this.prisma.task.create({
      data: {
        title: data.title.trim(),
        description: data.description?.trim() || "",
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
