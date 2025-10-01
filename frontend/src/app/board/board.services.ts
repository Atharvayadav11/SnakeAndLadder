import { io, Socket } from 'socket.io-client';
import { SocketService } from "../services/socket.services";
import { Injectable, signal } from '@angular/core';
import { GameStateModel } from '../models/gameState';
import { UserModel } from '../user.model';
import { HomeService } from '../home/home.services';

@Injectable({ providedIn: 'root' })
export class BoardService {
  private gameState: GameStateModel;
  constructor(private socketService: SocketService) {
    this.gameState = {
      Users: new Map(),
      winner: '',
      currentUserToPlay: '',
      isGameStarted: false,
      isGameFinished: false,
      maxUsers: 4,
      usersInQueue: [],
      availableColors: []
    }
    this.socketService.on<{playerId: string, roomId: string}>('gameWon').subscribe(({playerId, roomId}) => {
      this.gameState.isGameFinished = true;
      this.gameState.winner = playerId;
    })
  };

  private moveCallbacks: ((playerId: string, val: number) => void)[] = [];
  currentUser = signal<string | null>(null);

  getGameState() {
    return this.gameState;
  }

  getUsers(): IterableIterator<[string, UserModel]> {
    return this.gameState.Users.entries();
  }

  getUser(playerId: string): UserModel | undefined {
    return this.gameState.Users.get(playerId);
  }

  getCurrentUser(): string {
    return this.gameState.currentUserToPlay;
  }

  updateUserPosition(playerId: string, newPos: number) {
    const user = this.gameState.Users.get(playerId);
    if (user) {
      user.currentPosition = newPos;
      this.gameState.Users.set(playerId, user);
      console.log(`Updated ${playerId} position to ${newPos}`);
    }
  }

  onMove(callback: (playerId: string, val: number) => void) {
    this.moveCallbacks.push(callback);
  }

  getUsersMap(): Map<string, UserModel> {
    return this.gameState.Users;
  }

  movePlayer(playerId: string, val: number){
    const player = this.gameState.Users.get(playerId);
    if (!player) {
      throw new Error(`Player ${playerId} not found in room`);
    }

    player.currentPosition += val;
    if(val != 6){
      this.gameState.usersInQueue = this.rotateQueue(this.gameState.usersInQueue);
      this.gameState.currentUserToPlay = this.gameState.usersInQueue[0];
    
    this.moveCallbacks.forEach(cb => cb(playerId, val));
  }
}

  isGameEnded(): boolean{
    if(this.gameState.winner && this.gameState.isGameFinished)
      return true;
    return false;
  }

  setGameState(state: GameStateModel){
    this.gameState = state;
  }

  private rotateQueue(queue: string[]): string[] {
      if (queue.length === 0) return queue;
      const [first, ...rest] = queue;
      return [...rest, first];
  }

  // getCurrentRoomId(){
  //   return this.userService.roomId();
  // }

  getPlayersLength(){
    return this.gameState.usersInQueue.length;
  }

}