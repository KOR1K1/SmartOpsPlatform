import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { EventsModule } from "./events/events.module";
import { AnalyticsModule } from "./analytics/analytics.module";
import { KnowledgeModule } from "./knowledge/knowledge.module";
import { TasksModule } from "./tasks/tasks.module";
import { WebSocketModule } from "./websocket/websocket.module";
import { LoggerModule } from "./common/logger/logger.module";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { RequestIdMiddleware } from "./common/middleware/request-id.middleware";
import { CsrfMiddleware } from "./common/middleware/csrf.middleware";
import { TimeoutInterceptor } from "./common/interceptors/timeout.interceptor";

@Module({
  imports: [
    LoggerModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    EventsModule,
    AnalyticsModule,
    KnowledgeModule,
    TasksModule,
    WebSocketModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply middleware in order:
    // 1. RequestIdMiddleware - must be first to generate request ID
    // 2. CsrfMiddleware - validates Origin for state-changing requests
    consumer
      .apply(RequestIdMiddleware, CsrfMiddleware)
      .forRoutes("*");
  }
}
