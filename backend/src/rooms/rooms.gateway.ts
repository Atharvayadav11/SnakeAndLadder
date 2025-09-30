import { WebSocketGateway,WebSocketServer,OnGatewayConnection,OnGatewayInit,OnGatewayDisconnect, SubscribeMessage } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { RoomsService } from "./rooms.service";
import { GameService } from "src/game/game.service";

@WebSocketGateway({
    cors: {
        origin: '*'
    }
})
export class RoomsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private readonly roomsService: RoomsService) {}



    handleConnection(client: Socket) {
        console.log('client connected: ', client.id);
    }

    handleDisconnect(client: Socket) {
        console.log('client disconnected: ', client.id);
    }

    @SubscribeMessage('createRoom')
    handleCreateRoom(socket: Socket, data: any): void {
        console.log('creating a room for client:',socket.id)

        try{
            const room=this.roomsService.createRoom(data.playerName,data.roomId,data.userId);
             socket.join(data.roomId);
             socket.emit('roomCreated',room);
             console.log('Room created:', data.roomId);
            
        }catch(err){
            console.error('Error creating room:', err);
            socket.emit('error', { message: 'Failed to create room' });
        }
    }

    @SubscribeMessage('joinRoom')
    handleJoinRoom(socket: Socket, data: any): void {
    
        try{
            const { roomId, playerName } = data;
            console.log(`Player ${playerName} joining room: ${roomId}`);

            if (!this.roomsService.getRoomById(roomId)) {
                socket.emit('error', { message: 'Room not found' });
                return;
            }
            const room = this.roomsService.joinRoom(roomId, playerName, socket.id);
            socket.join(roomId);
            socket.emit('roomJoined', room);


        }catch(err){
            console.error('Error joining room:', err);
            socket.emit('error', { message: 'Failed to join room' });
        }
    }

    @SubscribeMessage('selectColor')
    handleSelectColor(socket: Socket, data: any): void {
        try{
            const { roomId, playerId, color } = data;
            console.log(`Player ${playerId} selecting color ${color} in room: ${roomId}`);
            const room = this.roomsService.selectColor(roomId, playerId, color);
            if (!room) {

                socket.emit('error', { message: 'Room not found or color not available' });
                return;
            }
            this.server.to(roomId).emit('colorSelected', { playerId, color });

        }catch(err){
            console.error('Error selecting color:', err);
            socket.emit('error', { message: 'Failed to select color' });
        }

       
    }

     @SubscribeMessage('userDisconnected')
        handleUserDisconnected(socket: Socket, data: any): void {
            try {
                const { roomId, playerId } = data;
                console.log(`Player ${playerId} disconnecting from room: ${roomId}`);
                const room = this.roomsService.handleUserDisconnect(roomId, playerId);
                if (!room) {
                    socket.emit('error', { message: 'Room not found' });
                    return;
                }
                this.server.to(roomId).emit('userDisconnected', { playerId });

            } catch (err) {
                console.error('Error disconnecting user:', err);
                socket.emit('error', { message: 'Failed to disconnect user' });
            }

        }   

}