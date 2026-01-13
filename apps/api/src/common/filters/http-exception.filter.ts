import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from "@nestjs/common";
import { Request, Response } from "express";
import { AppLogger } from "../logger/logger.service";
import { HttpExceptionResponse } from "../types";
import { getRequestId } from "../middleware/request-id.middleware";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(@Inject(AppLogger) private readonly logger: AppLogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

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
}
