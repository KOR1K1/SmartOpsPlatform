import { Module } from "@nestjs/common";
import { APP_GUARD, APP_FILTER } from "@nestjs/core";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { EventsModule } from "./events/events.module";
import { AnalyticsModule } from "./analytics/analytics.module";
import { KnowledgeModule } from "./knowledge/knowledge.module";
import { WebSocketModule } from "./websocket/websocket.module";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    EventsModule,
    AnalyticsModule,
    KnowledgeModule,
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
  ],
})
export class AppModule {}
