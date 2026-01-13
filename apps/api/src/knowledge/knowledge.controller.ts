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
import { KnowledgeDocumentsQueryDto } from "../common/dto/pagination-query.dto";
import { AppLogger } from "../common/logger/logger.service";
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
    @Query() query: KnowledgeDocumentsQueryDto = {}
  ) {
    // Sanitize search query (validation is done by DTO)
    const searchQuery = query.q?.trim();

    // Ensure limit and offset are valid numbers
    const limit = query.limit && query.limit > 0 ? query.limit : 50;
    const offset = query.offset && query.offset >= 0 ? query.offset : 0;

    return this.knowledgeService.getDocuments(
      query.categoryId,
      limit,
      offset,
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
