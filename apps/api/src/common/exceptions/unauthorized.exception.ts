import { UnauthorizedException } from "@nestjs/common";

/**
 * Custom exception for authentication errors
 * Provides consistent error messages without exposing sensitive information
 */
export class AuthenticationException extends UnauthorizedException {
  constructor(message: string = "Invalid credentials") {
    super({
      message,
      error: "Unauthorized",
      statusCode: 401,
    });
  }
}

/**
 * Exception for user not found during authentication
 */
export class UserNotFoundException extends AuthenticationException {
  constructor() {
    super("User not found");
  }
}

/**
 * Exception for invalid credentials
 */
export class InvalidCredentialsException extends AuthenticationException {
  constructor() {
    super("Invalid credentials");
  }
}
