import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
} from "@nestjs/common";
import { KnowledgeService } from "./knowledge.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("knowledge")
@UseGuards(JwtAuthGuard)
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get("categories")
  getCategories() {
    return this.knowledgeService.getCategories();
  }

  @Get("documents")
  getDocuments(
    @Query("categoryId", new DefaultValuePipe(undefined), ParseIntPipe)
    categoryId?: number,
    @Query("limit", new DefaultValuePipe(50), ParseIntPipe) limit?: number,
    @Query("offset", new DefaultValuePipe(0), ParseIntPipe) offset?: number
  ) {
    return this.knowledgeService.getDocuments(categoryId, limit, offset);
  }

  @Get("documents/:id")
  getDocumentById(@Param("id", ParseIntPipe) id: number) {
    return this.knowledgeService.getDocumentById(id);
  }

  @Get("documents/slug/:slug")
  getDocumentBySlug(@Param("slug") slug: string) {
    return this.knowledgeService.getDocumentBySlug(slug);
  }
}
