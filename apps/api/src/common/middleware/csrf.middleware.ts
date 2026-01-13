import { Injectable, NestMiddleware, ForbiddenException } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { env } from "../../config/env";
import { getRequestId } from "./request-id.middleware";

/**
 * CSRF Protection Middleware
 * 
 * Protects against Cross-Site Request Forgery attacks by:
 * 1. Validating Origin header for state-changing requests (POST, PUT, DELETE, PATCH)
 * 2. Ensuring requests come from allowed origins
 * 3. Logging suspicious requests
 * 
 * Note: For REST API with JWT in httpOnly cookies, CSRF is less critical
 * but still recommended for defense in depth.
 */
@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  private readonly allowedOrigins: string[];

  constructor() {
    // Allowed origins from CORS configuration
    this.allowedOrigins = [
      env.frontendUrl,
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ];
  }

  use(req: Request, res: Response, next: NextFunction) {
    // Only check state-changing methods
    const stateChangingMethods = ["POST", "PUT", "DELETE", "PATCH"];
    const isStateChanging = stateChangingMethods.includes(req.method);

    if (!isStateChanging) {
      // GET, HEAD, OPTIONS don't need CSRF protection
      return next();
    }

    // Get Origin or Referer header
    const origin = req.headers.origin || req.headers.referer;
    
    // Allow requests without Origin/Referer in development (e.g., Postman, curl)
    // In production, this should be stricter
    if (!origin && env.nodeEnv === "development") {
      return next();
    }

    // If Origin/Referer is present, validate it
    if (origin) {
      const originUrl = typeof origin === "string" ? origin : origin[0];
      const originHost = this.extractHost(originUrl);

      // Check if origin is in allowed list
      const isAllowed = this.allowedOrigins.some((allowed) => {
        const allowedHost = this.extractHost(allowed);
        return originHost === allowedHost;
      });

      if (!isAllowed) {
        const requestId = getRequestId();
        // Log suspicious request
        console.warn(
          `[CSRF] Blocked request from unauthorized origin: ${originHost} - Request ID: ${requestId || "unknown"}`
        );

        throw new ForbiddenException(
          "CSRF protection: Request origin not allowed"
        );
      }
    }

    next();
  }

  /**
   * Extract host from URL (with or without protocol)
   */
  private extractHost(url: string): string {
    try {
      // If URL doesn't have protocol, add http:// for parsing
      const urlWithProtocol = url.startsWith("http") ? url : `http://${url}`;
      const parsed = new URL(urlWithProtocol);
      return `${parsed.protocol}//${parsed.host}`;
    } catch {
      // If parsing fails, return as-is
      return url;
    }
  }
}
