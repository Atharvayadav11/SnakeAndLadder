import { Injectable, signal } from "@angular/core";
import {io,Socket} from 'socket.io-client';
import { SocketService } from "../services/socket.services";    
import { BoardService } from "../board/board.services";

@Injectable({providedIn:'root'})
export class HomeService {
    localUser = signal("");
    roomId = signal("");

    setLocalUser(userId: string){
        this.localUser.set(userId);
    }

    setRoomId(roomId: string){
        this.roomId.set(roomId);
    }

    private socket:Socket;
    constructor(private socketService: SocketService){
        this.socket = this.socketService.getSocket();
    }

    

}