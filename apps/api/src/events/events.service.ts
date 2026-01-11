import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async getTaskEvents(limit = 50, offset = 0) {
    return this.prisma.taskEvent.findMany({
      where: { deletedAt: null },
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
