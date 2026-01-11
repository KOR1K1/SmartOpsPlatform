import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
} from "@nestjs/common";
import { EventsService } from "./events.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("events")
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get("tasks")
  getTaskEvents(
    @Query("limit", new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query("offset", new DefaultValuePipe(0), ParseIntPipe) offset: number
  ) {
    return this.eventsService.getTaskEvents(limit, offset);
  }

  @Get("system")
  getSystemEvents(
    @Query("limit", new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query("offset", new DefaultValuePipe(0), ParseIntPipe) offset: number
  ) {
    return this.eventsService.getSystemEvents(limit, offset);
  }
}
