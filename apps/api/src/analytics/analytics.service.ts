import { Injectable, Inject } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AppLogger } from "../common/logger/logger.service";

@Injectable()
export class AnalyticsService {
  constructor(
    private prisma: PrismaService,
    @Inject(AppLogger) private readonly logger: AppLogger
  ) {}

  /**
   * Get dashboard statistics with optimized queries
   * Uses $transaction for data consistency and performance
   * All queries run in parallel within a transaction
   */
  async getDashboardStats() {
    // Use transaction for consistency and better performance
    // All queries run in parallel, ensuring consistent snapshot of data
    const result = await this.prisma.$transaction(
      async (tx) => {
        // Execute all count queries in parallel
        const [
          totalTasks,
          activeTasks,
          totalUsers,
          totalEvents,
          totalDocuments,
          tasksByStatus,
        ] = await Promise.all([
          // Count queries - optimized with composite indexes
          tx.task.count({ where: { deletedAt: null } }),
          tx.task.count({
            where: { status: "in_progress", deletedAt: null },
          }),
          tx.user.count({ where: { deletedAt: null } }),
          tx.taskEvent.count({ where: { deletedAt: null } }),
          tx.knowledgeDocument.count({ where: { deletedAt: null } }),
          // GroupBy query - can be optimized further with materialized views
          tx.task.groupBy({
            by: ["status"],
            where: { deletedAt: null },
            _count: true,
          }),
        ]);

        // Fetch recent events with relations
        // This query benefits from composite index on [deletedAt, createdAt]
        const recentEvents = await tx.taskEvent.findMany({
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
      },
      {
        // Transaction timeout - prevent long-running queries
        timeout: 10000, // 10 seconds
      }
    );

    this.logger.debug("Dashboard stats fetched successfully", "AnalyticsService");
    return result;
  }
}
