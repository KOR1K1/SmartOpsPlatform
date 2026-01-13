import { IsEmail, IsString, MinLength, MaxLength } from "class-validator";

export class LoginDto {
  @IsEmail()
  @MaxLength(255, { message: "Email must not exceed 255 characters" })
  email: string;

  @IsString()
  @MinLength(1, { message: "Password is required" })
  @MaxLength(100, { message: "Password must not exceed 100 characters" })
  password: string;
}
