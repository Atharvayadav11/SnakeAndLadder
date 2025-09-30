import { WebSocketGateway,WebSocketServer,OnGatewayConnection,OnGatewayInit,OnGatewayDisconnect, SubscribeMessage } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { RoomsService } from "./rooms.service";
import { Room } from "./rooms.model";

@WebSocketGateway({
    cors: {
        origin: '*'
    }
})
export class RoomsGateway implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect {
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
    handleCreateRoom(client: Socket, payload: any): void {
        console.log('creating a room for client:',client.id)
    }
}