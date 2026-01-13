import { Module, Global } from "@nestjs/common";
import { CacheModule as NestCacheModule } from "@nestjs/cache-manager";
import { redisStore } from "cache-manager-redis-yet";
import { env } from "../../config/env";

/**
 * Global cache module with Redis support
 * Provides caching for frequently accessed data
 */
@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      useFactory: async () => {
        const store = await redisStore({
          socket: {
            host: env.redisHost,
            port: env.redisPort,
          },
        });

        return {
          store: () => store,
          ttl: env.redisTtl * 1000, // Default TTL in milliseconds
        };
      },
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheModule {}
