import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { SignOptions } from "jsonwebtoken";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { env } from "../config/env";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Get default User role
    const userRole = await this.prisma.role.findUnique({
      where: { name: "User" },
    });

    if (!userRole) {
      throw new Error("Default User role not found");
    }

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        name: registerDto.name,
        roleId: userRole.id,
      },
      include: { role: true },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role.name);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.name,
      },
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: { role: true },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role.name);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.name,
      },
      ...tokens,
    };
  }

  async refreshToken(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException("User not found");
    }

    return this.generateTokens(user.id, user.email, user.role.name);
  }

  private async generateTokens(userId: number, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: env.jwtSecret,
      expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: env.jwtRefreshSecret,
      expiresIn: env.jwtRefreshExpiresIn as SignOptions["expiresIn"],
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
