import { Controller, Get, UseGuards, Inject } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AppLogger } from "../common/logger/logger.service";

@Controller("analytics")
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    @Inject(AppLogger) private readonly logger: AppLogger
  ) {}

  @Get("dashboard")
  getDashboardStats() {
    return this.analyticsService.getDashboardStats();
  }
}
