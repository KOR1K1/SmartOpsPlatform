// Shared HTTP utilities for client and server in Next.js
// Adds request timeouts and optional retry with exponential backoff

import { env } from "./env";

const DEFAULT_TIMEOUT_MS =
  typeof env.requestTimeoutMs === "number" ? env.requestTimeoutMs : 10000;

type FetchWithTimeoutInit = RequestInit & {
  timeoutMs?: number;
};

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: FetchWithTimeoutInit = {}
): Promise<Response> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...rest } = init;

  // If timeout is disabled or invalid, fallback to regular fetch
  if (!timeoutMs || timeoutMs <= 0) {
    return fetch(input, rest);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...rest,
      signal: controller.signal,
    });
  } catch (error) {
    // Normalize timeout error message
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timed out");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

function isNetworkOrTimeoutError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    error.name === "AbortError" ||
    message.includes("timed out") ||
    message.includes("network") ||
    message.includes("failed to fetch")
  );
}

interface RetryOptions {
  retries?: number;
  backoffMs?: number;
  timeoutMs?: number;
}

export async function fetchWithRetry(
  input: RequestInfo | URL,
  init: FetchWithTimeoutInit = {},
  options: RetryOptions = {}
): Promise<Response> {
  const { retries = 2, backoffMs = 300, timeoutMs } = options;
  let attempt = 0;
  let lastError: unknown;

  while (attempt <= retries) {
    try {
      return await fetchWithTimeout(input, {
        ...init,
        timeoutMs: timeoutMs ?? init.timeoutMs,
      });
    } catch (error) {
      lastError = error;

      // Only retry on network or timeout errors
      if (!isNetworkOrTimeoutError(error) || attempt === retries) {
        throw error;
      }

      const delayMs = backoffMs * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      attempt += 1;
    }
  }

  // Should be unreachable, but keep for type safety
  throw lastError instanceof Error
    ? lastError
    : new Error("Request failed after retries");
}

