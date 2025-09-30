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
  private users!: GameState;
  private moveCallbacks: ((playerId: string, val: number) => void)[] = [];
  
  diceValue = signal<number | null>(null);
  currentUser = signal<string | null>(null);

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

    // Initialize users map
    this.users = {
      Users: new Map<string, UserModel>(),
      winner: '',
      currentUserToPlay: '',
      isGameStarted: false,
      isGameFinished: false,
      maxUsers: 4,
      usersInQueue: []
    };

    this.socket.on('connect', () => {
      console.log('Connected to socket server:', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    this.socket.on('diceRolled', (data) => {
      console.log('Dice rolled event received:', data);

      const usersMap = new Map<string, UserModel>(Object.entries(data.GameData.Users));
      const { val, playerId } = data;
      
      this.users = {
        Users: usersMap,
        winner: data.GameData.winner || '',
        currentUserToPlay: data.GameData.currentUserToPlay || '',
        isGameStarted: data.GameData.isGameStarted || false,
        isGameFinished: data.GameData.isGameFinished || false,
        maxUsers: data.GameData.maxUsers || 4,
        usersInQueue: data.GameData.usersInQueue || []
      };

      this.diceValue.set(val);
      if(val != 6){
        this.currentUser.set(data.GameData.usersInQueue[0]);
      }
      

      this.moveCallbacks.forEach(cb => cb(playerId, val));
    });

    this.socket.on('roomCreated', (data: any) => {
      console.log('Room created:', data);
      
      this.currentRoomIdSubject.next(data.roomId);
      this.playersSubject.next(data.room.players);
      this.isInRoomSubject.next(true);

      // Initialize game state
      const usersMap = new Map<string, UserModel>(Object.entries(data.gameState));
      this.users = {
        Users: usersMap,
        winner: '',
        currentUserToPlay: '',
        isGameStarted: false,
        isGameFinished: false,
        maxUsers: 4,
        usersInQueue: Object.keys(data.gameState)
      };

      const newUserId = Object.keys(data.gameState)[0];
      this.currentUser.set(newUserId);
      this.userService.setLocalUser(newUserId);
      this.userService.setRoomId(data.roomId);

      console.log('Room created - User ID:', newUserId, 'Room ID:', data.roomId);
    });

    this.socket.on('joinedRoom', (data: any) => {
      console.log('Joined room:', data);
      
      this.currentRoomIdSubject.next(data.roomId);
      this.playersSubject.next(data.room.players);
      this.isInRoomSubject.next(true);

      // Initialize game state
      const usersMap = new Map<string, UserModel>(Object.entries(data.gameState));
      this.users = {
        Users: usersMap,
        winner: '',
        currentUserToPlay: data.currentUser || '',
        isGameStarted: false,
        isGameFinished: false,
        maxUsers: 4,
        usersInQueue: Object.keys(data.gameState)
      };

      const newUserId = data.joinedUser;
      this.currentUser.set(data.currentUser);
      this.userService.setLocalUser(newUserId);
      this.userService.setRoomId(data.roomId);

      console.log('Joined room - User ID:', newUserId, 'Current turn:', data.currentUser);
    });

    this.socket.on('playerJoined', (data: any) => {
      console.log('Player joined:', data);
      this.playersSubject.next(data.players);
    });

    this.socket.on('gameStarted', (data: any) => {
      console.log('Game started event:', data);
      
      if (data.gameState) {
        const usersMap = new Map<string, UserModel>(Object.entries(data.gameState.Users));
        this.users = {
          Users: usersMap,
          winner: data.gameState.winner || '',
          currentUserToPlay: data.gameState.currentUserToPlay || '',
          isGameStarted: true,
          isGameFinished: false,
          maxUsers: data.gameState.maxUsers || 4,
          usersInQueue: data.gameState.usersInQueue || []
        };
        
        this.currentUser.set(data.gameState.usersInQueue[0]);
      }
    });

    this.socket.on('availableColors', (payload: any) => {
      console.log('Available colors:', payload);
      this.availableColorsSubject.next(payload?.colors || []);
    });

    this.socket.on('colorSelected', (payload: any) => {
      console.log('Color selected:', payload);
      if (payload?.playerId === this.socket.id) {
        this.selectedColorSubject.next(payload.color);
      }
    });

    this.socket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });
  }

  emit(event: string, data?: any) {
    console.log(`Emitting ${event}:`, data);
    this.socket.emit(event, data);
  }

  on<T>(event: string): Observable<T> {
    return new Observable(observer => {
      this.socket.on(event, (data: T) => {
        console.log(`Event ${event} received:`, data);
        observer.next(data);
      });
    });
  }

  createRoom(playerName: string, roomId?: string) {
    this.socket.emit('createRoom', { playerName, roomId });
  }

  joinRoom(roomId: string, playerName: string) {
    this.socket.emit('joinRoom', { roomId, playerName });
  }

  startGame(roomId: string, playerId: string) {
    console.log('Starting game:', { roomId, playerId });
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

  getCurrentRoomId(): string {
    return this.currentRoomIdSubject.getValue();
  }

  getPlayers(): string[] {
    return this.playersSubject.getValue();
  }

  getIsInRoom(): boolean {
    return this.isInRoomSubject.getValue();
  }

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
    const localUser = this.userService.localUser();
    const roomId = this.userService.roomId();
    
    console.log('Rolling dice:', { playerId: localUser, roomId });
    this.socket.emit('rollDice', { playerId: localUser, roomId });
  }

  getUsers(): IterableIterator<[string, UserModel]> {
    return this.users.Users.entries();
  }

  getUser(playerId: string): UserModel | undefined {
    return this.users.Users.get(playerId);
  }

  updateUserPosition(playerId: string, newPos: number) {
    const user = this.users.Users.get(playerId);
    if (user) {
      user.currentPosition = newPos;
      this.users.Users.set(playerId, user);
      console.log(`Updated ${playerId} position to ${newPos}`);
    }
  }

  onMove(callback: (playerId: string, val: number) => void) {
    this.moveCallbacks.push(callback);
  }

  getUsersMap(): Map<string, UserModel> {
    return this.users.Users;
  }

  getGameState(): GameState {
    return this.users;
  }
}