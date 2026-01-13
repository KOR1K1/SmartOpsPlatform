import { Injectable, Inject } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AppLogger } from "../common/logger/logger.service";
import { KnowledgeDocumentWhereInput, PaginatedResponse } from "../common/types";
import { validatePagination, validateSearchQuery } from "../common/utils/validation.utils";
import { EntityNotFoundException } from "../common/exceptions/not-found.exception";
import { sanitizeSearchQuery } from "../common/utils/sanitize.util";
import { createPaginatedResponse } from "../common/utils/pagination.util";

@Injectable()
export class KnowledgeService {
  constructor(
    private prisma: PrismaService,
    @Inject(AppLogger) private readonly logger: AppLogger
  ) {}

  async getCategories() {
    return this.prisma.knowledgeCategory.findMany({
      where: { deletedAt: null },
      include: {
        _count: {
          select: {
            documents: {
              where: { deletedAt: null },
            },
          },
        },
      },
    });
  }

  async getDocuments(
    categoryId?: number,
    limit = 50,
    offset = 0,
    q?: string
  ): Promise<PaginatedResponse<any>> {
    // Validate and sanitize inputs using centralized utilities
    validatePagination({ limit, offset, maxLimit: 500, minLimit: 1 });
    validateSearchQuery({ query: q, maxLength: 200 });

    const filters: KnowledgeDocumentWhereInput = {
      deletedAt: null,
      ...(categoryId && { categoryId }),
    };

    const safeQuery = sanitizeSearchQuery(q);
    if (safeQuery) {
      const query = safeQuery;
      const numericMatch = query.match(/\d+/);
      const numericId = numericMatch ? parseInt(numericMatch[0], 10) : null;

      filters.OR = [
        {
          title: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          category: {
            title: {
              contains: query,
              mode: "insensitive",
            },
          },
        },
        {
          slug: {
            contains: query,
            mode: "insensitive",
          },
        },
      ];

      if (numericId !== null && !Number.isNaN(numericId)) {
        filters.OR.push({ id: numericId });
      }
    }

    // Get total count and data in parallel for better performance
    const [data, total] = await Promise.all([
      this.prisma.knowledgeDocument.findMany({
        where: filters,
        include: {
          category: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          _count: {
            select: {
              versions: {
                where: { deletedAt: null },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      this.prisma.knowledgeDocument.count({ where: filters }),
    ]);

    return createPaginatedResponse(data, total, limit, offset);
  }

  async getDocumentById(id: number) {
    const document = await this.prisma.knowledgeDocument.findUnique({
      where: { id, deletedAt: null },
      include: {
        category: true,
        versions: {
          where: { deletedAt: null },
          orderBy: { version: "desc" },
        },
      },
    });

    if (!document) {
      throw new EntityNotFoundException("Document", id, "ID");
    }

    return document;
  }

  async getDocumentBySlug(slug: string) {
    const document = await this.prisma.knowledgeDocument.findUnique({
      where: { slug, deletedAt: null },
      include: {
        category: true,
        versions: {
          where: { deletedAt: null },
          orderBy: { version: "desc" },
          take: 1,
        },
      },
    });

    if (!document) {
      throw new EntityNotFoundException("Document", slug, "slug");
    }

    return document;
  }
}
