import { Injectable, NotFoundException, BadRequestException, Inject } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AppLogger } from "../common/logger/logger.service";

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

  async getDocuments(categoryId?: number, limit = 50, offset = 0, q?: string) {
    // Validate and sanitize inputs
    if (q && q.length > 200) {
      throw new BadRequestException("Search query must not exceed 200 characters");
    }
    if (limit > 500) {
      throw new BadRequestException("Limit must not exceed 500");
    }
    if (limit < 1) {
      throw new BadRequestException("Limit must be at least 1");
    }
    if (offset < 0) {
      throw new BadRequestException("Offset must be non-negative");
    }

    const filters: any = {
      deletedAt: null,
      ...(categoryId && { categoryId }),
    };

    if (q) {
      const query = q.trim();
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

    return this.prisma.knowledgeDocument.findMany({
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
    });
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
      throw new NotFoundException(`Document with ID ${id} not found`);
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
      throw new NotFoundException(`Document with slug ${slug} not found`);
    }

    return document;
  }
}
