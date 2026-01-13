/**
 * Environment configuration
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

function getEnvNumber(key: string, defaultValue?: number): number {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(
      `Missing required environment variable: ${key}. Please set it in .env file or environment.`
    );
  }
  return value ? parseInt(value, 10) : defaultValue!;
}

type NodeEnv = "development" | "production" | "test";

interface EnvConfig {
  readonly databaseUrl: string;
  readonly port: number;
  readonly nodeEnv: NodeEnv;
  readonly frontendUrl: string;
  readonly requestTimeoutMs: number;
  readonly jwtSecret: string;
  readonly jwtExpiresIn: string;
  readonly jwtRefreshSecret: string;
  readonly jwtRefreshExpiresIn: string;
}

export const env: EnvConfig = {
  // Database
  databaseUrl: getEnv("DATABASE_URL"),

  // Server
  port: getEnvNumber("PORT", 4000),
  nodeEnv: getEnv("NODE_ENV", "development") as NodeEnv,

  // CORS
  frontendUrl: getEnv("FRONTEND_URL", "http://localhost:3000"),

  // HTTP
  requestTimeoutMs: getEnvNumber("REQUEST_TIMEOUT_MS", 10000),

  // JWT
  jwtSecret: getEnv("JWT_SECRET"),
  jwtExpiresIn: getEnv("JWT_EXPIRES_IN", "15m"),
  jwtRefreshSecret: getEnv("JWT_REFRESH_SECRET"),
  jwtRefreshExpiresIn: getEnv("JWT_REFRESH_EXPIRES_IN", "7d"),
};
