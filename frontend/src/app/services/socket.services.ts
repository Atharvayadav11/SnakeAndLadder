import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { UserModel } from '../user.model';


@Injectable({ providedIn: 'root' })
export class SocketService {


  private socket: Socket;
  private users = new Map<string, UserModel>();
  

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
      console.log(data);
    })

   
    this.socket.on('roomCreated', (data: any) => {
      this.currentRoomIdSubject.next(data.roomId);
      this.playersSubject.next(data.room.players);
      this.isInRoomSubject.next(true);
    
      console.log("Om", JSON.stringify(data.gameState, null, 2));
      console.log(data);

      Object.entries(data.gameState).forEach(([id, user]) => {
        this.users.set(id, user as UserModel);
      });
      console.log("Om2", this.users);


    });

    this.socket.on('joinedRoom', (data: any) => {
      this.currentRoomIdSubject.next(data.roomId);
      this.playersSubject.next(data.room.players);
      this.isInRoomSubject.next(true);
      console.log(data.gameState);
   
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

  rollDice(){
    console.log("Hello");
    
  }

  


}