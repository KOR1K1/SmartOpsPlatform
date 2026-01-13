import { Injectable } from "@nestjs/common";
import { ValidationMetrics } from "../filters/http-exception.filter";

/**
 * Service for accessing validation metrics
 * Can be used for monitoring and alerting
 */
@Injectable()
export class ValidationMetricsService {
  /**
   * Get current validation error metrics
   */
  getMetrics() {
    return ValidationMetrics.getMetrics();
  }

  /**
   * Reset validation metrics (useful for testing or periodic resets)
   */
  resetMetrics(): void {
    ValidationMetrics.reset();
  }
}
