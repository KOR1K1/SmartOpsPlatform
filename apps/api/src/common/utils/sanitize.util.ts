/**
 * Simple sanitization utilities for user input.
 * These helpers remove control characters and dangerous HTML characters
 * to reduce the risk of XSS and log pollution.
 */

export function sanitizeString(input: string | undefined | null): string {
  if (input === undefined || input === null) {
    return "";
  }

  return input
    .toString()
    // Remove control characters
    .replace(/[\u0000-\u001F\u007F]+/g, "")
    // Remove angle brackets to avoid accidental HTML injection
    .replace(/[<>]/g, "")
    .trim();
}

export function sanitizeSearchQuery(
  input: string | undefined | null
): string | undefined {
  const value = sanitizeString(input);
  return value.length > 0 ? value : undefined;
}

