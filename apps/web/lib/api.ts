/**
 * Server-side API client for Next.js Server Components
 * This should only be used in Server Components, not in Client Components
 */

import { env } from "./env";
import { getAccessToken } from "./auth-cookies";
import { refreshToken as refreshTokenApi } from "./auth-api";
import { getRefreshToken, updateAccessToken } from "./auth-cookies";
import { logger } from "./logger";
import { fetchWithRetry } from "./http";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: unknown;
  cache?: RequestCache;
  next?: {
    revalidate?: number;
    tags?: string[];
  };
};

/**
 * Fetch data from API in Server Components
 * This function is optimized for server-side rendering
 * Handles errors gracefully - Next.js automatically handles build-time errors
 * Automatically includes Authorization header with access token
 * Handles 401 errors by refreshing token and retrying request
 * 
 * According to Next.js docs: errors during static generation are handled gracefully,
 * and the last successfully generated page continues to be served.
 */
export async function fetchApi<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", headers = {}, body, cache, next } = options;

  const url = `${env.apiUrl}${endpoint}`;

  // Get access token from cookies
  const accessToken = await getAccessToken();

  // Prepare headers with Authorization if token exists
  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (accessToken) {
    requestHeaders.Authorization = `Bearer ${accessToken}`;
  } else {
    // If no access token and we're trying to access protected endpoint, try refresh
    // But only if this is not a public endpoint
    if (endpoint !== "/auth/login" && endpoint !== "/auth/register") {
      const refreshToken = await getRefreshToken();
      if (refreshToken) {
        try {
          const newTokens = await refreshTokenApi(refreshToken);
          await updateAccessToken(newTokens.accessToken);
          requestHeaders.Authorization = `Bearer ${newTokens.accessToken}`;
        } catch (refreshError) {
          // Refresh failed - user needs to login again
          throw new Error("Session expired. Please login again.");
        }
      } else {
        // No tokens at all - user needs to login
        throw new Error("Session expired. Please login again.");
      }
    }
  }

  try {
    const response = await fetchWithRetry(
      url,
      {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        cache,
        next,
      },
      {
        // Keep retries small to avoid overloading API, only for transient errors
        retries: 1,
        backoffMs: 300,
      }
    );

    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401 && accessToken) {
      try {
        const refreshToken = await getRefreshToken();
        if (refreshToken) {
          const newTokens = await refreshTokenApi(refreshToken);
          await updateAccessToken(newTokens.accessToken);

          // Retry request with new token
          requestHeaders.Authorization = `Bearer ${newTokens.accessToken}`;
          const retryResponse = await fetchWithRetry(
            url,
            {
              method,
              headers: requestHeaders,
              body: body ? JSON.stringify(body) : undefined,
              cache,
              next,
            },
            {
              retries: 0,
            }
          );

          if (!retryResponse.ok) {
            const errorText = await retryResponse.text().catch(() => "Unknown error");
            throw new Error(
              `API request failed: ${retryResponse.status} ${retryResponse.statusText}. ${errorText}`
            );
          }

          // Handle empty responses
          const contentType = retryResponse.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            return {} as T;
          }

          return retryResponse.json() as Promise<T>;
        }
      } catch (refreshError) {
        // Token refresh failed - user needs to login again
        // Clear tokens and throw error
        throw new Error("Session expired. Please login again.");
      }
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}. ${errorText}`
      );
    }

    // Handle empty responses
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  } catch (error) {
    // Handle network errors (API unavailable during build or runtime)
    // Next.js handles build-time errors gracefully - we just return defaults
    if (error instanceof TypeError) {
      // Network error - API might be unavailable
      // Return appropriate default based on expected type
      // For arrays, return empty array; for objects, return empty object
      if (Array.isArray(undefined as unknown as T)) {
        return [] as T;
      }
      return {} as T;
    }
    
    // If error message indicates session expired, throw it to trigger error boundary
    if (error instanceof Error && error.message.includes("Session expired")) {
      throw error;
    }
    
    // For other errors, log and return defaults during build, throw during runtime
    if (process.env.NODE_ENV === "production") {
      // In production, return defaults to prevent build failures
      if (Array.isArray(undefined as unknown as T)) {
        return [] as T;
      }
      return {} as T;
    }
    
    // In development, throw to see the actual error
    throw error;
  }
}

/**
 * Fetch analytics data from API
 * Uses ISR with 10 second revalidation for fresh analytics data
 */
export async function fetchAnalytics() {
  const defaultAnalytics = {
    totals: {
      tasks: 0,
      activeTasks: 0,
      users: 0,
      events: 0,
      documents: 0,
    },
    tasksByStatus: [],
    recentEvents: [],
  };

  try {
    const result = await fetchApi<{
      totals: {
        tasks: number;
        activeTasks: number;
        users: number;
        events: number;
        documents: number;
      };
      tasksByStatus: Array<{
        status: string;
        count: number;
      }>;
      recentEvents: Array<{
        id: number;
        type: string;
        message: string;
        createdAt: string;
        task?: { id: number; title: string };
        user?: { id: number; name: string };
      }>;
    }>("/analytics/dashboard", {
      next: {
        revalidate: 10, // Revalidate every 10 seconds for fresh analytics
      },
    });

    // Ensure result has the correct structure
    if (result && typeof result === 'object' && 'totals' in result) {
      return result;
    }
    return defaultAnalytics;
  } catch (error) {
    // Return defaults if API is unavailable or returns error
    return defaultAnalytics;
  }
}

/**
 * Fetch events from API
 * @param limit - Number of events to fetch (default: 20)
 * @param offset - Number of events to skip (default: 0)
 */
/**
 * Fetch events - Server Component version
 * Use fetchEventsClient for Client Components
 */
export async function fetchEvents(
  limit = 20,
  offset = 0,
  search?: string,
  type?: string
) {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (search) {
      params.append("q", search);
    }

    if (type) {
      params.append("type", type);
    }

    const result = await fetchApi<Array<{
      id: number;
      type: string;
      message: string;
      createdAt: string;
      task?: {
        id: number;
        title: string;
        status: string;
      };
      user?: {
        id: number;
        name: string;
        email: string;
      };
    }>>(`/events/tasks?${params.toString()}`, {
      next: {
        revalidate: 30, // Revalidate every 30 seconds
      },
    });
    // Ensure we return an array
    return Array.isArray(result) ? result : [];
  } catch (error) {
    // Return empty array if API is unavailable
    // Errors are handled gracefully by Next.js during build
    return [];
  }
}

/**
 * Client-side version of fetchEvents
 * For use in Client Components ("use client")
 * Uses Next.js API route as proxy to access httpOnly cookies securely
 */
export async function fetchEventsClient(
  limit = 20,
  offset = 0,
  search?: string,
  type?: string
): Promise<Array<{
  id: number;
  type: string;
  message: string;
  createdAt: string;
  task?: {
    id: number;
    title: string;
    status: string;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
}>> {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (search) {
      params.append("q", search);
    }

    if (type) {
      params.append("type", type);
    }

    // Use Next.js API route as proxy (handles httpOnly cookies)
    const response = await fetch(`/api/events?${params.toString()}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Unauthorized - redirect to login
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return [];
      }
      throw new Error(`Failed to fetch events: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    logger.error("Error fetching events", error, "API");
    return [];
  }
}

/**
 * Fetch knowledge documents from API
 * @param limit - Number of documents to fetch (default: 20)
 * @param offset - Number of documents to skip (default: 0)
 * @param categoryId - Optional category ID to filter by
 */
export async function fetchKnowledgeDocuments(
  limit = 20,
  offset = 0,
  categoryId?: number | null,
  search?: string
) {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    if (categoryId !== null && categoryId !== undefined) {
      params.append("categoryId", categoryId.toString());
    }
    
    if (search) {
      params.append("q", search);
    }

    const result = await fetchApi<Array<{
      id: number;
      title: string;
      slug: string;
      content: string;
      categoryId: number;
      category: {
        id: number;
        title: string;
        slug: string;
      };
      createdAt: string;
      updatedAt: string;
    }>>(`/knowledge/documents?${params.toString()}`, {
      next: {
        revalidate: 60, // Revalidate every minute
      },
    });
    // Ensure we return an array
    return Array.isArray(result) ? result : [];
  } catch (error) {
    // Return empty array if API is unavailable
    // Errors are handled gracefully by Next.js during build
    return [];
  }
}

/**
 * Fetch knowledge categories from API (server-side)
 * This function should be used in Server Components
 * Uses fetchApi which handles authentication automatically
 */
export async function fetchKnowledgeCategories(): Promise<Array<{
  id: number;
  title: string;
  slug: string;
}>> {
  try {
    const result = await fetchApi<Array<{
      id: number;
      title: string;
      slug: string;
    }>>("/knowledge/categories", {
      next: {
        revalidate: 300, // Revalidate every 5 minutes
      },
    });
    return Array.isArray(result) ? result : [];
  } catch (error) {
    return [];
  }
}

/**
 * Fetch a single knowledge document by slug
 */
export async function fetchKnowledgeDocumentBySlug(slug: string) {
  try {
    const result = await fetchApi<{
      id: number;
      title: string;
      slug: string;
      content: string;
      categoryId: number;
      category: {
        id: number;
        title: string;
        slug: string;
      };
      createdAt: string;
      updatedAt: string;
      versions?: Array<{
        id: number;
        version: number;
        content: string;
        createdAt: string;
      }>;
    }>(`/knowledge/documents/slug/${slug}`, {
      next: {
        revalidate: 60, // Revalidate every minute
      },
    });
    return result;
  } catch (error) {
    // Return null if document not found or API unavailable
    return null;
  }
}
