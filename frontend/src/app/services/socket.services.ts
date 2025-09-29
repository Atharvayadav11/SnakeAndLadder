import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { GameService } from './game-state.services';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;
  private gameService = inject(GameService);
  roomId!: string;

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

  createRoom(playerName: string) {
    this.socket.emit('createRoom', { playerName });
  }

  joinRoom(roomId: string, playerName: string) {
    this.socket.emit('joinRoom', { roomId, playerName });
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

 
  onError(): Observable<any> {
    return this.on('error');
  }

  rollDice(){
    this.emit('rollDice',{playerId: "123", roomId: this.roomId});
  }

}