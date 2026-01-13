import {
  Injectable,
  Inject,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { SignOptions } from "jsonwebtoken";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { env } from "../config/env";
import { AppLogger } from "../common/logger/logger.service";
import { ResourceConflictException } from "../common/exceptions/conflict.exception";
import { InvalidCredentialsException, UserNotFoundException } from "../common/exceptions/unauthorized.exception";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    @Inject(AppLogger) private readonly logger: AppLogger
  ) {}

  async register(registerDto: RegisterDto) {
    this.logger.debug(`Registration attempt for email: ${registerDto.email}`, "AuthService");
    
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      this.logger.warn(`Registration failed: email already exists - ${registerDto.email}`, "AuthService");
      throw new ResourceConflictException("User", "email", registerDto.email);
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

    this.logger.log(`User registered successfully: ${user.email} (ID: ${user.id})`, "AuthService");

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
    this.logger.debug(`Login attempt for email: ${loginDto.email}`, "AuthService");
    
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: { role: true },
    });

    if (!user || user.deletedAt) {
      this.logger.warn(`Login failed: user not found or deleted - ${loginDto.email}`, "AuthService");
      throw new InvalidCredentialsException();
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password
    );

    if (!isPasswordValid) {
      this.logger.warn(`Login failed: invalid password - ${loginDto.email}`, "AuthService");
      throw new InvalidCredentialsException();
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role.name);

    this.logger.log(`User logged in successfully: ${user.email} (ID: ${user.id})`, "AuthService");

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
    this.logger.debug(`Token refresh request for user ID: ${userId}`, "AuthService");
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user || user.deletedAt) {
      this.logger.warn(`Token refresh failed: user not found or deleted - ID: ${userId}`, "AuthService");
      throw new UserNotFoundException();
    }

    this.logger.debug(`Token refreshed successfully for user ID: ${userId}`, "AuthService");
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
