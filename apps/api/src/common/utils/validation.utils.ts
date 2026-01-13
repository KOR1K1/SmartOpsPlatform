import { PaginationValidationException, SearchValidationException, ValidationException } from "../exceptions/validation.exception";

/**
 * Validation utilities to reduce code duplication
 * Provides reusable validation functions for common patterns
 */

export interface PaginationParams {
  limit?: number;
  offset?: number;
  maxLimit?: number;
  minLimit?: number;
}

export interface SearchParams {
  query?: string;
  maxLength?: number;
}

/**
 * Validate pagination parameters
 * Throws PaginationValidationException if validation fails
 */
export function validatePagination(params: PaginationParams): void {
  const { limit = 50, offset = 0, maxLimit = 500, minLimit = 1 } = params;

  if (limit > maxLimit) {
    throw new PaginationValidationException("limit", limit, `Limit must not exceed ${maxLimit}`);
  }

  if (limit < minLimit) {
    throw new PaginationValidationException("limit", limit, `Limit must be at least ${minLimit}`);
  }

  if (offset < 0) {
    throw new PaginationValidationException("offset", offset, "Offset must be non-negative");
  }
}

/**
 * Validate search query length
 * Throws SearchValidationException if validation fails
 */
export function validateSearchQuery(params: SearchParams): void {
  const { query, maxLength = 200 } = params;

  if (query && query.length > maxLength) {
    throw new SearchValidationException(maxLength, query.length);
  }
}

/**
 * Validate string length
 * Throws ValidationException if validation fails
 */
export function validateStringLength(
  value: string | undefined,
  fieldName: string,
  maxLength: number,
  minLength: number = 0
): void {
  if (value === undefined || value === null) {
    return; // Optional field
  }

  if (value.length > maxLength) {
    throw new ValidationException(
      `${fieldName} must not exceed ${maxLength} characters`,
      fieldName
    );
  }

  if (value.length < minLength) {
    throw new ValidationException(
      `${fieldName} must be at least ${minLength} characters`,
      fieldName
    );
  }
}
