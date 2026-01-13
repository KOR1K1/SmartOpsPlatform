import { IsEmail, IsString, MinLength, MaxLength, IsNotEmpty, Matches } from "class-validator";

export class RegisterDto {
  @IsEmail()
  @MaxLength(255, { message: "Email must not exceed 255 characters" })
  email: string;

  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @MaxLength(100, { message: "Password must not exceed 100 characters" })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/,
    {
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#)",
    }
  )
  password: string;

  @IsString()
  @IsNotEmpty({ message: "Name is required" })
  @MinLength(2, { message: "Name must be at least 2 characters long" })
  @MaxLength(100, { message: "Name must not exceed 100 characters" })
  name: string;
}
