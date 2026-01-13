import {
  Controller,
  Get,
  Query,
  UseGuards,
  Inject,
} from "@nestjs/common";
import { EventsService } from "./events.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { EventsQueryDto, PaginationQueryDto } from "../common/dto/pagination-query.dto";
import { AppLogger } from "../common/logger/logger.service";

@Controller("events")
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    @Inject(AppLogger) private readonly logger: AppLogger
  ) {}

  @Get("tasks")
  getTaskEvents(@Query() query: EventsQueryDto) {
    // Sanitize search query (validation is done by DTO)
    const searchQuery = query.q?.trim();
    const eventType = query.type?.trim();

    return this.eventsService.getTaskEvents(
      query.limit || 50,
      query.offset || 0,
      searchQuery,
      eventType
    );
  }

  @Get("system")
  getSystemEvents(@Query() query: PaginationQueryDto) {
    return this.eventsService.getSystemEvents(query.limit || 50, query.offset || 0);
  }
}
