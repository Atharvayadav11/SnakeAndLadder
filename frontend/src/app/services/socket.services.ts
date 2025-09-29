import { inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { UserModel } from '../user.model';
import { UserService } from './users.service';
import { GameState } from '../game.model';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;
  private userService = inject(UserService);
  private users !: GameState;
  private moveCallbacks: ((playerId: string, val: number) => void)[] = [];
  diceValue = signal(4);

  private currentRoomIdSubject = new BehaviorSubject<string>('');
  currentRoomId$ = this.currentRoomIdSubject.asObservable();

  private playersSubject = new BehaviorSubject<string[]>([]);
  players$ = this.playersSubject.asObservable();

  private isInRoomSubject = new BehaviorSubject<boolean>(false);
  isInRoom$ = this.isInRoomSubject.asObservable();

  private availableColorsSubject = new BehaviorSubject<string[]>([]);
  availableColors$ = this.availableColorsSubject.asObservable();

  private selectedColorSubject = new BehaviorSubject<string | null>(null);
  selectedColor$ = this.selectedColorSubject.asObservable();

  constructor() {
    this.socket = io('http://localhost:3000');

    this.socket.on('diceRolled', (data) => {
      const usersMap = new Map<string, UserModel>(Object.entries(data.GameData.Users));
      const { val, playerId } = data;

      // Assign to gameState variable
      this.users = {
        ...data,
        Users: usersMap,
      };

      this.moveCallbacks.forEach(cb => cb(playerId, val));  
    });

    this.socket.on('roomCreated', (data: any) => {
      this.currentRoomIdSubject.next(data.roomId);
      this.playersSubject.next(data.room.players);
      this.isInRoomSubject.next(true);

      console.log("Om", JSON.stringify(data.gameState, null, 2));
      console.log(data);

      const newUserId = Object.keys(data.gameState)[0];
      console.log("ROom ID" + data.roomId);
      this.userService.setLocalUser(newUserId);
      this.userService.setRoomId(data.roomId);

    });

    this.socket.on('joinedRoom', (data: any) => {
      this.currentRoomIdSubject.next(data.roomId);
      this.playersSubject.next(data.room.players);
      this.isInRoomSubject.next(true);
      const newUserId = Object.keys(data.gameState)[0];
      this.userService.setLocalUser(newUserId);
      console.log("ROom ID" + data.roomId);

      this.userService.setRoomId(data.roomId);
    });

    this.socket.on('playerJoined', (data: any) => {
      this.playersSubject.next(data.players);
    });

    this.socket.on('availableColors', (payload: any) => {
      this.availableColorsSubject.next(payload?.colors || []);
    });

    this.socket.on('colorSelected', (payload: any) => {
      if (payload?.playerId === this.socket.id) {
        this.selectedColorSubject.next(payload.color);
      }
    });
  }

  emit(event: string, data?: any) {
    this.socket.emit(event, data);
  }

  on<T>(event: string): Observable<T> {
    return new Observable(observer => {
      this.socket.on(event, (data: T) => observer.next(data));
    })
  }

  createRoom(playerName: string, roomId?: string) {
    this.socket.emit('createRoom', { playerName, roomId });
  }

  joinRoom(roomId: string, playerName: string) {
    this.socket.emit('joinRoom', { roomId, playerName });
  }

  startGame(roomId: string, playerId: string) {
    this.socket.emit('startGame', { roomId, playerId });
  }

  onGameStarted(): Observable<any> {
    return this.on('gameStarted');
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

  getCurrentRoomId(): string { return this.currentRoomIdSubject.getValue(); }
  getPlayers(): string[] { return this.playersSubject.getValue(); }
  getIsInRoom(): boolean { return this.isInRoomSubject.getValue(); }

  leaveRoom() {
    const roomId = this.getCurrentRoomId();
    if (roomId) {
      this.onPlayerDisconnect(roomId);
    }
    this.currentRoomIdSubject.next('');
    this.playersSubject.next([]);
    this.isInRoomSubject.next(false);
    this.availableColorsSubject.next([]);
    this.selectedColorSubject.next(null);
  }

  getSocketId(): string {
    return this.socket.id ?? '';
  }

  rollDice() {
    console.log(this.userService.localUser());
    console.log(this.userService.roomId());

    this.socket.emit("rollDice", { playerId: this.userService.localUser(), roomId: this.userService.roomId() });
  }

  getUsers() {
    return this.users.Users.entries();
  }

  getUser(playerId: string) {
    return this.users.Users.get(playerId);
  }

  updateUserPosition(playerId: string, newPos: number) {
    let user = this.users.Users.get(playerId);
    if (user) {
      user.currentPosition = newPos;
      this.users.Users.set(playerId, user);
    }
  }

  onMove(callback: (playerId: string, val: number) => void) {
    this.moveCallbacks.push(callback);
  }
}