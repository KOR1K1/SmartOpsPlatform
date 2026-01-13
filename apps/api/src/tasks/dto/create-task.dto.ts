import { IsString, IsNotEmpty, IsOptional, IsInt, MinLength, MaxLength, IsIn } from "class-validator";

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty({ message: "Title is required" })
  @MinLength(1, { message: "Title must be at least 1 character long" })
  @MaxLength(255, { message: "Title must not exceed 255 characters" })
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(10000, { message: "Description must not exceed 10000 characters" })
  description?: string;

  @IsString()
  @IsOptional()
  @IsIn(["created", "in_progress", "completed", "cancelled"], {
    message: "Status must be one of: created, in_progress, completed, cancelled",
  })
  @MaxLength(50, { message: "Status must not exceed 50 characters" })
  status?: string;

  @IsInt()
  @IsOptional()
  assigneeId?: number | null;
}
