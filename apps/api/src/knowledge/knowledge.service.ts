import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class KnowledgeService {
  constructor(private prisma: PrismaService) {}

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
