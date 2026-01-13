import { ConflictException } from "@nestjs/common";

/**
 * Custom exception for conflict errors (e.g., duplicate resources)
 * Provides consistent error messages and structure
 */
export class ResourceConflictException extends ConflictException {
  constructor(resource: string, field: string, value: string) {
    super({
      message: `${resource} with this ${field} already exists`,
      resource,
      field,
      value,
      error: "Conflict",
      statusCode: 409,
    });
  }
}
