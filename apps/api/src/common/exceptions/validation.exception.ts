import { BadRequestException } from "@nestjs/common";

/**
 * Custom exception for validation errors
 * Provides consistent error messages and structure
 */
export class ValidationException extends BadRequestException {
  constructor(message: string, field?: string) {
    super({
      message,
      field,
      error: "Validation Error",
      statusCode: 400,
    });
  }
}

/**
 * Exception for pagination validation errors
 */
export class PaginationValidationException extends ValidationException {
  constructor(field: "limit" | "offset", value: number, reason: string) {
    super(
      `Invalid ${field}: ${value}. ${reason}`,
      field
    );
  }
}

/**
 * Exception for search query validation errors
 */
export class SearchValidationException extends ValidationException {
  constructor(maxLength: number, actualLength: number) {
    super(
      `Search query must not exceed ${maxLength} characters (got ${actualLength})`,
      "q"
    );
  }
}
