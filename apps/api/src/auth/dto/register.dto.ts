import { IsEmail, IsString, MinLength, MaxLength, IsNotEmpty } from "class-validator";

export class RegisterDto {
  @IsEmail()
  @MaxLength(255, { message: "Email must not exceed 255 characters" })
  email: string;

  @IsString()
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  @MaxLength(100, { message: "Password must not exceed 100 characters" })
  password: string;

  @IsString()
  @IsNotEmpty({ message: "Name is required" })
  @MinLength(2, { message: "Name must be at least 2 characters long" })
  @MaxLength(100, { message: "Name must not exceed 100 characters" })
  name: string;
}
