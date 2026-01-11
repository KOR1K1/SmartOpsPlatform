import {
  WebSocketGateway as WSGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";
import { EventsService } from "../events/events.service";

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

  private logger: Logger = new Logger("WebSocketGateway");

  constructor(private eventsService: EventsService) {}

  afterInit(server: Server) {
    this.logger.log("WebSocket Gateway initialized");
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    // Send initial events
    this.sendRecentEvents(client);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage("subscribe:events")
  handleSubscribeEvents(client: Socket) {
    this.logger.log(`Client ${client.id} subscribed to events`);
    this.sendRecentEvents(client);
  }

  @SubscribeMessage("subscribe:system-events")
  handleSubscribeSystemEvents(client: Socket) {
    this.logger.log(`Client ${client.id} subscribed to system events`);
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
  broadcastTaskEvent(event: any) {
    this.server.emit("task-event", event);
  }

  // Broadcast new system event to all connected clients
  broadcastSystemEvent(event: any) {
    this.server.emit("system-event", event);
  }
}
