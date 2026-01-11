import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import type { SignOptions } from "jsonwebtoken";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { JwtRefreshStrategy } from "./strategies/jwt-refresh.strategy";
import { PrismaModule } from "../prisma/prisma.module";
import { env } from "../config/env";

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: env.jwtSecret,
      signOptions: {
        expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy],
  exports: [AuthService],
})
export class AuthModule {}
