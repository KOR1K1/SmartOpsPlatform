import { Injectable, Inject } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { PrismaService } from "../prisma/prisma.service";
import { AppLogger } from "../common/logger/logger.service";
import { env } from "../config/env";

@Injectable()
export class AnalyticsService {
  private readonly CACHE_KEY_DASHBOARD = "analytics:dashboard:stats";
  private readonly CACHE_TTL = env.redisTtl * 1000; // Convert to milliseconds

  constructor(
    private prisma: PrismaService,
    @Inject(AppLogger) private readonly logger: AppLogger,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  /**
   * Get dashboard statistics with optimized queries and caching
   * Uses $transaction for data consistency and performance
   * All queries run in parallel within a transaction
   * Results are cached to reduce database load
   */
  async getDashboardStats() {
    // Try to get from cache first
    const cached = await this.cacheManager.get<any>(this.CACHE_KEY_DASHBOARD);
    if (cached) {
      this.logger.debug("Dashboard stats served from cache", "AnalyticsService");
      return cached;
    }

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

    // Cache the result
    await this.cacheManager.set(this.CACHE_KEY_DASHBOARD, result, this.CACHE_TTL);
    this.logger.debug("Dashboard stats fetched and cached successfully", "AnalyticsService");
    
    return result;
  }

  /**
   * Invalidate dashboard cache
   * Call this when data changes that affects dashboard stats
   */
  async invalidateDashboardCache(): Promise<void> {
    await this.cacheManager.del(this.CACHE_KEY_DASHBOARD);
    this.logger.debug("Dashboard cache invalidated", "AnalyticsService");
  }
}
