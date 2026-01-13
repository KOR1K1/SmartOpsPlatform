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
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { Public } from "../common/decorators/public.decorator";
import { JwtRefreshGuard } from "./guards/jwt-refresh.guard";
import { AppLogger } from "../common/logger/logger.service";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(AppLogger) private readonly logger: AppLogger
  ) {}

  @Public()
  @Post("register")
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(@Request() req: any, @Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(req.user.userId);
  }
}
