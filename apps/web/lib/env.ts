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

export const env = {
  // API URL (public - exposed to browser)
  apiUrl: getEnv("NEXT_PUBLIC_API_URL", "http://localhost:4000"),

  // App URL (public - for metadata, sitemap, etc.)
  appUrl: getEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),

  // Environment
  nodeEnv: getEnv("NODE_ENV", "development"),
} as const;
