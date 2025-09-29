import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { UserModel } from '../user.model';


@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;
  private users = new Map<string, UserModel>();

  constructor() {
    this.socket = io('http://localhost:3000');
    this.socket.on('diceRolled', (data) => {
      console.log(data);
    })
  }

  emit(event: string, data?: any){
    this.socket.emit(event, data);
  }

  on<T>(event: string): Observable<T>{
    return new Observable(observer => {
        this.socket.on(event, (data : T) => observer.next(data));
    })
  }

  createRoom(playerName: string, roomId?: string) {
    this.socket.emit('createRoom', { playerName, roomId });
  }
  onGameStarted(): Observable<any> {
    return this.on('gameStarted');
  }
  joinRoom(roomId: string, playerName: string) {
    this.socket.emit('joinRoom', { roomId, playerName });
  }
  startGame(roomId: string, playerId: string) {
    this.socket.emit('startGame', { roomId, playerId });  
  }

  onRoomCreated(): Observable<any> {
    return this.on('roomCreated');
  }

  onRoomJoined(): Observable<any> {
    return this.on('joinedRoom');
  }


  onPlayerJoined(): Observable<any> {
    return this.on('playerJoined');
  }

  onAvailableColors(): Observable<any> {
    return this.on('availableColors');
  }

  onColorSelected(): Observable<any> {
    return this.on('colorSelected');
  }

  selectColor(roomId: string, color: string) {
    this.emit('selectColor', { roomId, color });
  }

 

  onPlayerDisconnect(roomId: string) {
    this.emit('userDisconnected', { roomId });
  }

  onError(): Observable<any> {
    return this.on('error');
  }

  rollDice(){
    console.log("Hello");
    
  }


}