import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { env } from "./config/env";
import { ValidationPipe } from "@nestjs/common";
import { AppLogger } from "./common/logger/logger.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: false, // Disable default NestJS logger, use our custom logger
  });

  // Get logger instance
  const logger = app.get(AppLogger);
  app.useLogger(logger);

  // CORS configuration
  // Allow requests from both localhost (browser) and container network (internal)
  const allowedOrigins = [
    env.frontendUrl, // Container network URL (http://web:3000)
    "http://localhost:3000", // Browser URL
    "http://127.0.0.1:3000", // Alternative localhost
  ];

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (like mobile apps, Postman, curl)
      if (!origin && env.nodeEnv === "development") {
        return callback(null, true);
      }

      // Validate origin
      if (origin && allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    // Additional CSRF protection headers
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
    exposedHeaders: ["X-Request-ID"],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  await app.listen(env.port);
  logger.log(`🚀 API server is running on port ${env.port}`, "Bootstrap");
  logger.log(`📡 CORS enabled for: ${env.frontendUrl}`, "Bootstrap");
  logger.log(`🌍 Environment: ${env.nodeEnv}`, "Bootstrap");
}

bootstrap();
