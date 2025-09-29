import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { UserModel } from '../user.model';
import { UserService } from './users.service';


@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;
  private userService = inject(UserService);
  private users = new Map<string, UserModel>();
  private roomId!: string;
  private currentUser !: string;
  private moveCallbacks: ((playerId: string, val: number) => void)[] = [];
  diceValue = signal(4);

  constructor() {
    this.socket = io('http://localhost:3000');
    this.socket.on('diceRolled', (data) => {
      const { val, playerId, nextPlayerId } = data;

      // Update user’s position
      let currUser = this.users.get(playerId);
      if (currUser) {
        currUser.currentPosition = Math.min(currUser.currentPosition + val, 100);
        this.users.set(playerId, currUser);
      }

      // Notify board
      this.moveCallbacks.forEach(cb => cb(playerId, val));
    });

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

  onPlayerDisconnect(roomId: string) {
    this.emit('userDisconnected', { roomId });
  }

  onError(): Observable<any> {
    return this.on('error');
  }

  rollDice(){
    this.socket.emit("rollDice", {playerId: this.currentUser, roomId: this.roomId });
  }

  getUsers() {
    return this.users.entries();
  }

  getUser(playerId: string) {
    return this.users.get(playerId);
  }

  updateUserPosition(playerId: string, newPos: number) {
    let user = this.users.get(playerId);
    if (user) {
      user.currentPosition = newPos;
      this.users.set(playerId, user);
    }
  }

  onMove(callback: (playerId: string, val: number) => void) {
    this.moveCallbacks.push(callback);
  }
}