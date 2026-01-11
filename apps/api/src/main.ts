import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { env } from "./config/env";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: env.frontendUrl,
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
