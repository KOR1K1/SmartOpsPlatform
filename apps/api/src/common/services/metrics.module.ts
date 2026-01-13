import { Module } from "@nestjs/common";
import { ValidationMetricsService } from "./validation-metrics.service";

/**
 * Module for validation metrics
 * Provides access to validation error statistics
 */
@Module({
  providers: [ValidationMetricsService],
  exports: [ValidationMetricsService],
})
export class MetricsModule {}
