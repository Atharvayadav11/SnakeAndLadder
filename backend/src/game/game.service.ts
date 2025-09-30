import { Injectable } from "@nestjs/common";
import { GameStateModel } from "../models/gameState";

@Injectable()
export class GameService {
   private gameState: Map<string, GameStateModel> = new Map();
   private LADDERS: { [key: number]: number } = {5: 58,14: 49,42: 60,53: 72,64: 83,75: 94};
   private SNAKES: { [key: number]: number } = {38: 20,45: 7,51: 10,65: 54,91: 73,97: 61};

   getGameState(roomId: string) {
      return this.gameState.get(roomId);
   }

   onStartGame(roomId: string, playerId: string) {
      const gameState = this.gameState.get(roomId);
      if (gameState && gameState.Users.get(playerId)!.isAnAdmin) {
        gameState.isGameStarted = true;
      }
      else
         throw new Error("Only Admin can start the game.")
   }

   onRollDice(playerId: string, roomId: string) {
      let val = Math.floor(Math.random() * 6) + 1;
      let state = this.gameState.get(roomId)!;

      // If user does not roll 6 
      if (val != 6) {
         let queue: string[] = state!.usersInQueue;
         let first: string = queue.shift()!;
         queue.push(first);
         state.usersInQueue = queue;
         state.currentUserToPlay = queue[0];
      }

      this.movePlayer(playerId, roomId, val);
      return val;
   }

   movePlayer(playerId: string, roomId: string, val: number) {
      let state = this.gameState.get(roomId)!;
      let currPlayer = state.Users.get(playerId)!;

      // Beginning
      if (currPlayer.currentPosition === 0 && val != 6)
         return;

      let nextPos = currPlayer.currentPosition + val;
      // Winner
      if(nextPos === 100)
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
      state.Users[playerId] = currPlayer;
      this.gameState.set(roomId,state);
   }

   onWinGame(playerId: string, roomId: string) {

   }
}