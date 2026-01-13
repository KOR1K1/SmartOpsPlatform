import { IsOptional, IsInt, Min, Max, IsString, MaxLength } from "class-validator";
import { Type } from "class-transformer";

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "Limit must be an integer" })
  @Min(1, { message: "Limit must be at least 1" })
  @Max(500, { message: "Limit must not exceed 500" })
  limit?: number = 50;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "Offset must be an integer" })
  @Min(0, { message: "Offset must be at least 0" })
  offset?: number = 0;
}

export class SearchQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: "Search query must not exceed 200 characters" })
  q?: string;
}

export class KnowledgeDocumentsQueryDto extends SearchQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "categoryId must be an integer" })
  @Min(1, { message: "categoryId must be at least 1" })
  categoryId?: number;
}

export class EventsQueryDto extends SearchQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: "Event type must not exceed 50 characters" })
  type?: string;
}
