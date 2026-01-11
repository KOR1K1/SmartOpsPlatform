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

  async getDocuments(categoryId?: number, limit = 50, offset = 0) {
    return this.prisma.knowledgeDocument.findMany({
      where: {
        deletedAt: null,
        ...(categoryId && { categoryId }),
      },
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
