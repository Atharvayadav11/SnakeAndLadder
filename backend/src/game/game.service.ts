import { Injectable } from "@nestjs/common";
import { GameStateModel } from "../models/gameState";

@Injectable()
export class GameService {
   private gameState: Map<string, GameStateModel> = new Map();
   private LADDERS: { [key: number]: number } = {5: 58,14: 49,42: 60,53: 72,64: 83,75: 94};
   private SNAKES: { [key: number]: number } = {38: 20,45: 7,51: 10,65: 54,91: 73,97: 61};

   onStartGame(roomId: string, playerId: string) {
      const gameState = this.gameState.get(roomId);
      if (gameState && gameState.Users.get(playerId)!.isAnAdmin) {
         gameState.isGameStarted = true;
      }
      else
         throw new Error("Only Admin can start the game.")
   }

   onRollDice(playerId: string, roomId: string): number {
      const state = this.gameState.get(roomId);
      if (!state) {
         throw new Error(`Room ${roomId} not found`);
      }

      const val = this.rollDiceValue();
      this.movePlayer(playerId, roomId, val);

      // If val not 6 then nextUser
      if (val !== 6) {
         state.usersInQueue = this.rotateQueue(state.usersInQueue);
         state.currentUserToPlay = state.usersInQueue[0];
      }

      return val;
   }

   movePlayer(playerId: string, roomId: string, val: number) {
      let state = this.gameState.get(roomId);
      if (!state) {
         throw new Error(`Room ${roomId} not found`);
      }

      let currPlayer = state.Users.get(playerId);
      if (!currPlayer) {
         throw new Error(`Player ${playerId} not found in room ${roomId}`);
      }

      // Beginning
      if (currPlayer.currentPosition === 0 && val != 6)
         return;

      let nextPos = currPlayer.currentPosition + val;
      
      // Winner
      if (nextPos === 100)
         this.onWinGame(playerId, roomId);

      // Ladder and Snakes
      if (nextPos in this.LADDERS) {
         nextPos = this.LADDERS[nextPos];
      }
      else if (nextPos in this.SNAKES) {
         nextPos = this.SNAKES[nextPos];
      }

      // Update state
      currPlayer.currentPosition = nextPos;
      state.Users.set(playerId, currPlayer);
      this.gameState.set(roomId, state);
   }

   onWinGame(playerId: string, roomId: string) {
      this.gameState.get(roomId)!.winner = playerId;
      this.gameState.get(roomId)!.isGameFinished = true;
   }

   getGameState(roomId: string) {
      return this.gameState.get(roomId)!;
   }

   private rollDiceValue(): number {
      return Math.floor(Math.random() * 6) + 1;
   }

   private rotateQueue(queue: string[]): string[] {
      if (queue.length === 0) return queue;
      const [first, ...rest] = queue;
      return [...rest, first];
   }
}