import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [totalTasks, activeTasks, totalUsers, totalEvents, totalDocuments] =
      await Promise.all([
        this.prisma.task.count({ where: { deletedAt: null } }),
        this.prisma.task.count({
          where: { status: "in_progress", deletedAt: null },
        }),
        this.prisma.user.count({ where: { deletedAt: null } }),
        this.prisma.taskEvent.count({ where: { deletedAt: null } }),
        this.prisma.knowledgeDocument.count({ where: { deletedAt: null } }),
      ]);

    const tasksByStatus = await this.prisma.task.groupBy({
      by: ["status"],
      where: { deletedAt: null },
      _count: true,
    });

    const recentEvents = await this.prisma.taskEvent.findMany({
      where: { deletedAt: null },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        task: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      totals: {
        tasks: totalTasks,
        activeTasks,
        users: totalUsers,
        events: totalEvents,
        documents: totalDocuments,
      },
      tasksByStatus: tasksByStatus.map((item) => ({
        status: item.status,
        count: item._count,
      })),
      recentEvents,
    };
  }
}
