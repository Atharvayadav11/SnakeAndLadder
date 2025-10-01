import { inject, Injectable, signal } from "@angular/core";
import {io,Socket} from 'socket.io-client';
import { SocketService } from "../services/socket.services";    
import { BoardService } from "../board/board.services";
import { GameStateModel } from '../models/gameState';
import { UserModel } from "../user.model";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable({providedIn:'root'})
export class HomeService {

    private socketService:SocketService;
    private boardService:BoardService;
    private snackBar = inject(MatSnackBar);
    constructor(socketService: SocketService, boardService:BoardService){
        this.socketService = socketService;
        this.boardService = boardService;
        this.socketService.on('roomCreated').subscribe((data: any) => {this.onRoomCreated(data.playerName,data.roomId,data.userId)});
        this.socketService.on('roomJoined').subscribe((data: any) => {this.onRoomJoined(data.roomId,data.playerName,data.userId)});
        this.socketService.on('colorSelected').subscribe((data: any) => {this.onColorSelected(data.userId,data.color)});
        this.socketService.on('availableColors').subscribe((data: any) => {this.onAvailableColors(data.colors)});   
        this.socketService.on('gameStarted').subscribe((data: any) => {this.onGameStarted(data.userId)});
        // this.socketService.on('gameFinished').subscribe((data: any) => {this.onGameFinished(data.userId)});
        this.socketService.on('error').subscribe((data: any) => {this.onError(data.message)});
        
    }

localUser = signal("");
roomId = signal("");
players = signal<string[]>([]);
isInRoom = signal(false);
availableColors = signal<string[]>([]);
selectedColor = signal<string | null>(null);
isPickingColor = signal(false);
showOverlay = signal(false);
isAdmin = signal(false);
message = signal("");
isLoading = signal(false);
loadingMessage = signal("");

    setLocalUser(userId: string){
        this.localUser.set(userId);
    }
    setRoomId(roomId: string){
        this.roomId.set(roomId);
    }
 
 private gameState:GameStateModel={
    Users: new Map<string, UserModel>(),
    winner: '',
    currentUserToPlay: '',
    isGameStarted: false,
    isGameFinished: false,
    maxUsers: 4,
    usersInQueue: [],
    availableColors: ["red","blue","green","yellow"]
 }
 user:UserModel={
    name: '',
    color: '',
    currentPosition: 0,
    isAnAdmin: false,
    isActive: false
 }
 


createRoom(playerName: string, roomId: string,userId: string) {
    this.socketService.emit('createRoom', { playerName, roomId });
  }



joinRoom(roomId: string, playerName: string,userId: string) {
    this.socketService.emit('joinRoom', { roomId, playerName });
  }

selectColor(roomId: string,localUser: string,color: string) {
    this.socketService.emit('selectColor', { roomId, localUser, color });
  }

  startGame(roomId: string,localUser: string) {
    this.socketService.emit('startGame', { roomId, localUser });
  }

// availableColors(roomId: string,localUser: string) {
//     this.socketService.emit('availableColors', { roomId, localUser });
//   }

onAvailableColors(colors: string[]){
    this.availableColors.set(colors);
    this.gameState.availableColors=colors;
    this.boardService.setGameState(this.gameState);
}


onRoomCreated(playerName: string,roomId: string,userId: string){
        this.user.name=playerName;
        this.user.isAnAdmin=true;
        this.user.isActive=true;
        this.gameState.Users.set(userId,this.user); 
        this.gameState.usersInQueue.push(userId);
        this.boardService.setGameState(this.gameState);
        this.isPickingColor.set(true);
        this.isLoading.set(false);
        this.showOverlay.set(true);
        this.message.set(`Room created successfully. ID: ${roomId}`);
        this.snackBar.open(`Room created. ID: ${roomId}`, 'Close', { duration: 3000 });
        this.setLocalUser(userId);
        this.setRoomId(roomId);
    }

onRoomJoined(roomId: string,playerName: string,userId: string){
    this.user.name=playerName;
    this.user.isAnAdmin=false;
    this.user.isActive=true;
    this.gameState.Users.set(userId,this.user); 
    this.gameState.usersInQueue.push(userId);
    this.boardService.setGameState(this.gameState);
    this.isPickingColor.set(true);
    this.showOverlay.set(true);
    this.message.set(`Successfully joined room ${roomId}`);
    this.snackBar.open(`Joined room ${roomId}`, 'Close', { duration: 3000 });
    this.setLocalUser(userId);
    this.setRoomId(roomId);
    }

 onColorSelected(userId: string,color: string){
    this.user.color=color;
    this.gameState.Users.set(userId,this.user); 
    this.gameState.availableColors=this.gameState.availableColors.filter(c=>c!==color);
    this.boardService.setGameState(this.gameState);

    }

// onAvailableColors(colors: string[]){
//     this.gameState.availableColors=colors;
//     this.boardService.setGameState(this.gameState);
// }

 onGameStarted(userId: string){
    this.isLoading.set(false);
    this.isInRoom.set(true);
    this.showOverlay.set(true);
    this.message.set(`Game started`);
    this.gameState.isGameStarted=true;
    this.gameState.currentUserToPlay=userId;
    this.boardService.setGameState(this.gameState);
    return this.roomId();
}

leaveRoom(){
    this.gameState.isGameFinished=true;
    this.gameState.currentUserToPlay='';
    this.boardService.setGameState(this.gameState);
}

onError(message: string){
    this.message.set(message);
    this.isLoading.set(false);
    this.snackBar.open(message, 'Close', { duration: 3000 });
    console.error('Socket error:', message);
}



}