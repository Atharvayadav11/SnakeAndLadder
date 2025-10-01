import {io,Socket} from 'socket.io-client';
import { SocketService } from "../services/socket.services";    
import { Injectable } from '@angular/core';
import { GameStateModel } from '../models/gameState';
import { UserModel } from '../user.model';

@Injectable({providedIn:'root'})
export class BoardService {
    private socket:Socket;
    constructor(private socketService: SocketService){
        this.socket = this.socketService.getSocket();
    }

    private gameState:GameStateModel={
        Users: new Map<string, UserModel>(),
        winner: '',
        currentUserToPlay: '',
        isGameStarted: false,
        isGameFinished: false,
        maxUsers: 0,
        usersInQueue: [],
        availableColors: []
    }

    setGameState(gameState:GameStateModel){
        this.gameState=gameState;
    }
  

    getGameState(){
        return this.gameState;
    }
    
}