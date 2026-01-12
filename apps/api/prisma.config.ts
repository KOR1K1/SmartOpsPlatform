// Prisma 7 configuration
// Note: Prisma 7 does not automatically load .env files
// Environment variables must be available in process.env
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Read DATABASE_URL from environment variables
    // In Docker, this is set via docker-compose.yml
    url: env("DATABASE_URL"),
  },
  migrations: {
    path: "prisma/migrations",
  },
});
