/**
 * Production-ready logger utility for Next.js web application
 * 
 * Features:
 * - Environment-aware logging (disabled in production for non-critical logs)
 * - Structured logging format
 * - No console methods in production (except errors)
 * - Client and server compatible
 * 
 * For production monitoring, integrate with external services:
 * - Sentry for error tracking
 * - LogRocket for session replay
 * - Datadog for analytics
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  error?: {
    message: string;
    stack?: string;
    name?: string;
  };
  metadata?: Record<string, unknown>;
}

class Logger {
  private isProduction = process.env.NODE_ENV === "production";
  private logLevel: LogLevel;

  constructor() {
    // Determine log level from environment
    const envLogLevel = process.env.NEXT_PUBLIC_LOG_LEVEL || process.env.LOG_LEVEL;
    if (envLogLevel && ["debug", "info", "warn", "error"].includes(envLogLevel)) {
      this.logLevel = envLogLevel as LogLevel;
    } else {
      this.logLevel = this.isProduction ? "warn" : "debug";
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ["debug", "info", "warn", "error"];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private formatLogEntry(
    level: LogLevel,
    message: string,
    context?: string,
    error?: Error | unknown,
    metadata?: Record<string, unknown>
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    if (context) {
      entry.context = context;
    }

    if (error) {
      if (error instanceof Error) {
        entry.error = {
          message: error.message,
          stack: error.stack,
          name: error.name,
        };
      } else {
        entry.error = {
          message: String(error),
        };
      }
    }

    if (metadata && Object.keys(metadata).length > 0) {
      entry.metadata = metadata;
    }

    return entry;
  }

  private outputLog(entry: LogEntry): void {
    // In production, only output errors and warnings to console
    // In development, output everything
    if (this.isProduction && (entry.level === "debug" || entry.level === "info")) {
      // In production, don't output debug/info to console
      // Could send to external logging service here
      return;
    }

    // Format message for console output
    const prefix = `[${entry.level.toUpperCase()}]`;
    const contextStr = entry.context ? `[${entry.context}]` : "";
    const message = `${prefix}${contextStr} ${entry.message}`;

    // Use appropriate console method based on level
    switch (entry.level) {
      case "debug":
        // eslint-disable-next-line no-console
        console.debug(message, entry.metadata || "");
        break;
      case "info":
        // eslint-disable-next-line no-console
        console.info(message, entry.metadata || "");
        break;
      case "warn":
        // eslint-disable-next-line no-console
        console.warn(message, entry.error || entry.metadata || "");
        break;
      case "error":
        // Always log errors, even in production
        if (entry.error) {
          // eslint-disable-next-line no-console
          console.error(message, entry.error);
        } else {
          // eslint-disable-next-line no-console
          console.error(message, entry.metadata || "");
        }
        break;
    }

    // In production, you could send structured logs to external service:
    // if (this.isProduction && entry.level === "error") {
    //   // Send to Sentry, LogRocket, etc.
    //   sendToLoggingService(entry);
    // }
  }

  debug(message: string, context?: string, metadata?: Record<string, unknown>): void {
    if (this.shouldLog("debug")) {
      const entry = this.formatLogEntry("debug", message, context, undefined, metadata);
      this.outputLog(entry);
    }
  }

  info(message: string, context?: string, metadata?: Record<string, unknown>): void {
    if (this.shouldLog("info")) {
      const entry = this.formatLogEntry("info", message, context, undefined, metadata);
      this.outputLog(entry);
    }
  }

  warn(message: string, context?: string, error?: Error | unknown, metadata?: Record<string, unknown>): void {
    if (this.shouldLog("warn")) {
      const entry = this.formatLogEntry("warn", message, context, error, metadata);
      this.outputLog(entry);
    }
  }

  error(message: string, error?: Error | unknown, context?: string, metadata?: Record<string, unknown>): void {
    if (this.shouldLog("error")) {
      const entry = this.formatLogEntry("error", message, context, error, metadata);
      this.outputLog(entry);
    }
  }
}

export const logger = new Logger();
