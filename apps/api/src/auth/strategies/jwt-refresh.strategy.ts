import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { env } from "../../config/env";
import { PrismaService } from "../../prisma/prisma.service";
import { JwtPayload, AuthenticatedUser } from "../../common/types";
import { UserNotFoundException } from "../../common/exceptions/unauthorized.exception";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  "jwt-refresh"
) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField("refreshToken"),
      ignoreExpiration: false,
      secretOrKey: env.jwtRefreshSecret,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    });

    if (!user || user.deletedAt) {
      throw new UserNotFoundException();
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role.name,
      roleId: user.roleId,
    };
  }
}
