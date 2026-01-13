/**
 * Common types to replace 'any' usage throughout the application
 * Provides type safety and better IDE support
 */

import { Request } from "express";
import { Prisma } from "@prisma/client";

/**
 * JWT Payload structure
 * Used in JWT and JWT Refresh strategies
 */
export interface JwtPayload {
  sub: number; // User ID
  email: string;
  role: string;
  iat?: number; // Issued at
  exp?: number; // Expiration
}

/**
 * Authenticated user data returned from JWT validation
 */
export interface AuthenticatedUser {
  userId: number;
  email: string;
  role: string;
  roleId: number;
}

/**
 * Express Request with authenticated user
 * Used in controllers that require authentication
 */
export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

/**
 * Prisma filter for TaskEvent queries
 */
export type TaskEventWhereInput = Prisma.TaskEventWhereInput;

/**
 * Prisma filter for KnowledgeDocument queries
 */
export type KnowledgeDocumentWhereInput = Prisma.KnowledgeDocumentWhereInput;

/**
 * System Event metadata type
 * Can be any JSON-serializable object
 */
export type SystemEventMetadata = Prisma.InputJsonValue;

/**
 * Task Event data structure
 * Used in WebSocket broadcasts
 */
export interface TaskEventData {
  id: number;
  taskId: number;
  userId: number | null;
  type: string;
  message: string;
  createdAt: Date;
  task?: {
    id: number;
    title: string;
    status: string;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

/**
 * System Event data structure
 * Used in WebSocket broadcasts
 */
export interface SystemEventData {
  id: number;
  type: string;
  message: string;
  metadata: SystemEventMetadata | null;
  createdAt: Date;
}

/**
 * HttpException response structure
 * Used in exception filter
 */
export interface HttpExceptionResponse {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

/**
 * Pagination metadata structure
 * Provides information about pagination state
 */
export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Paginated response structure
 * Standard format for all paginated list endpoints
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMetadata;
}