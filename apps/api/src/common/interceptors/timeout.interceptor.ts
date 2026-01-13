import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  RequestTimeoutException,
} from "@nestjs/common";
import { Observable, TimeoutError, catchError, throwError, timeout } from "rxjs";
import { Request } from "express";
import { env } from "../../config/env";
import { AppLogger } from "../logger/logger.service";

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const timeoutMs = env.requestTimeoutMs;

    return next.handle().pipe(
      timeout(timeoutMs),
      catchError((error) => {
        if (error instanceof TimeoutError) {
          this.logger.warn(
            `Request timeout after ${timeoutMs}ms: ${request.method} ${request.url}`,
            "TimeoutInterceptor"
          );
          return throwError(
            () =>
              new RequestTimeoutException(
                `Request timeout after ${timeoutMs}ms`
              )
          );
        }

        return throwError(() => error);
      })
    );
  }
}

