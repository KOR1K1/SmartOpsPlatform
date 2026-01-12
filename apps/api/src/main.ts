import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { env } from "./config/env";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS configuration
  // Allow requests from both localhost (browser) and container network (internal)
  const allowedOrigins = [
    env.frontendUrl, // Container network URL (http://web:3000)
    "http://localhost:3000", // Browser URL
    "http://127.0.0.1:3000", // Alternative localhost
  ];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  await app.listen(env.port);
  console.log(`🚀 API server is running on port ${env.port}`);
  console.log(`📡 CORS enabled for: ${env.frontendUrl}`);
  console.log(`🌍 Environment: ${env.nodeEnv}`);
}

bootstrap();
