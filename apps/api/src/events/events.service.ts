import { Injectable, Inject } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AppLogger } from "../common/logger/logger.service";
import { TaskEventWhereInput, SystemEventMetadata } from "../common/types";
import { validatePagination, validateSearchQuery, validateStringLength } from "../common/utils/validation.utils";
import { sanitizeSearchQuery, sanitizeString } from "../common/utils/sanitize.util";

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    @Inject(AppLogger) private readonly logger: AppLogger
  ) {}

  async getTaskEvents(limit = 50, offset = 0, q?: string, type?: string) {
    // Validate and sanitize inputs using centralized utilities
    validatePagination({ limit, offset, maxLimit: 500, minLimit: 1 });
    validateSearchQuery({ query: q, maxLength: 200 });
    validateStringLength(type, "type", 50);

    const filters: TaskEventWhereInput = { deletedAt: null };

    const safeType = sanitizeString(type);
    if (safeType) {
      filters.type = safeType;
    }

    const safeQuery = sanitizeSearchQuery(q);
    if (safeQuery) {
      const query = safeQuery;
      const numericMatch = query.match(/\d+/);
      const numericId = numericMatch ? parseInt(numericMatch[0], 10) : null;

      filters.OR = [
        {
          message: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          type: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          task: {
            title: {
              contains: query,
              mode: "insensitive",
            },
          },
        },
        {
          user: {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
        },
      ];

      if (numericId !== null && !Number.isNaN(numericId)) {
        filters.OR.push({ id: numericId });
      }
    }

    return this.prisma.taskEvent.findMany({
      where: filters,
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });
  }

  async getSystemEvents(limit = 50, offset = 0) {
    return this.prisma.systemEvent.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });
  }

  async createSystemEvent(type: string, message: string, metadata?: SystemEventMetadata) {
    return this.prisma.systemEvent.create({
      data: {
        type,
        message,
        metadata,
      },
    });
  }
}
