import { Injectable } from "@angular/core";
import {io,Socket} from 'socket.io-client';
import { SocketService } from "../services/socket.services";    
import { BoardService } from "../board/board.services";

@Injectable({providedIn:'root'})
export class HomeService {
    private socket:Socket;
    constructor(private socketService: SocketService){
        this.socket = this.socketService.getSocket();
    }

    

}