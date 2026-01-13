import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Inject,
} from "@nestjs/common";
import { KnowledgeService } from "./knowledge.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { SearchQueryDto } from "../common/dto/pagination-query.dto";
import { AppLogger } from "../common/logger/logger.service";
import { ValidationException } from "../common/exceptions/validation.exception";
import { validateStringLength } from "../common/utils/validation.utils";

@Controller("knowledge")
@UseGuards(JwtAuthGuard)
export class KnowledgeController {
  constructor(
    private readonly knowledgeService: KnowledgeService,
    @Inject(AppLogger) private readonly logger: AppLogger
  ) {}

  @Get("categories")
  getCategories() {
    return this.knowledgeService.getCategories();
  }

  @Get("documents")
  getDocuments(
    @Query("categoryId") categoryId?: string,
    @Query() pagination: SearchQueryDto = {}
  ) {
    // Validate categoryId
    let parsedCategoryId: number | undefined;
    if (categoryId) {
      const parsed = parseInt(categoryId, 10);
      if (isNaN(parsed)) {
        throw new ValidationException("categoryId must be a valid number", "categoryId");
      }
      parsedCategoryId = parsed;
    }

    // Sanitize search query (validation is done by DTO)
    const searchQuery = pagination.q?.trim();

    return this.knowledgeService.getDocuments(
      parsedCategoryId,
      pagination.limit || 50,
      pagination.offset || 0,
      searchQuery
    );
  }

  @Get("documents/:id")
  getDocumentById(@Param("id", ParseIntPipe) id: number) {
    return this.knowledgeService.getDocumentById(id);
  }

  @Get("documents/slug/:slug")
  getDocumentBySlug(@Param("slug") slug: string) {
    // Validate slug length (typical slug max length is 255)
    validateStringLength(slug, "slug", 255, 1);
    return this.knowledgeService.getDocumentBySlug(slug);
  }
}
