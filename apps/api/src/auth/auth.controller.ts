import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
  Inject,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { Public } from "../common/decorators/public.decorator";
import { JwtRefreshGuard } from "./guards/jwt-refresh.guard";
import { AppLogger } from "../common/logger/logger.service";
import { AuthenticatedRequest } from "../common/types";

/**
 * Auth Controller with strict rate limiting
 * 
 * Rate limits:
 * - Login: 5 requests per minute (brute force protection)
 * - Register: 3 requests per minute (prevent spam)
 * - Refresh: 10 requests per minute (normal usage)
 * - Controller default: 5 requests per minute
 */
@Controller("auth")
@Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute for all auth endpoints
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(AppLogger) private readonly logger: AppLogger
  ) {}

  @Public()
  @Post("register")
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 requests per minute - prevent spam registrations
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute - brute force protection
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute - normal token refresh usage
  async refresh(@Request() req: AuthenticatedRequest, @Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(req.user.userId);
  }
}
