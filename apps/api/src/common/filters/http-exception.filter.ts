import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
  Inject,
} from "@nestjs/common";
import { Request, Response } from "express";
import { AppLogger } from "../logger/logger.service";
import { HttpExceptionResponse } from "../types";
import { getRequestId } from "../middleware/request-id.middleware";

/**
 * Validation error details from class-validator
 */
interface ValidationErrorDetail {
  property: string;
  value?: any;
  constraints?: Record<string, string>;
  children?: ValidationErrorDetail[];
}

/**
 * Validation metrics tracker
 * Tracks common validation issues for monitoring
 */
class ValidationMetrics {
  private static errorCounts: Map<string, number> = new Map();
  private static fieldErrorCounts: Map<string, number> = new Map();

  static trackValidationError(path: string, errors: ValidationErrorDetail[]): void {
    // Track total validation errors per endpoint
    const currentCount = this.errorCounts.get(path) || 0;
    this.errorCounts.set(path, currentCount + 1);

    // Track field-level errors
    const trackFieldErrors = (err: ValidationErrorDetail) => {
      const fieldKey = `${path}:${err.property}`;
      const fieldCount = this.fieldErrorCounts.get(fieldKey) || 0;
      this.fieldErrorCounts.set(fieldKey, fieldCount + 1);

      if (err.children) {
        err.children.forEach(trackFieldErrors);
      }
    };

    errors.forEach(trackFieldErrors);
  }

  static getMetrics() {
    return {
      endpointErrors: Object.fromEntries(this.errorCounts),
      fieldErrors: Object.fromEntries(this.fieldErrorCounts),
    };
  }

  static reset(): void {
    this.errorCounts.clear();
    this.fieldErrorCounts.clear();
  }
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(@Inject(AppLogger) private readonly logger: AppLogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Handle payload too large errors from body parser (413)
    if (exception && typeof exception === "object" && "type" in exception) {
      const err = exception as { type?: string; status?: number; message?: string };
      if (err.type === "entity.too.large" || err.status === 413) {
        return response.status(413).json({
          statusCode: 413,
          timestamp: new Date().toISOString(),
          path: request.url,
          message: "Payload too large. Request body exceeds the maximum allowed size.",
          requestId: getRequestId() || (request as any).requestId,
        });
      }
    }

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : "Internal server error";

    const errorMessage = typeof message === "string" 
      ? message 
      : (message as HttpExceptionResponse).message || String(message);

    // Get request ID from context
    const requestId = getRequestId() || (request as any).requestId;

    // Enhanced validation error logging
    if (status === HttpStatus.BAD_REQUEST && exception instanceof BadRequestException) {
      const validationResponse = exception.getResponse();
      
      // Check if this is a validation error from class-validator
      if (
        typeof validationResponse === "object" &&
        validationResponse !== null &&
        "message" in validationResponse
      ) {
        const validationMessage = (validationResponse as any).message;
        
        // Extract validation error details
        let validationErrors: ValidationErrorDetail[] = [];
        
        if (Array.isArray(validationMessage)) {
          // class-validator returns array of error objects
          validationErrors = validationMessage.filter(
            (msg: any): msg is ValidationErrorDetail =>
              typeof msg === "object" && msg !== null && "property" in msg
          );
        }

        // Log validation errors with details
        const errorDetails = {
          path: request.url,
          method: request.method,
          body: this.sanitizeRequestBody(request.body),
          query: request.query,
          params: request.params,
          errors: validationErrors.map((err) => ({
            property: err.property,
            constraints: err.constraints,
            value: this.sanitizeValue(err.value),
          })),
          requestId,
        };

        this.logger.warn(
          `Validation Error: ${request.method} ${request.url} - ${validationErrors.length} field(s) failed validation`,
          "HttpExceptionFilter"
        );

        this.logger.debug(
          `Validation Error Details: ${JSON.stringify(errorDetails)}`,
          "HttpExceptionFilter"
        );

        // Track validation metrics
        if (validationErrors.length > 0) {
          ValidationMetrics.trackValidationError(request.url, validationErrors);
        }

        // Include detailed validation errors in response
        response.status(status).json({
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: request.url,
          message: Array.isArray(validationMessage) 
            ? "Validation failed" 
            : validationMessage,
          errors: validationErrors.length > 0 
            ? validationErrors.map((err) => ({
                property: err.property,
                constraints: err.constraints,
              }))
            : undefined,
          requestId,
        });
        return;
      }
    }

    // Log error (only log server errors, not client errors like 400, 401, 404)
    if (status >= 500) {
      this.logger.error(
        `HTTP ${status} Error: ${errorMessage}`,
        exception instanceof Error ? exception.stack : undefined,
        "HttpExceptionFilter"
      );
    } else if (status >= 400) {
      // Log client errors at debug level in development
      this.logger.debug(
        `HTTP ${status} Client Error: ${errorMessage} - Path: ${request.url}`,
        "HttpExceptionFilter"
      );
    }

    // Include request ID in response header (if not already set by middleware)
    if (requestId && !response.getHeader("X-Request-ID")) {
      response.setHeader("X-Request-ID", requestId);
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: errorMessage,
      requestId: requestId, // Include request ID in error response
    });
  }

  /**
   * Sanitize request body to remove sensitive information
   */
  private sanitizeRequestBody(body: any): any {
    if (!body || typeof body !== "object") {
      return body;
    }

    const sensitiveFields = ["password", "token", "secret", "apiKey", "authorization"];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = "[REDACTED]";
      }
    }

    return sanitized;
  }

  /**
   * Sanitize values in validation errors
   */
  private sanitizeValue(value: any): any {
    if (value === undefined || value === null) {
      return value;
    }

    if (typeof value === "string") {
      // Truncate long strings
      return value.length > 100 ? value.substring(0, 100) + "..." : value;
    }

    if (typeof value === "object") {
      return "[Object]";
    }

    return value;
  }
}

/**
 * Export validation metrics for monitoring
 */
export { ValidationMetrics };
