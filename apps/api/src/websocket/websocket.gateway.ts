import {
  WebSocketGateway as WSGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Inject } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { EventsService } from "../events/events.service";
import { AppLogger } from "../common/logger/logger.service";
import { TaskEventData, SystemEventData } from "../common/types";

@WSGateway({
  cors: {
    origin: "*", // Configure based on env in production
    credentials: true,
  },
})
export class WebSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private eventsService: EventsService,
    @Inject(AppLogger) private readonly logger: AppLogger
  ) {}

  afterInit(server: Server) {
    this.logger.log("WebSocket Gateway initialized", "WebSocketGateway");
  }

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected: ${client.id}`, "WebSocketGateway");
    // Send initial events
    this.sendRecentEvents(client);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}`, "WebSocketGateway");
  }

  @SubscribeMessage("subscribe:events")
  handleSubscribeEvents(client: Socket) {
    this.logger.debug(`Client ${client.id} subscribed to events`, "WebSocketGateway");
    this.sendRecentEvents(client);
  }

  @SubscribeMessage("subscribe:system-events")
  handleSubscribeSystemEvents(client: Socket) {
    this.logger.debug(`Client ${client.id} subscribed to system events`, "WebSocketGateway");
    this.sendRecentSystemEvents(client);
  }

  async sendRecentEvents(client: Socket) {
    const events = await this.eventsService.getTaskEvents(20, 0);
    client.emit("events", events);
  }

  async sendRecentSystemEvents(client: Socket) {
    const events = await this.eventsService.getSystemEvents(20, 0);
    client.emit("system-events", events);
  }

  // Broadcast new task event to all connected clients
  broadcastTaskEvent(event: TaskEventData) {
    this.server.emit("task-event", event);
  }

  // Broadcast new system event to all connected clients
  broadcastSystemEvent(event: SystemEventData) {
    this.server.emit("system-event", event);
  }
}
