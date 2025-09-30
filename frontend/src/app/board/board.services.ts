import {io,Socket} from 'socket.io-client';
import { SocketService } from "../services/socket.services";    
import { Injectable } from '@angular/core';
import { GameStateModel } from '../models/gameState';

@Injectable({providedIn:'root'})
export class BoardService {
    private socket:Socket;
    constructor(private socketService: SocketService){
        this.socket = this.socketService.getSocket();
    }
    private gameState=new Map<string,GameStateModel>();

    getGameState(roomId:string){
        return this.gameState.get(roomId);
    }
    
}