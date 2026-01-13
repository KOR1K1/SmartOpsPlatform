import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { EntityNotFoundException } from "../common/exceptions/not-found.exception";
import { PaginatedResponse } from "../common/types";
import { validatePagination } from "../common/utils/validation.utils";
import { createPaginatedResponse } from "../common/utils/pagination.util";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(limit = 50, offset = 0): Promise<PaginatedResponse<any>> {
    // Validate pagination
    validatePagination({ limit, offset, maxLimit: 500, minLimit: 1 });

    const filters = { deletedAt: null };

    // Get total count and data in parallel for better performance
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where: filters,
        select: {
          id: true,
          email: true,
          name: true,
          role: {
            select: {
              id: true,
              name: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      this.prisma.user.count({ where: filters }),
    ]);

    return createPaginatedResponse(data, total, limit, offset);
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
      include: { role: true },
    });

    if (!user) {
      throw new EntityNotFoundException("User", id, "ID");
    }

    const { password, ...result } = user;
    return result;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email, deletedAt: null },
      include: { role: true },
    });
  }
}
