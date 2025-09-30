import { WebSocketGateway,WebSocketServer,OnGatewayConnection,OnGatewayInit,OnGatewayDisconnect, SubscribeMessage } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { RoomsService } from "./rooms.service";
import { Room } from "./rooms.model";
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
             socket.join(room.id);
             socket.emit('roomCreated',room);
             console.log('Room created:', room.id);
            
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
            if()

        }catch(err){
            console.error('Error joining room:', err);
            socket.emit('error', { message: 'Failed to join room' });
        }
    }
}