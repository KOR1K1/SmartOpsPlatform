import { Controller, Get, UseGuards, Inject, Header } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AppLogger } from "../common/logger/logger.service";
import { env } from "../config/env";

@Controller("analytics")
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    @Inject(AppLogger) private readonly logger: AppLogger
  ) {}

  @Get("dashboard")
  @Header("Cache-Control", `public, max-age=${env.redisTtl}`)
  @Header("X-Cache-Status", "enabled")
  async getDashboardStats() {
    const stats = await this.analyticsService.getDashboardStats();
    return stats;
  }
}
