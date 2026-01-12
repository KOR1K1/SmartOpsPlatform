import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async getTaskEvents(limit = 50, offset = 0, q?: string, type?: string) {
    const filters: any = { deletedAt: null };

    if (type) {
      filters.type = type;
    }

    if (q) {
      const query = q.trim();
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

  async createSystemEvent(type: string, message: string, metadata?: any) {
    return this.prisma.systemEvent.create({
      data: {
        type,
        message,
        metadata,
      },
    });
  }
}
