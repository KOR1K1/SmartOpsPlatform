import { Controller, Get, Param, ParseIntPipe, UseGuards, Query } from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { PaginationQueryDto } from "../common/dto/pagination-query.dto";

@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles("Admin", "Manager")
  findAll(@Query() pagination: PaginationQueryDto = {}) {
    return this.usersService.findAll(
      pagination.limit || 50,
      pagination.offset || 0
    );
  }

  @Get(":id")
  @Roles("Admin", "Manager")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }
}
