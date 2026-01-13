/**
 * Environment configuration with comprehensive validation
 * All environment variables are validated on startup with fail-fast error messages
 * Provides clear, actionable error messages for configuration issues
 */

/**
 * Get environment variable with validation
 */
function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(
      `❌ Missing required environment variable: ${key}\n` +
      `   Please set it in .env file or environment variables.\n` +
      `   Example: ${key}=your-value-here`
    );
  }
  return value || defaultValue!;
}

/**
 * Get and validate numeric environment variable
 */
function getEnvNumber(
  key: string, 
  defaultValue?: number,
  options?: { min?: number; max?: number }
): number {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(
      `❌ Missing required environment variable: ${key}\n` +
      `   Please set it in .env file or environment variables.\n` +
      `   Example: ${key}=${defaultValue ?? 100}`
    );
  }
  
  if (!value && defaultValue !== undefined) {
    return defaultValue;
  }

  const numValue = parseInt(value!, 10);
  if (isNaN(numValue)) {
    throw new Error(
      `❌ Invalid environment variable: ${key}\n` +
      `   Expected a number, but got: "${value}"\n` +
      `   Please provide a valid numeric value.\n` +
      `   Example: ${key}=${defaultValue ?? 100}`
    );
  }

  if (options?.min !== undefined && numValue < options.min) {
    throw new Error(
      `❌ Invalid environment variable: ${key}\n` +
      `   Value ${numValue} is less than minimum ${options.min}.\n` +
      `   Please provide a value >= ${options.min}.\n` +
      `   Current: ${key}=${numValue}`
    );
  }

  if (options?.max !== undefined && numValue > options.max) {
    throw new Error(
      `❌ Invalid environment variable: ${key}\n` +
      `   Value ${numValue} is greater than maximum ${options.max}.\n` +
      `   Please provide a value <= ${options.max}.\n` +
      `   Current: ${key}=${numValue}`
    );
  }

  return numValue;
}

/**
 * Validate URL format
 */
function validateUrl(key: string, value: string, protocols: string[] = ["http:", "https:", "postgresql:"]): string {
  try {
    const url = new URL(value);
    if (!protocols.includes(url.protocol)) {
      throw new Error(`Protocol ${url.protocol} is not allowed`);
    }
    return value;
  } catch (error) {
    throw new Error(
      `❌ Invalid URL format for environment variable: ${key}\n` +
      `   Value: "${value}"\n` +
      `   Expected format: ${protocols.join(" or ")}://host:port/path\n` +
      `   Example: ${key}=${protocols[0]}//localhost:5432/database`
    );
  }
}

/**
 * Validate body parser limit format (e.g., "1mb", "500kb")
 */
function validateBodyParserLimit(key: string, value: string): string {
  const limitRegex = /^\d+(kb|mb|gb)$/i;
  if (!limitRegex.test(value)) {
    throw new Error(
      `❌ Invalid body parser limit format for: ${key}\n` +
      `   Value: "${value}"\n` +
      `   Expected format: number followed by unit (kb, mb, or gb)\n` +
      `   Examples: "1mb", "500kb", "10mb"\n` +
      `   Current: ${key}=${value}`
    );
  }
  return value;
}

/**
 * Validate JWT secret strength
 */
function validateJwtSecret(key: string, value: string): string {
  const minLength = 32;
  const isDefault = value.includes("change-in-production") || value.includes("your-secret");
  
  if (isDefault) {
    throw new Error(
      `❌ Security warning: ${key} appears to be using a default/placeholder value\n` +
      `   Value contains "change-in-production" or "your-secret"\n` +
      `   Please generate a strong secret for production:\n` +
      `   Linux/Mac: openssl rand -base64 32\n` +
      `   Windows: [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))\n` +
      `   Current: ${key}=${value.substring(0, 20)}...`
    );
  }

  if (value.length < minLength) {
    throw new Error(
      `❌ Security warning: ${key} is too short (${value.length} chars, minimum ${minLength})\n` +
      `   Please generate a stronger secret:\n` +
      `   Linux/Mac: openssl rand -base64 32\n` +
      `   Windows: [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))`
    );
  }

  return value;
}

type NodeEnv = "development" | "production" | "test";

interface EnvConfig {
  readonly databaseUrl: string;
  readonly dbPoolMax: number;
  readonly dbPoolIdleMs: number;
  readonly dbPoolTimeoutMs: number;
  readonly port: number;
  readonly nodeEnv: NodeEnv;
  readonly frontendUrl: string;
  readonly requestTimeoutMs: number;
  readonly bodyParserJsonLimit: string;
  readonly bodyParserUrlencodedLimit: string;
  readonly jwtSecret: string;
  readonly jwtExpiresIn: string;
  readonly jwtRefreshSecret: string;
  readonly jwtRefreshExpiresIn: string;
}

// Validate NODE_ENV
function validateNodeEnv(value: string): NodeEnv {
  const validEnvs: NodeEnv[] = ["development", "production", "test"];
  if (!validEnvs.includes(value as NodeEnv)) {
    throw new Error(
      `❌ Invalid NODE_ENV value: "${value}"\n` +
      `   Valid values: ${validEnvs.join(", ")}\n` +
      `   Current: NODE_ENV=${value}`
    );
  }
  return value as NodeEnv;
}

export const env: EnvConfig = {
  // Database
  databaseUrl: validateUrl("DATABASE_URL", getEnv("DATABASE_URL"), ["postgresql:"]),
  dbPoolMax: getEnvNumber("DB_POOL_MAX", 10, { min: 1, max: 100 }),
  dbPoolIdleMs: getEnvNumber("DB_POOL_IDLE_MS", 30000, { min: 1000, max: 300000 }),
  dbPoolTimeoutMs: getEnvNumber("DB_POOL_TIMEOUT_MS", 5000, { min: 1000, max: 60000 }),

  // Server
  port: getEnvNumber("PORT", 4000, { min: 1, max: 65535 }),
  nodeEnv: validateNodeEnv(getEnv("NODE_ENV", "development")),

  // CORS
  frontendUrl: validateUrl("FRONTEND_URL", getEnv("FRONTEND_URL", "http://localhost:3000"), ["http:", "https:"]),

  // HTTP
  requestTimeoutMs: getEnvNumber("REQUEST_TIMEOUT_MS", 10000, { min: 1000, max: 300000 }),

  // Body Parser Limits (for DoS protection)
  // JSON body limit: default 1MB (reasonable for API requests)
  bodyParserJsonLimit: validateBodyParserLimit("BODY_PARSER_JSON_LIMIT", getEnv("BODY_PARSER_JSON_LIMIT", "1mb")),
  // URL-encoded body limit: default 1MB (for form submissions)
  bodyParserUrlencodedLimit: validateBodyParserLimit("BODY_PARSER_URLENCODED_LIMIT", getEnv("BODY_PARSER_URLENCODED_LIMIT", "1mb")),

  // JWT
  jwtSecret: validateJwtSecret("JWT_SECRET", getEnv("JWT_SECRET")),
  jwtExpiresIn: getEnv("JWT_EXPIRES_IN", "15m"), // Format validated by @nestjs/jwt
  jwtRefreshSecret: validateJwtSecret("JWT_REFRESH_SECRET", getEnv("JWT_REFRESH_SECRET")),
  jwtRefreshExpiresIn: getEnv("JWT_REFRESH_EXPIRES_IN", "7d"), // Format validated by @nestjs/jwt
};

// Log validation success in development
if (env.nodeEnv === "development") {
  console.log("✅ Environment variables validated successfully");
}
