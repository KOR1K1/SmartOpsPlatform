/**
 * Environment configuration for Next.js
 * Public variables (NEXT_PUBLIC_*) are exposed to the browser
 * All environment variables must be set - no hardcoded fallbacks for Docker compatibility
 */

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(
      `Missing required environment variable: ${key}. Please set it in .env file or environment.`
    );
  }
  return value || defaultValue!;
}

// Determine if we're running on server or client
const isServer = typeof window === "undefined";

export const env = {
  // API URL - use internal Docker service name for Server Components, public URL for Client Components
  // In client components (browser), only NEXT_PUBLIC_* vars are available
  // In server components, prefer API_URL (internal Docker network) for better performance
  apiUrl: isServer
    ? (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000")
    : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"),

  // App URL (public - for metadata, sitemap, etc.)
  appUrl: getEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),

  // Environment
  nodeEnv: getEnv("NODE_ENV", "development"),
  // Request timeout for frontend HTTP requests (in milliseconds)
  requestTimeoutMs: Number(process.env.NEXT_PUBLIC_REQUEST_TIMEOUT_MS || "10000"),
} as const;
