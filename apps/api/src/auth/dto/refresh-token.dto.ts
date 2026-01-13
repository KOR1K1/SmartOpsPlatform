import { IsString, IsNotEmpty, MaxLength } from "class-validator";

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty({ message: "Refresh token is required" })
  @MaxLength(500, { message: "Refresh token must not exceed 500 characters" })
  refreshToken: string;
}
