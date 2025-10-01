import { 
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { RoomsService } from "./rooms.service";

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RoomsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private roomsService: RoomsService) {}

  handleConnection(client: Socket) {
    console.log('client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('client disconnected:', client.id);
  }

  @SubscribeMessage('createRoom')
  handleCreateRoom(
    @MessageBody() data: { playerName: string; roomId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ): void {
    try {
      const room = this.roomsService.createRoom(data.playerName, data.roomId, data.userId);
      client.join(data.roomId);
      client.emit('roomCreated', room); // emit back to creator
      console.log('Room created:', data.roomId);

      // notify others in lobby if you want
      // this.server.emit('newRoomAvailable', { roomId: data.roomId });
    } catch (err) {
      console.error('Error creating room:', err);
      client.emit('error', { message: 'Failed to create room' });
    }
  }

  // ---------------- JOIN ROOM ----------------
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { roomId: string; playerName: string },
    @ConnectedSocket() client: Socket,
  ): void {
    try {
      const { roomId, playerName } = data;
      console.log(`Player ${playerName} joining room: ${roomId}`);

      if (!this.roomsService.getRoomById(roomId)) {
        client.emit('error', { message: 'Room not found' });
        return;
      }

      const room = this.roomsService.joinRoom(roomId, playerName, client.id);
      client.join(roomId);

      // Send room info to joining player
      client.emit('roomJoined', room);

      // Notify others in the room
      this.server.to(roomId).emit('playerJoined', { playerName, playerId: client.id });
    } catch (err) {
      console.error('Error joining room:', err);
      client.emit('error', { message: 'Failed to join room' });
    }
  }

  // ---------------- SELECT COLOR ----------------
  @SubscribeMessage('selectColor')
  handleSelectColor(
    @MessageBody() data: { roomId: string; playerId: string; color: string },
    @ConnectedSocket() client: Socket,
  ): void {
    try {
      const { roomId, playerId, color } = data;
      console.log(`Player ${playerId} selecting color ${color} in room: ${roomId}`);

      const room = this.roomsService.selectColor(roomId, playerId, color);
      if (!room) {
        client.emit('error', { message: 'Room not found or color not available' });
        return;
      }

      // broadcast to everyone in the room
      this.server.to(roomId).emit('colorSelected', { playerId, color });
    } catch (err) {
      console.error('Error selecting color:', err);
      client.emit('error', { message: 'Failed to select color' });
    }
  }

  // ---------------- USER DISCONNECTED ----------------
  @SubscribeMessage('userDisconnected')
  handleUserDisconnected(
    @MessageBody() data: { roomId: string; playerId: string },
    @ConnectedSocket() client: Socket,
  ): void {
    try {
      const { roomId, playerId } = data;
      console.log(`Player ${playerId} disconnecting from room: ${roomId}`);

      const room = this.roomsService.handleUserDisconnect(roomId, playerId);
      if (!room) {
        client.emit('error', { message: 'Room not found' });
        return;
      }

      this.server.to(roomId).emit('userDisconnected', { playerId });
    } catch (err) {
      console.error('Error disconnecting user:', err);
      client.emit('error', { message: 'Failed to disconnect user' });
    }
  }
}
