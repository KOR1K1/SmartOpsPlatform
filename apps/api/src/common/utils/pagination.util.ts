import { PaginatedResponse, PaginationMetadata } from "../types";

/**
 * Calculate pagination metadata from total count and pagination parameters
 * @param total - Total number of items
 * @param limit - Items per page
 * @param offset - Number of items to skip
 * @returns Pagination metadata
 */
export function calculatePaginationMetadata(
  total: number,
  limit: number,
  offset: number
): PaginationMetadata {
  const page = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);
  const hasMore = offset + limit < total;

  return {
    page,
    limit,
    total,
    totalPages,
    hasMore,
  };
}

/**
 * Create a paginated response
 * @param data - Array of items for current page
 * @param total - Total number of items
 * @param limit - Items per page
 * @param offset - Number of items to skip
 * @returns Paginated response with data and metadata
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  limit: number,
  offset: number
): PaginatedResponse<T> {
  return {
    data,
    pagination: calculatePaginationMetadata(total, limit, offset),
  };
}
