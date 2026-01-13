import { Injectable, LoggerService } from "@nestjs/common";
import * as winston from "winston";
import { getRequestId } from "../middleware/request-id.middleware";

/**
 * Custom logger service with request ID support
 * Automatically includes request ID in all log entries when available
 */
@Injectable()
export class AppLogger implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug");

    this.logger = winston.createLogger({
      level: logLevel,
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        // Добавляем request ID в формат логов
        winston.format((info) => {
          const requestId = getRequestId();
          if (requestId) {
            info.requestId = requestId;
          }
          return info;
        })(),
        winston.format.json()
      ),
      defaultMeta: { service: "smartops-api" },
      transports: [
        // Console transport with colorized output for development
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, requestId, ...meta }) => {
              const requestIdStr = requestId ? `[${requestId}]` : "";
              let msg = `${timestamp} [${level}]${requestIdStr} ${message}`;
              if (Object.keys(meta).length > 0) {
                msg += ` ${JSON.stringify(meta)}`;
              }
              return msg;
            })
          ),
        }),
      ],
    });

    // In production, also log to file (optional)
    if (process.env.NODE_ENV === "production" && process.env.LOG_FILE) {
      this.logger.add(
        new winston.transports.File({
          filename: process.env.LOG_FILE || "logs/error.log",
          level: "error",
        })
      );
      this.logger.add(
        new winston.transports.File({
          filename: process.env.LOG_FILE_ALL || "logs/combined.log",
        })
      );
    }
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }
}
